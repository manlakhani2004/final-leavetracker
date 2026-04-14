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

  // ─── Report B: Department-wise Leave Report ───────────────────────────
  async getDepartmentWiseReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(year, 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date(year, 11, 31);
    const orgObjectId = new Types.ObjectId(organizationId);

    // Get all departments in the org
    const departments = await this.departmentModel.find({ organizationId: orgObjectId });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        // Get all active users in this department
        const deptUsers = await this.userModel.find({
          organizationId: orgObjectId,
          departmentId: dept._id,
          isActive: true,
        }).select('_id name');

        const userIds = deptUsers.map((u) => u._id.toString());
        const headcount = deptUsers.length;

        if (headcount === 0) {
          return {
            department: { id: dept._id, name: dept.name },
            headcount: 0,
            totalApplications: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalDaysTaken: 0,
            avgDaysPerEmployee: 0,
            leaveTypeBreakdown: [],
          };
        }

        const filter: any = {
          userId: { $in: userIds },
          organizationId: organizationId,
          fromDate: { $gte: startDate, $lte: endDate },
        };
        if (query.leaveTypeId) {
          filter.leaveTypeId = new Types.ObjectId(query.leaveTypeId);
        }

        const apps = await this.leaveAppModel
          .find(filter)
          .populate('leaveTypeId', 'name');

        const approvedApps = apps.filter((a) => ['approved', 'hr_approved'].includes(a.status));
        const totalDaysTaken = approvedApps.reduce((sum, a) => sum + a.totalDays, 0);

        // Leave type breakdown
        const typeMap: Record<string, { name: string; count: number; days: number }> = {};
        approvedApps.forEach((a) => {
          const typeId = a.leaveTypeId?._id?.toString() || 'unknown';
          const typeName = (a.leaveTypeId as any)?.name || 'Unknown';
          if (!typeMap[typeId]) typeMap[typeId] = { name: typeName, count: 0, days: 0 };
          typeMap[typeId].count++;
          typeMap[typeId].days += a.totalDays;
        });

        return {
          department: { id: dept._id, name: dept.name },
          headcount,
          totalApplications: apps.length,
          approved: approvedApps.length,
          pending: apps.filter((a) => ['pending', 'manager_approved'].includes(a.status)).length,
          rejected: apps.filter((a) => a.status === 'rejected').length,
          totalDaysTaken,
          avgDaysPerEmployee: headcount > 0 ? Math.round((totalDaysTaken / headcount) * 10) / 10 : 0,
          leaveTypeBreakdown: Object.values(typeMap).sort((a, b) => b.days - a.days),
        };
      }),
    );

    // Sort by totalDaysTaken desc
    departmentStats.sort((a, b) => b.totalDaysTaken - a.totalDaysTaken);

    const totalDaysOrg = departmentStats.reduce((s, d) => s + d.totalDaysTaken, 0);

    return {
      year,
      dateRange: { startDate, endDate },
      totalDepartments: departments.length,
      totalDaysOrg,
      departments: departmentStats,
    };
  }

  // ─── Report D: Monthly Trend Analysis ────────────────────────────────
  async getMonthlyTrendReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    // Get all leave types for this org
    const leaveTypes = await this.leaveTypeModel.find({
      organizationId: organizationId,
      isActive: true,
    }).select('_id name');

    // Fetch all approved apps for the year
    const filter: any = {
      organizationId: organizationId,
      status: { $in: ['approved', 'hr_approved'] },
      fromDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
    };
    if (query.leaveTypeId) {
      filter.leaveTypeId = new Types.ObjectId(query.leaveTypeId);
    }

    const approvedApps = await this.leaveAppModel.find(filter).populate('leaveTypeId', 'name');

    // Build monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthApps = approvedApps.filter((a) => new Date(a.fromDate).getMonth() === i);
      const totalDays = monthApps.reduce((sum, a) => sum + a.totalDays, 0);
      const applicationCount = monthApps.length;

      // per-leaveType breakdown for this month
      const typeBreakdown: Record<string, { name: string; days: number; count: number }> = {};
      monthApps.forEach((a) => {
        const typeId = a.leaveTypeId?._id?.toString() || 'unknown';
        const typeName = (a.leaveTypeId as any)?.name || 'Unknown';
        if (!typeBreakdown[typeId]) typeBreakdown[typeId] = { name: typeName, days: 0, count: 0 };
        typeBreakdown[typeId].days += a.totalDays;
        typeBreakdown[typeId].count++;
      });

      return {
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        monthFull: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
        monthIndex: i,
        totalDays,
        applicationCount,
        byLeaveType: Object.entries(typeBreakdown).map(([id, v]) => ({ id, ...v })),
      };
    });

    // Peak month
    const peakMonth = [...monthlyData].sort((a, b) => b.totalDays - a.totalDays)[0];

    // Year-over-year: previous year data
    const prevYearApps = await this.leaveAppModel.find({
      organizationId: organizationId,
      status: { $in: ['approved', 'hr_approved'] },
      fromDate: { $gte: new Date(year - 1, 0, 1), $lte: new Date(year - 1, 11, 31) },
    });

    const prevYearMonthly = Array.from({ length: 12 }, (_, i) => {
      const monthApps = prevYearApps.filter((a) => new Date(a.fromDate).getMonth() === i);
      return {
        monthIndex: i,
        totalDays: monthApps.reduce((sum, a) => sum + a.totalDays, 0),
        applicationCount: monthApps.length,
      };
    });

    return {
      year,
      leaveTypes: leaveTypes.map((lt) => ({ id: lt._id, name: lt.name })),
      monthlyTrend: monthlyData,
      previousYearTrend: prevYearMonthly,
      peakMonth,
      summary: {
        totalDays: monthlyData.reduce((s, m) => s + m.totalDays, 0),
        totalApplications: monthlyData.reduce((s, m) => s + m.applicationCount, 0),
        avgDaysPerMonth: Math.round(monthlyData.reduce((s, m) => s + m.totalDays, 0) / 12 * 10) / 10,
      },
    };
  }

  // ─── Report E: Leave Balance Summary (All Employees) ─────────────────
  async getLeaveBalanceSummaryReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    // Build user filter
    const userFilter: any = { organizationId: orgObjectId, isActive: true };
    if (query.departmentId) {
      userFilter.departmentId = new Types.ObjectId(query.departmentId);
    }

    const users = await this.userModel
      .find(userFilter)
      .populate('departmentId', 'name')
      .select('name email designation departmentId role');

    // Get all leave types
    const leaveTypes = await this.leaveTypeModel.find({
      organizationId: organizationId,
      isActive: true,
    }).select('_id name totalDaysAllowed isPaid carryForwardAllowed');

    // Ensure balances exist for all users × types
    for (const user of users) {
      for (const type of leaveTypes) {
        const exists = await this.leaveBalanceModel.findOne({
          userId: user._id,
          organizationId: orgObjectId,
          year,
          leaveTypeId: type._id,
        });
        if (!exists) {
          try {
            await this.leaveBalanceModel.create({
              userId: user._id,
              organizationId: orgObjectId,
              leaveTypeId: type._id,
              year,
              totalAllocated: type.totalDaysAllowed,
              used: 0,
              carryForward: 0,
              remaining: type.totalDaysAllowed,
            });
          } catch (e: any) {
            if (e.code !== 11000) throw e;
          }
        }
      }
    }

    // Fetch all balances for the org/year in one query
    const allBalances = await this.leaveBalanceModel.find({
      organizationId: orgObjectId,
      year,
    }).populate('leaveTypeId', 'name isPaid');

    const balanceByUser: Record<string, any[]> = {};
    allBalances.forEach((b) => {
      const uid = b.userId.toString();
      if (!balanceByUser[uid]) balanceByUser[uid] = [];
      balanceByUser[uid].push(b);
    });

    const employeeSummaries = users.map((user) => {
      const userBalances = balanceByUser[user._id.toString()] || [];

      // Filter by leaveTypeId if provided
      const filteredBalances = query.leaveTypeId
        ? userBalances.filter(
            (b) => b.leaveTypeId?._id?.toString() === query.leaveTypeId,
          )
        : userBalances;

      const totalAllocated = filteredBalances.reduce((s, b) => s + b.totalAllocated + (b.carryForward || 0), 0);
      const totalUsed = filteredBalances.reduce((s, b) => s + b.used, 0);
      const totalRemaining = filteredBalances.reduce((s, b) => s + b.remaining, 0);
      const isLowBalance = totalRemaining <= 2 && totalAllocated > 0;

      return {
        employee: {
          id: user._id,
          name: user.name,
          email: user.email,
          designation: user.designation,
          department: user.departmentId,
          role: user.role,
        },
        totalAllocated,
        totalUsed,
        totalRemaining,
        utilizationPercent: totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0,
        isLowBalance,
        balances: filteredBalances.map((b) => ({
          leaveType: b.leaveTypeId,
          totalAllocated: b.totalAllocated,
          carryForward: b.carryForward || 0,
          effectiveAllocation: b.totalAllocated + (b.carryForward || 0),
          used: b.used,
          remaining: b.remaining,
        })),
      };
    });

    // Sort by remaining asc (lowest first for alerts)
    employeeSummaries.sort((a, b) => a.totalRemaining - b.totalRemaining);

    const zeroBalance = employeeSummaries.filter((e) => e.totalRemaining === 0).length;
    const lowBalance = employeeSummaries.filter((e) => e.isLowBalance).length;

    return {
      year,
      leaveTypes: leaveTypes.map((lt) => ({ id: lt._id, name: lt.name, isPaid: lt.isPaid })),
      summary: {
        totalEmployees: users.length,
        zeroBalanceCount: zeroBalance,
        lowBalanceCount: lowBalance,
        avgUtilization:
          employeeSummaries.length > 0
            ? Math.round(
                employeeSummaries.reduce((s, e) => s + e.utilizationPercent, 0) /
                  employeeSummaries.length,
              )
            : 0,
      },
      employees: employeeSummaries,
    };
  }

  // ─── Report K: Team Leave History ─────────────────────────────────────
  async getTeamHistoryReport(
    userId: string,
    organizationId: string,
    role: string,
    query: ReportQueryDto,
  ) {
    const year = query.year || new Date().getFullYear();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const orgObjectId = new Types.ObjectId(organizationId);
    const userObjectId = new Types.ObjectId(userId);

    // Determine team scope
    let teamMemberIds: string[] = [];
    if (role === 'org_admin' || role === 'hr_manager') {
      const members = await this.userModel
        .find({ organizationId: orgObjectId, isActive: true })
        .select('_id');
      teamMemberIds = members.map((m) => m._id.toString());
    } else if (role === 'manager') {
      const directs = await this.userModel
        .find({ managerId: userObjectId, organizationId: orgObjectId, isActive: true })
        .select('_id');
      teamMemberIds = [...directs.map((m) => m._id.toString()), userId];
    }

    // Build filter
    const filter: any = {
      userId: { $in: teamMemberIds },
      organizationId: organizationId,
      fromDate: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      },
    };
    if (query.status) filter.status = query.status;
    if (query.leaveTypeId) filter.leaveTypeId = new Types.ObjectId(query.leaveTypeId);
    // Employee name filter handled client‑side (userId is passed as query param by name search)

    const [applications, total] = await Promise.all([
      this.leaveAppModel
        .find(filter)
        .populate('userId', 'name email designation departmentId')
        .populate('leaveTypeId', 'name isPaid')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.leaveAppModel.countDocuments(filter),
    ]);

    // Stats over entire team (no pagination)
    const allTeamApps = await this.leaveAppModel.find({
      userId: { $in: teamMemberIds },
      organizationId: organizationId,
      fromDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
    });

    const stats = {
      totalApplications: allTeamApps.length,
      approved: allTeamApps.filter((a) => ['approved', 'hr_approved'].includes(a.status)).length,
      rejected: allTeamApps.filter((a) => a.status === 'rejected').length,
      pending: allTeamApps.filter((a) => ['pending', 'manager_approved'].includes(a.status)).length,
      cancelled: allTeamApps.filter((a) => a.status === 'cancelled').length,
      totalDaysTaken: allTeamApps
        .filter((a) => ['approved', 'hr_approved'].includes(a.status))
        .reduce((sum, a) => sum + a.totalDays, 0),
    };

    return {
      year,
      stats,
      applications: applications.map((a) => ({
        id: a._id,
        employee: a.userId,
        leaveType: a.leaveTypeId,
        fromDate: a.fromDate,
        toDate: a.toDate,
        totalDays: a.totalDays,
        status: a.status,
        reason: a.reason,
        rejectionReason: a.rejectionReason,
        approvedBy: a.approvedBy,
        approvedAt: a.approvedAt,
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

  // ─── Report G: Absenteeism Report ────────────────────────────────────
  async getAbsenteeismReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(year, 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date(year, 11, 31);
    const orgObjectId = new Types.ObjectId(organizationId);

    const userFilter: any = { organizationId: orgObjectId, isActive: true };
    if (query.departmentId) {
      userFilter.departmentId = new Types.ObjectId(query.departmentId);
    }

    const users = await this.userModel
      .find(userFilter)
      .populate('departmentId', 'name')
      .select('name email designation departmentId');

    const threshold = query.threshold ? Number(query.threshold) : 0;

    const appFilter: any = {
      organizationId: organizationId,
      status: { $in: ['approved', 'hr_approved'] },
      fromDate: { $gte: startDate, $lte: endDate },
    };
    if (query.leaveTypeId) {
      appFilter.leaveTypeId = new Types.ObjectId(query.leaveTypeId);
    }

    const allApps = await this.leaveAppModel
      .find(appFilter)
      .populate('leaveTypeId', 'name');

    const employeeStats = users.map((user) => {
      const userApps = allApps.filter((a) => a.userId.toString() === user._id.toString());

      // Most common leave type
      const typeCount: Record<string, { name: string; count: number }> = {};
      userApps.forEach((a) => {
        const typeId = a.leaveTypeId?._id?.toString() || 'unknown';
        const typeName = (a.leaveTypeId as any)?.name || 'Unknown';
        if (!typeCount[typeId]) typeCount[typeId] = { name: typeName, count: 0 };
        typeCount[typeId].count++;
      });
      const mostCommonType = Object.values(typeCount).sort((a, b) => b.count - a.count)[0] || null;

      // Day-of-week pattern: count Mondays (1) and Fridays (5)
      let mondayCount = 0;
      let fridayCount = 0;
      userApps.forEach((a) => {
        const day = new Date(a.fromDate).getDay();
        if (day === 1) mondayCount++;
        if (day === 5) fridayCount++;
      });

      const totalDays = userApps.reduce((sum, a) => sum + a.totalDays, 0);
      const instanceCount = userApps.length;

      return {
        employee: {
          id: user._id,
          name: user.name,
          email: user.email,
          designation: user.designation,
          department: user.departmentId,
        },
        totalDaysAbsent: totalDays,
        leaveInstances: instanceCount,
        mostCommonLeaveType: mostCommonType,
        mondayLeaves: mondayCount,
        fridayLeaves: fridayCount,
        patternFlag: mondayCount + fridayCount >= 3,
      };
    });

    const filtered = threshold > 0
      ? employeeStats.filter((e) => e.totalDaysAbsent >= threshold)
      : employeeStats;

    filtered.sort((a, b) => b.totalDaysAbsent - a.totalDaysAbsent);

    const totalOrg = filtered.reduce((s, e) => s + e.totalDaysAbsent, 0);
    const avgPerEmployee = filtered.length > 0
      ? Math.round((totalOrg / filtered.length) * 10) / 10
      : 0;

    return {
      year,
      dateRange: { startDate, endDate },
      summary: {
        totalEmployees: filtered.length,
        totalAbsentDays: totalOrg,
        avgAbsentDaysPerEmployee: avgPerEmployee,
        flaggedEmployees: filtered.filter((e) => e.patternFlag).length,
      },
      employees: filtered,
    };
  }

  // ─── Report F: Approval Turnaround Report ─────────────────────────────
  async getApprovalTurnaroundReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(year, 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date(year, 11, 31);

    const filter: any = {
      organizationId: organizationId,
      fromDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['approved', 'hr_approved', 'rejected'] },
    };
    if (query.status && ['approved', 'rejected'].includes(query.status)) {
      filter.status = query.status;
    }

    const apps = await this.leaveAppModel
      .find(filter)
      .populate('userId', 'name email designation departmentId')
      .populate('leaveTypeId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Pending > 3 days
    const now = new Date();
    const pendingFilter: any = {
      organizationId: organizationId,
      status: { $in: ['pending', 'manager_approved'] },
      fromDate: { $gte: startDate, $lte: endDate },
    };
    const pendingApps = await this.leaveAppModel
      .find(pendingFilter)
      .populate('userId', 'name email designation')
      .populate('leaveTypeId', 'name');

    const longPending = pendingApps.filter((a) => {
      const diffDays = (now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 3;
    });

    // TAT computation
    const rows = apps.map((a) => {
      const tatHours = a.approvedAt && a.createdAt
        ? Math.round(((new Date(a.approvedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60)) * 10) / 10
        : null;
      const tatDays = tatHours !== null ? Math.round((tatHours / 24) * 10) / 10 : null;
      return {
        id: a._id,
        employee: a.userId,
        leaveType: a.leaveTypeId,
        appliedDate: a.createdAt,
        decisionDate: a.approvedAt,
        tatHours,
        tatDays,
        approver: a.approvedBy,
        status: a.status,
      };
    });

    // Avg TAT per approver
    const approverMap: Record<string, { name: string; email: string; count: number; totalHours: number }> = {};
    rows.forEach((r) => {
      if (!r.approver || r.tatHours === null) return;
      const approverId = (r.approver as any)?._id?.toString() || 'unknown';
      if (!approverMap[approverId]) {
        approverMap[approverId] = {
          name: (r.approver as any)?.name || 'Unknown',
          email: (r.approver as any)?.email || '',
          count: 0,
          totalHours: 0,
        };
      }
      approverMap[approverId].count++;
      approverMap[approverId].totalHours += r.tatHours;
    });

    const approverStats = Object.entries(approverMap).map(([id, v]) => ({
      approverId: id,
      name: v.name,
      email: v.email,
      decisionsCount: v.count,
      avgTatHours: Math.round((v.totalHours / v.count) * 10) / 10,
      avgTatDays: Math.round((v.totalHours / v.count / 24) * 10) / 10,
    })).sort((a, b) => a.avgTatHours - b.avgTatHours);

    const validTats = rows.filter((r) => r.tatHours !== null).map((r) => r.tatHours as number);
    const overallAvgTat = validTats.length > 0
      ? Math.round((validTats.reduce((s, h) => s + h, 0) / validTats.length) * 10) / 10
      : 0;

    return {
      year,
      dateRange: { startDate, endDate },
      summary: {
        totalDecided: rows.length,
        overallAvgTatHours: overallAvgTat,
        overallAvgTatDays: Math.round((overallAvgTat / 24) * 10) / 10,
        longPendingCount: longPending.length,
      },
      approverStats,
      applications: rows,
      longPendingApplications: longPending.map((a) => ({
        id: a._id,
        employee: a.userId,
        leaveType: a.leaveTypeId,
        appliedDate: a.createdAt,
        status: a.status,
        pendingDays: Math.round((now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };
  }

  // ─── Report H: Leave Type Utilization Report ──────────────────────────
  async getLeaveTypeUtilizationReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    const leaveTypes = await this.leaveTypeModel.find({
      organizationId: organizationId,
      isActive: true,
    });

    const activeEmployees = await this.userModel.countDocuments({
      organizationId: orgObjectId,
      isActive: true,
    });

    const allBalances = await this.leaveBalanceModel.find({
      organizationId: orgObjectId,
      year,
    });

    const approvedApps = await this.leaveAppModel.find({
      organizationId: organizationId,
      status: { $in: ['approved', 'hr_approved'] },
      fromDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
    });

    const typeStats = await Promise.all(
      leaveTypes.map(async (lt) => {
        const typeId = lt._id.toString();
        const typeBalances = allBalances.filter(
          (b) => b.leaveTypeId?.toString() === typeId,
        );
        const totalAllocated = typeBalances.reduce(
          (s, b) => s + b.totalAllocated + (b.carryForward || 0),
          0,
        );
        const totalUsed = typeBalances.reduce((s, b) => s + b.used, 0);
        const totalRemaining = typeBalances.reduce((s, b) => s + b.remaining, 0);
        const utilizationPct = totalAllocated > 0
          ? Math.round((totalUsed / totalAllocated) * 100)
          : 0;

        // Application count
        const appCount = approvedApps.filter(
          (a) => a.leaveTypeId?.toString() === typeId,
        ).length;

        return {
          leaveType: {
            id: lt._id,
            name: lt.name,
            isPaid: lt.isPaid,
            totalDaysAllowed: lt.totalDaysAllowed,
            carryForwardAllowed: lt.carryForwardAllowed,
          },
          activeEmployees,
          totalAllocated,
          totalUsed,
          totalRemaining,
          utilizationPercent: utilizationPct,
          approvedApplications: appCount,
          unusedDays: totalAllocated - totalUsed,
        };
      }),
    );

    typeStats.sort((a, b) => b.utilizationPercent - a.utilizationPercent);

    const totalAllocatedOrg = typeStats.reduce((s, t) => s + t.totalAllocated, 0);
    const totalUsedOrg = typeStats.reduce((s, t) => s + t.totalUsed, 0);

    return {
      year,
      activeEmployees,
      summary: {
        totalLeaveTypes: leaveTypes.length,
        totalAllocatedOrgWide: totalAllocatedOrg,
        totalUsedOrgWide: totalUsedOrg,
        overallUtilizationPct: totalAllocatedOrg > 0
          ? Math.round((totalUsedOrg / totalAllocatedOrg) * 100)
          : 0,
      },
      leaveTypes: typeStats,
    };
  }

  // ─── Report N: My Annual Leave Summary ────────────────────────────────
  async getMyAnnualSummaryReport(userId: string, organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    const leaveTypes = await this.leaveTypeModel.find({
      organizationId: organizationId,
      isActive: true,
    });

    // Ensure balances exist
    for (const type of leaveTypes) {
      const exists = await this.leaveBalanceModel.findOne({
        userId,
        organizationId: orgObjectId,
        year,
        leaveTypeId: type._id,
      });
      if (!exists) {
        try {
          await this.leaveBalanceModel.create({
            userId,
            organizationId: orgObjectId,
            leaveTypeId: type._id,
            year,
            totalAllocated: type.totalDaysAllowed,
            used: 0,
            carryForward: 0,
            remaining: type.totalDaysAllowed,
          });
        } catch (e: any) {
          if (e.code !== 11000) throw e;
        }
      }
    }

    const balances = await this.leaveBalanceModel
      .find({ userId, organizationId: orgObjectId, year })
      .populate('leaveTypeId', 'name isPaid carryForwardAllowed carryForwardLimit');

    const allApps = await this.leaveAppModel.find({
      userId,
      organizationId: organizationId,
      fromDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
    }).populate('leaveTypeId', 'name');

    const approvedApps = allApps.filter((a) => ['approved', 'hr_approved'].includes(a.status));
    const totalDaysTaken = approvedApps.reduce((s, a) => s + a.totalDays, 0);

    const statusBreakdown = {
      total: allApps.length,
      approved: allApps.filter((a) => ['approved', 'hr_approved'].includes(a.status)).length,
      rejected: allApps.filter((a) => a.status === 'rejected').length,
      pending: allApps.filter((a) => ['pending', 'manager_approved'].includes(a.status)).length,
      cancelled: allApps.filter((a) => a.status === 'cancelled').length,
    };

    const approvalRate = (statusBreakdown.approved + statusBreakdown.rejected) > 0
      ? Math.round((statusBreakdown.approved / (statusBreakdown.approved + statusBreakdown.rejected)) * 100)
      : 0;

    const byLeaveType = balances.map((b) => {
      const lt = b.leaveTypeId as any;
      const allocated = b.totalAllocated + (b.carryForward || 0);
      const carryForwardEligible =
        lt?.carryForwardAllowed
          ? Math.min(b.remaining, lt.carryForwardLimit || b.remaining)
          : 0;
      return {
        leaveType: lt,
        totalAllocated: b.totalAllocated,
        carryForward: b.carryForward || 0,
        effectiveAllocation: allocated,
        used: b.used,
        remaining: b.remaining,
        carryForwardEligibleNextYear: carryForwardEligible,
        utilizationPercent: allocated > 0 ? Math.round((b.used / allocated) * 100) : 0,
      };
    });

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthApps = approvedApps.filter((a) => new Date(a.fromDate).getMonth() === i);
      return {
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        monthIndex: i,
        daysTaken: monthApps.reduce((s, a) => s + a.totalDays, 0),
        applicationCount: monthApps.length,
      };
    });

    return {
      year,
      summary: {
        totalDaysTaken,
        totalApplications: allApps.length,
        approvalRate,
        statusBreakdown,
      },
      byLeaveType,
      monthlyBreakdown,
    };
  }

  // ─── Report C: Employee Register (Compliance) ─────────────────────────
  async getEmployeeRegisterReport(organizationId: string, query: ReportQueryDto) {
    const year = query.year || new Date().getFullYear();
    const orgObjectId = new Types.ObjectId(organizationId);

    const userFilter: any = { organizationId: orgObjectId, isActive: true };
    if (query.departmentId) {
      userFilter.departmentId = new Types.ObjectId(query.departmentId);
    }
    if (query.employeeId) {
      userFilter._id = new Types.ObjectId(query.employeeId);
    }

    const users = await this.userModel
      .find(userFilter)
      .populate('departmentId', 'name')
      .select('name email designation departmentId role joiningDate');

    const leaveTypes = await this.leaveTypeModel.find({
      organizationId: organizationId,
      isActive: true,
    }).select('_id name isPaid carryForwardAllowed totalDaysAllowed');

    // Ensure balances exist for all
    for (const user of users) {
      for (const type of leaveTypes) {
        const exists = await this.leaveBalanceModel.findOne({
          userId: user._id,
          organizationId: orgObjectId,
          year,
          leaveTypeId: type._id,
        });
        if (!exists) {
          try {
            await this.leaveBalanceModel.create({
              userId: user._id,
              organizationId: orgObjectId,
              leaveTypeId: type._id,
              year,
              totalAllocated: type.totalDaysAllowed,
              used: 0,
              carryForward: 0,
              remaining: type.totalDaysAllowed,
            });
          } catch (e: any) {
            if (e.code !== 11000) throw e;
          }
        }
      }
    }

    const allBalances = await this.leaveBalanceModel.find({
      organizationId: orgObjectId,
      year,
    }).populate('leaveTypeId', 'name isPaid');

    const balanceByUser: Record<string, any[]> = {};
    allBalances.forEach((b) => {
      const uid = b.userId.toString();
      if (!balanceByUser[uid]) balanceByUser[uid] = [];
      balanceByUser[uid].push(b);
    });

    const register = users.map((user) => {
      const userBalances = balanceByUser[user._id.toString()] || [];
      const totalUsed = userBalances.reduce((s, b) => s + b.used, 0);
      const totalRemaining = userBalances.reduce((s, b) => s + b.remaining, 0);
      const totalCarryForward = userBalances.reduce((s, b) => s + (b.carryForward || 0), 0);

      return {
        employee: {
          id: user._id,
          name: user.name,
          email: user.email,
          designation: user.designation,
          department: user.departmentId,
          role: user.role,
          joiningDate: (user as any).joiningDate,
        },
        year,
        totalUsed,
        totalRemaining,
        totalCarryForward,
        balances: leaveTypes.map((lt) => {
          const bal = userBalances.find(
            (b) => b.leaveTypeId?._id?.toString() === lt._id.toString(),
          );
          return {
            leaveTypeId: lt._id,
            leaveTypeName: lt.name,
            isPaid: lt.isPaid,
            totalAllocated: bal?.totalAllocated ?? lt.totalDaysAllowed,
            carryForward: bal?.carryForward ?? 0,
            used: bal?.used ?? 0,
            remaining: bal?.remaining ?? lt.totalDaysAllowed,
          };
        }),
      };
    });

    // Dept-level summary
    const deptMap: Record<string, { name: string; headcount: number; totalUsed: number; totalRemaining: number }> = {};
    register.forEach((r) => {
      const deptName = (r.employee.department as any)?.name || 'Unassigned';
      const deptId = (r.employee.department as any)?._id?.toString() || 'none';
      if (!deptMap[deptId]) deptMap[deptId] = { name: deptName, headcount: 0, totalUsed: 0, totalRemaining: 0 };
      deptMap[deptId].headcount++;
      deptMap[deptId].totalUsed += r.totalUsed;
      deptMap[deptId].totalRemaining += r.totalRemaining;
    });

    return {
      year,
      leaveTypes: leaveTypes.map((lt) => ({ id: lt._id, name: lt.name, isPaid: lt.isPaid })),
      summary: {
        totalEmployees: register.length,
        departmentSummary: Object.values(deptMap),
      },
      employees: register,
    };
  }

  // ─── Report J: Team Availability Calendar ─────────────────────────────
  async getTeamCalendarReport(
    userId: string,
    organizationId: string,
    role: string,
    query: ReportQueryDto,
  ) {
    const orgObjectId = new Types.ObjectId(organizationId);
    const userObjectId = new Types.ObjectId(userId);

    // Default: current month + next month
    const now = new Date();
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = query.endDate
      ? new Date(query.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Determine team members
    let teamMembers: any[] = [];
    if (role === 'org_admin' || role === 'hr_manager') {
      teamMembers = await this.userModel
        .find({ organizationId: orgObjectId, isActive: true })
        .select('name email designation departmentId');
    } else {
      const directs = await this.userModel
        .find({ managerId: userObjectId, organizationId: orgObjectId, isActive: true })
        .select('name email designation departmentId');
      const self = await this.userModel.findById(userObjectId).select('name email designation departmentId');
      teamMembers = [...directs, self].filter(Boolean);
    }

    const teamMemberIds = teamMembers.map((m) => m._id.toString());

    // Fetch approved + pending leaves in the date range
    const leaves = await this.leaveAppModel
      .find({
        userId: { $in: teamMemberIds },
        organizationId: organizationId,
        status: { $in: ['approved', 'hr_approved', 'pending', 'manager_approved'] },
        $or: [
          { fromDate: { $lte: endDate }, toDate: { $gte: startDate } },
        ],
      })
      .populate('userId', 'name email designation')
      .populate('leaveTypeId', 'name')
      .sort({ fromDate: 1 });

    // Build per-member events
    const memberEvents = teamMembers.map((member) => {
      const memberLeaves = leaves.filter(
        (l) => l.userId?.toString() === member._id.toString() ||
                (l.userId as any)?._id?.toString() === member._id.toString(),
      );
      return {
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          designation: member.designation,
        },
        leaves: memberLeaves.map((l) => ({
          id: l._id,
          leaveType: l.leaveTypeId,
          fromDate: l.fromDate,
          toDate: l.toDate,
          totalDays: l.totalDays,
          status: l.status,
        })),
      };
    });

    // Overlap detection: for each date in range, count who's on approved leave
    const overlaps: { date: string; count: number; members: string[] }[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().split('T')[0];
      const onLeave = leaves.filter((l) => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return (
          ['approved', 'hr_approved'].includes(l.status) &&
          cursor >= from &&
          cursor <= to
        );
      });
      if (onLeave.length >= 2) {
        overlaps.push({
          date: dateStr,
          count: onLeave.length,
          members: onLeave.map((l) => (l.userId as any)?.name || 'Unknown'),
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      dateRange: { startDate, endDate },
      teamSize: teamMembers.length,
      memberEvents,
      overlaps,
      summary: {
        totalLeaveEvents: leaves.length,
        approvedEvents: leaves.filter((l) => ['approved', 'hr_approved'].includes(l.status)).length,
        pendingEvents: leaves.filter((l) => ['pending', 'manager_approved'].includes(l.status)).length,
        overlapDays: overlaps.length,
      },
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
