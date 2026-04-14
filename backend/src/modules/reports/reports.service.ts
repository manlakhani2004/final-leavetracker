import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveApplication } from '../../schemas/leave-application.schema';
import { LeaveBalance } from '../../schemas/leave-balance.schema';
import { LeaveType } from '../../schemas/leave-type.schema';
import { User } from '../../schemas/user.schema';
import { Department } from '../../schemas/department.schema';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(LeaveApplication.name) private leaveAppModel: Model<LeaveApplication>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  // ─── Report L: My Leave Balance Report ───────────────────────────────
  async getMyBalanceReport(userId: string, organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();

    // Lazy initialize balances for all active leave types
    const leaveTypes = await this.leaveTypeModel.find({ organizationId, isActive: true });

    for (const type of leaveTypes) {
      const exists = await this.leaveBalanceModel.findOne({
        userId,
        organizationId,
        year,
        leaveTypeId: type._id,
      });

      if (!exists) {
        try {
          await this.leaveBalanceModel.create({
            userId,
            organizationId,
            leaveTypeId: type._id.toString(),
            year,
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

    const balances = await this.leaveBalanceModel.find({
      userId,
      organizationId,
      year,
    }).populate('leaveTypeId', 'name isPaid carryForwardAllowed carryForwardLimit');

    // Compute summary
    let totalAllocated = 0;
    let totalUsed = 0;
    let totalRemaining = 0;
    let totalCarryForward = 0;

    const byType = balances.map((b) => {
      const allocated = b.totalAllocated + (b.carryForward || 0);
      totalAllocated += allocated;
      totalUsed += b.used;
      totalRemaining += b.remaining;
      totalCarryForward += b.carryForward || 0;

      return {
        leaveType: b.leaveTypeId,
        totalAllocated: b.totalAllocated,
        carryForward: b.carryForward || 0,
        effectiveAllocation: allocated,
        used: b.used,
        remaining: b.remaining,
        utilizationPercent: allocated > 0 ? Math.round((b.used / allocated) * 100) : 0,
      };
    });

    return {
      year,
      summary: {
        totalAllocated,
        totalUsed,
        totalRemaining,
        totalCarryForward,
        overallUtilization: totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0,
      },
      balances: byType,
    };
  }

  // ─── Report M: My Leave History Report ───────────────────────────────
  async getMyHistoryReport(userId: string, organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const matchFilter: any = {
      userId,
      organizationId,
      fromDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      },
    };

    if (query.status) {
      matchFilter.status = query.status;
    }
    if (query.leaveTypeId) {
      matchFilter.leaveTypeId = new Types.ObjectId(query.leaveTypeId);
    }

    const [applications, total] = await Promise.all([
      this.leaveAppModel
        .find(matchFilter)
        .populate('leaveTypeId', 'name isPaid')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.leaveAppModel.countDocuments(matchFilter),
    ]);

    // Compute stats
    const allApps = await this.leaveAppModel.find({
      userId,
      organizationId,
      fromDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      },
    });

    const stats = {
      totalApplications: allApps.length,
      approved: allApps.filter((a) => a.status === 'approved').length,
      rejected: allApps.filter((a) => a.status === 'rejected').length,
      pending: allApps.filter((a) => a.status === 'pending').length,
      cancelled: allApps.filter((a) => a.status === 'cancelled').length,
      totalDaysTaken: allApps
        .filter((a) => a.status === 'approved')
        .reduce((sum, a) => sum + a.totalDays, 0),
    };

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthApps = allApps.filter((a) => {
        const appMonth = new Date(a.fromDate).getMonth();
        return appMonth === i && a.status === 'approved';
      });
      return {
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        monthIndex: i,
        daysTaken: monthApps.reduce((sum, a) => sum + a.totalDays, 0),
        applicationCount: monthApps.length,
      };
    });

    return {
      year,
      stats,
      monthlyBreakdown,
      applications: applications.map((a) => ({
        id: a._id,
        leaveType: a.leaveTypeId,
        fromDate: a.fromDate,
        toDate: a.toDate,
        totalDays: a.totalDays,
        reason: a.reason,
        status: a.status,
        approvedBy: a.approvedBy,
        approvedAt: a.approvedAt,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Report A: Organization Leave Summary ────────────────────────────
  async getOrgSummaryReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(year, 0, 1);
    const endDate = query.endDate
      ? new Date(query.endDate)
      : new Date(year, 11, 31);

    const orgObjectId = new Types.ObjectId(organizationId);

    // Total active employees
    const totalEmployees = await this.userModel.countDocuments({
      organizationId: orgObjectId,
      isActive: true,
    });

    // Leave applications in the date range
    const dateFilter = {
      organizationId: organizationId,
      fromDate: { $gte: startDate, $lte: endDate },
    };

    const allApplications = await this.leaveAppModel.find(dateFilter)
      .populate('leaveTypeId', 'name')
      .populate('userId', 'name email departmentId');

    // Status breakdown
    const statusBreakdown = {
      total: allApplications.length,
      pending: allApplications.filter((a) => a.status === 'pending').length,
      approved: allApplications.filter((a) => a.status === 'approved').length,
      rejected: allApplications.filter((a) => a.status === 'rejected').length,
      cancelled: allApplications.filter((a) => a.status === 'cancelled').length,
    };

    // Total days consumed (approved only)
    const approvedApps = allApplications.filter((a) => a.status === 'approved');
    const totalDaysConsumed = approvedApps.reduce((sum, a) => sum + a.totalDays, 0);

    // Average leaves per employee
    const avgLeavesPerEmployee = totalEmployees > 0
      ? Math.round((totalDaysConsumed / totalEmployees) * 10) / 10
      : 0;

    // Most used leave type
    const leaveTypeUsage: Record<string, { name: string; count: number; days: number }> = {};
    approvedApps.forEach((a) => {
      const typeId = a.leaveTypeId?._id?.toString() || 'unknown';
      const typeName = (a.leaveTypeId as any)?.name || 'Unknown';
      if (!leaveTypeUsage[typeId]) {
        leaveTypeUsage[typeId] = { name: typeName, count: 0, days: 0 };
      }
      leaveTypeUsage[typeId].count++;
      leaveTypeUsage[typeId].days += a.totalDays;
    });

    const leaveTypeStats = Object.values(leaveTypeUsage).sort((a, b) => b.count - a.count);
    const mostUsedLeaveType = leaveTypeStats[0] || null;

    // Approval rate
    const decidedApps = allApplications.filter((a) => a.status === 'approved' || a.status === 'rejected');
    const approvalRate = decidedApps.length > 0
      ? Math.round((statusBreakdown.approved / decidedApps.length) * 100)
      : 0;

    // Average approval turnaround time (in hours)
    const appsWithApproval = allApplications.filter((a) => a.approvedAt && a.createdAt);
    let avgTurnaroundHours = 0;
    if (appsWithApproval.length > 0) {
      const totalHours = appsWithApproval.reduce((sum, a) => {
        const diff = new Date(a.approvedAt).getTime() - new Date(a.createdAt).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgTurnaroundHours = Math.round((totalHours / appsWithApproval.length) * 10) / 10;
    }

    // Monthly trend
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const monthApps = allApplications.filter((a) => {
        const appMonth = new Date(a.fromDate).getMonth();
        return appMonth === i;
      });
      const monthApproved = monthApps.filter((a) => a.status === 'approved');
      return {
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        monthIndex: i,
        totalApplications: monthApps.length,
        approved: monthApproved.length,
        totalDays: monthApproved.reduce((sum, a) => sum + a.totalDays, 0),
      };
    });

    return {
      year,
      dateRange: { startDate, endDate },
      overview: {
        totalEmployees,
        totalApplications: statusBreakdown.total,
        totalDaysConsumed,
        avgLeavesPerEmployee,
        approvalRate,
        avgTurnaroundHours,
        mostUsedLeaveType,
      },
      statusBreakdown,
      leaveTypeStats,
      monthlyTrend,
    };
  }

  // ─── Report I: Team Leave Summary ────────────────────────────────────
  async getTeamSummaryReport(
    userId: string,
    organizationId: string,
    role: string,
    query: ReportQueryDto,
  ) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);
    const userObjectId = new Types.ObjectId(userId);

    // Get team members based on role
    let teamMembers: any[] = [];

    if (role === 'org_admin' || role === 'hr_manager') {
      // Admin/HR see all employees
      teamMembers = await this.userModel
        .find({ organizationId: orgObjectId, isActive: true })
        .populate('departmentId', 'name')
        .select('name email designation departmentId role');
    } else if (role === 'manager') {
      // Manager sees direct reports and themselves
      const directReports = await this.userModel
        .find({ managerId: userObjectId, organizationId: orgObjectId, isActive: true })
        .populate('departmentId', 'name')
        .select('name email designation departmentId role');
      
      const managerProfile = await this.userModel.findById(userObjectId)
        .populate('departmentId', 'name')
        .select('name email designation departmentId role');
      
      teamMembers = [...directReports, managerProfile].filter(Boolean);
    }

    const teamMemberIds = teamMembers.map((m) => m._id);

    // Initialize leave balances for all team members
    const leaveTypes = await this.leaveTypeModel.find({ organizationId: organizationId, isActive: true });
    
    for (const member of teamMembers) {
      for (const type of leaveTypes) {
        const exists = await this.leaveBalanceModel.findOne({
          userId: member._id,
          organizationId: orgObjectId,
          year,
          leaveTypeId: type._id,
        });

        if (!exists) {
          try {
            await this.leaveBalanceModel.create({
              userId: member._id,
              organizationId: orgObjectId,
              leaveTypeId: type._id,
              year,
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
    }

    // Get all leave applications for team in given year
    const teamApplications = await this.leaveAppModel.find({
      userId: { $in: teamMemberIds.map(id => id.toString()) },  // Convert to string for leave applications
      organizationId: organizationId,
      fromDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      },
    }).populate('leaveTypeId', 'name');

    // Per-member summary
    const memberSummaries = await Promise.all(
      teamMembers.map(async (member) => {
        const memberApps = teamApplications.filter(
          (a) => a.userId.toString() === member._id.toString(),
        );

        const approved = memberApps.filter((a) => ['hr_approved', 'approved'].includes(a.status));
        const pending = memberApps.filter((a) => ['pending', 'manager_approved'].includes(a.status));
        const totalDaysTaken = approved.reduce((sum, a) => sum + a.totalDays, 0);

        // Get leave balances for this member
        const balances = await this.leaveBalanceModel
          .find({
            userId: member._id,  // Leave balances store userId as ObjectId
            organizationId: orgObjectId,  // Leave balances store organizationId as ObjectId
            year,
          })
          .populate('leaveTypeId', 'name');

        const totalAllocated = balances.reduce(
          (sum, b) => sum + b.totalAllocated + (b.carryForward || 0),
          0,
        );
        const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0);

        return {
          member: {
            id: member._id,
            name: member.name,
            email: member.email,
            designation: member.designation,
            department: member.departmentId,
          },
          totalApplications: memberApps.length,
          approvedCount: approved.length,
          pendingCount: pending.length,
          totalDaysTaken,
          totalAllocated,
          totalRemaining,
          balances: balances.map((b) => ({
            leaveType: b.leaveTypeId,
            allocated: b.totalAllocated + (b.carryForward || 0),
            used: b.used,
            remaining: b.remaining,
          })),
        };
      }),
    );

    // Team-wide stats
    const teamStats = {
      teamSize: teamMembers.length,
      totalApplications: teamApplications.length,
      totalApproved: teamApplications.filter((a) => a.status === 'approved').length,
      totalPending: teamApplications.filter((a) => a.status === 'pending').length,
      totalDaysConsumed: teamApplications
        .filter((a) => a.status === 'approved')
        .reduce((sum, a) => sum + a.totalDays, 0),
      avgDaysPerMember:
        teamMembers.length > 0
          ? Math.round(
              (teamApplications
                .filter((a) => a.status === 'approved')
                .reduce((sum, a) => sum + a.totalDays, 0) /
                teamMembers.length) *
                10,
            ) / 10
          : 0,
    };

    // On leave today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const onLeaveToday = await this.leaveAppModel
      .find({
        userId: { $in: teamMemberIds },
        organizationId: organizationId,
        status: 'approved',
        fromDate: { $lte: today },
        toDate: { $gte: today },
      })
      .populate('userId', 'name email designation')
      .populate('leaveTypeId', 'name');

    return {
      year,
      teamStats,
      onLeaveToday: onLeaveToday.map((l) => ({
        employee: l.userId,
        leaveType: l.leaveTypeId,
        fromDate: l.fromDate,
        toDate: l.toDate,
        totalDays: l.totalDays,
      })),
      members: memberSummaries,
    };
  }
}
