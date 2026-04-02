import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveApplication } from '../../schemas/leave-application.schema';
import { User } from '../../schemas/user.schema';
import { LeaveBalance } from '../../schemas/leave-balance.schema';

import { LeaveType } from '../../schemas/leave-type.schema';
import { Department } from '../../schemas/department.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(LeaveApplication.name) private leaveAppModel: Model<LeaveApplication>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async getSummary(userId: string, organizationId: string, role: string) {
    const currentYear = new Date().getFullYear();
    
    // Lazy initialize missing balances for active leave types
    const leaveTypes = await this.leaveTypeModel.find({ organizationId, isActive: true });
    
    for (const type of leaveTypes) {
      const exists = await this.leaveBalanceModel.findOne({ 
        userId, 
        organizationId, 
        year: currentYear, 
        leaveTypeId: type._id
      });
      
      if (!exists) {
        try {
          await this.leaveBalanceModel.create({
            userId,
            organizationId,
            leaveTypeId: type._id.toString(),
            year: currentYear,
            totalAllocated: type.totalDaysAllowed,
            used: 0,
            carryForward: 0,
            remaining: type.totalDaysAllowed,
          });
        } catch (error: any) {
          if (error.code !== 11000) throw error;
        }
      }
    }

    // Get my leave balances
    const balances = await this.leaveBalanceModel.find({
      userId,
      organizationId,
      year: currentYear,
    }).populate('leaveTypeId', 'name isPaid');

    let totalAllocated = 0;
    let totalUsed = 0;
    let totalRemaining = 0;

    balances.forEach(balance => {
      totalAllocated += balance.totalAllocated + (balance.carryForward || 0);
      totalUsed += balance.used;
      totalRemaining += balance.remaining;
    });

    // Get pending applications
    const pendingCount = await this.leaveAppModel.countDocuments({
      userId,
      organizationId,
      status: 'pending',
    });

    // Get upcoming leaves
    const today = new Date();
    const upcomingLeaves = await this.leaveAppModel.find({
      userId,
      organizationId,
      status: 'approved',
      fromDate: { $gte: today },
    })
      .populate('leaveTypeId', 'name')
      .sort({ fromDate: 1 })
      .limit(3);

    return {
      balances: {
        totalAllocated,
        totalUsed,
        totalRemaining,
        byType: balances.reduce((acc: any[], b) => {
          const typeId = b.leaveTypeId?._id?.toString() || b.leaveTypeId?.id?.toString();
          if (!acc.find(item => (item.leaveType?._id?.toString() || item.leaveType?.id?.toString()) === typeId)) {
            acc.push({
              leaveType: b.leaveTypeId,
              allocated: b.totalAllocated + (b.carryForward || 0),
              used: b.used,
              remaining: b.remaining,
            });
          }
          return acc;
        }, [] as any[]),
      },
      pendingApplications: pendingCount,
      upcomingLeaves,
    };
  }

  async getTeamSummary(userId: string, organizationId: string, role?: string) {
    const isSpecialRole = role === 'org_admin' || role === 'hr_manager';
    
    // Check if user is a department head
    const departmentHeadOf = await this.departmentModel.find({
      organizationId: new Types.ObjectId(organizationId),
      headId: new Types.ObjectId(userId)
    });

    const isDepartmentHead = departmentHeadOf.length > 0;
    
    // Get monitored members
    // 1. Entire org for Admin/HR
    // 2. Department members if Department Head
    // 3. Direct team members if regular manager
    let monitoredMembers: any[] = [];
    
    if (isSpecialRole) {
      monitoredMembers = await this.userModel.find({ organizationId, isActive: true });
    } else if (isDepartmentHead) {
      const deptIds = departmentHeadOf.map(d => d._id);
      monitoredMembers = await this.userModel.find({
        organizationId,
        isActive: true,
        $or: [
          { managerId: userId },
          { departmentId: { $in: deptIds } }
        ]
      });
    } else {
      monitoredMembers = await this.userModel.find({
        organizationId,
        isActive: true,
        managerId: userId
      });
    }

    const monitoredMemberIds = monitoredMembers.map(m => m._id);

    // Get members on leave today from monitored group
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const onLeaveToday = await this.leaveAppModel.find({
      userId: { $in: monitoredMemberIds },
      organizationId,
      status: 'approved',
      fromDate: { $lte: today },
      toDate: { $gte: today },
    }).populate('userId', 'name email department');

    // Get pending approvals for monitored group
    const pendingApprovals = await this.leaveAppModel.find({
      userId: { $in: monitoredMemberIds },
      organizationId,
      status: 'pending',
    })
      .populate('userId', 'name email department')
      .populate('leaveTypeId', 'name')
      .sort({ createdAt: -1 });

    return {
      isDepartmentHead,
      departmentsManaged: departmentHeadOf.map(d => ({ id: d._id, name: d.name })),
      teamSize: monitoredMembers.length,
      onLeaveToday: onLeaveToday.map(l => ({
        employee: l.userId,
        leaveType: l.leaveTypeId,
        fromDate: l.fromDate,
        toDate: l.toDate,
        totalDays: l.totalDays,
      })),
      pendingApprovals: pendingApprovals.map(l => ({
        id: l._id,
        employee: l.userId,
        leaveType: l.leaveTypeId,
        fromDate: l.fromDate,
        toDate: l.toDate,
        totalDays: l.totalDays,
        reason: l.reason,
        createdAt: l.createdAt,
      })),
    };
  }

  async getOrgSummary(organizationId: string) {
    const currentYear = new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    // Total employees (users store organizationId as ObjectId)
    const totalEmployees = await this.userModel.countDocuments({
      organizationId: orgObjectId,
      isActive: true,
    });

    // Leave types count
    const leaveTypesCount = await this.leaveTypeModel.countDocuments({
      organizationId: organizationId,  // Leave types store organizationId as string
      isActive: true,
    });

    // Leave applications by status (leave applications store organizationId as string)
    const pendingCount = await this.leaveAppModel.countDocuments({
      organizationId: organizationId,
      status: 'pending',
    });

    const approvedCount = await this.leaveAppModel.countDocuments({
      organizationId: organizationId,
      status: 'approved',
      fromDate: { $gte: new Date(currentYear, 0, 1) },
    });

    const rejectedCount = await this.leaveAppModel.countDocuments({
      organizationId: organizationId,
      status: 'rejected',
      fromDate: { $gte: new Date(currentYear, 0, 1) },
    });

    // Employees on leave today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const onLeaveToday = await this.leaveAppModel.find({
      organizationId: organizationId,
      status: 'approved',
      fromDate: { $lt: tomorrow },  // Leave starts before tomorrow
      toDate: { $gte: today },     // Leave ends after or at today
    }).populate('userId', 'name email');

    // Recent leave applications
    const recentApplications = await this.leaveAppModel.find({ organizationId: organizationId })
      .populate('userId', 'name email department')
      .populate('leaveTypeId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalEmployees,
      leaveTypes: leaveTypesCount,
      leaveStats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      onLeaveToday: onLeaveToday.length,
      onLeaveTodayList: onLeaveToday.map(l => ({
        employee: l.userId,
        fromDate: l.fromDate,
        toDate: l.toDate,
      })),
      recentApplications: recentApplications.map(l => ({
        id: l._id,
        employee: l.userId,
        leaveType: l.leaveTypeId,
        status: l.status,
        fromDate: l.fromDate,
        toDate: l.toDate,
        createdAt: l.createdAt,
      })),
    };
  }

  async getChartData(organizationId: string) {
    const today = new Date();
    
    // Use UTC dates to avoid timezone issues
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() - i, 1));
      return {
        month: d.toLocaleString('default', { month: 'short', timeZone: 'UTC' }),
        year: d.getUTCFullYear(),
        monthNum: d.getUTCMonth(),
      };
    }).reverse();

    // Monthly trends - use UTC for consistent date filtering
    const startOfMonth = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() - 5, 1));
    
    const monthlyStats = await this.leaveAppModel.aggregate([
      {
        $match: {
          organizationId: organizationId,  // Use string instead of ObjectId
          fromDate: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$fromDate' },
            year: { $year: '$fromDate' },
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
        },
      },
    ]);

    const trendData = last6Months.map(m => {
      const stat = monthlyStats.find(s => s._id.month === (m.monthNum + 1) && s._id.year === m.year);
      return {
        name: m.month,
        Total: stat?.count || 0,
        Approved: stat?.approved || 0,
      };
    });

    // Department breakdown
    const deptStats = await this.userModel.aggregate([
      {
        $match: {
          organizationId: organizationId,  // Use string instead of ObjectId
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      {
        $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true },
      },
    ]);

    const departmentData = deptStats.map(d => ({
      name: d.deptInfo?.name || 'Unassigned',
      Members: d.count,
    })).sort((a, b) => b.Members - a.Members);

    return {
      monthlyTrend: trendData,
      departmentBreakdown: departmentData,
    };
  }
}
