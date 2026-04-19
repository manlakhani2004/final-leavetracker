import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // Report L: My Leave Balance — all roles
  @Get('my-balance')
  async getMyBalanceReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getMyBalanceReport(
      user.sub,
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'My balance report fetched successfully', result);
  }

  // Report M: My Leave History — all roles
  @Get('my-history')
  async getMyHistoryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getMyHistoryReport(
      user.sub,
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'My history report fetched successfully', result);
  }

  // Report A: Organization Leave Summary — admin, hr
  @Get('org-summary')
  @Roles('org_admin', 'hr_manager')
  async getOrgSummaryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getOrgSummaryReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Organization summary report fetched successfully', result);
  }

  // Report I: Team Leave Summary — manager, admin, hr
  @Get('team-summary')
  @Roles('org_admin', 'hr_manager', 'manager')
  async getTeamSummaryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getTeamSummaryReport(
      user.sub,
      user.organizationId,
      user.role,
      query,
    );
    return new ApiResponseDto(true, 'Team summary report fetched successfully', result);
  }

  // Report B: Department-wise Leave — admin, hr
  @Get('department-wise')
  @Roles('org_admin', 'hr_manager')
  async getDepartmentWiseReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getDepartmentWiseReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Department-wise report fetched successfully', result);
  }

  // Report D: Monthly Trend Analysis — admin, hr
  @Get('monthly-trend')
  @Roles('org_admin', 'hr_manager')
  async getMonthlyTrendReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getMonthlyTrendReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Monthly trend report fetched successfully', result);
  }

  // Report E: Leave Balance Summary — admin, hr
  @Get('leave-balances')
  @Roles('org_admin', 'hr_manager')
  async getLeaveBalanceSummaryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getLeaveBalanceSummaryReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Leave balance summary report fetched successfully', result);
  }

  // Report K: Team Leave History — manager, admin, hr
  @Get('team-history')
  @Roles('org_admin', 'hr_manager', 'manager')
  async getTeamHistoryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getTeamHistoryReport(
      user.sub,
      user.organizationId,
      user.role,
      query,
    );
    return new ApiResponseDto(true, 'Team history report fetched successfully', result);
  }

  // ── Phase 3 Reports ───────────────────────────────────────────────────

  // Report G: Absenteeism — admin, hr
  @Get('absenteeism')
  @Roles('org_admin', 'hr_manager')
  async getAbsenteeismReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getAbsenteeismReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Absenteeism report fetched successfully', result);
  }

  // Report F: Approval Turnaround — admin, hr
  @Get('approval-turnaround')
  @Roles('org_admin', 'hr_manager')
  async getApprovalTurnaroundReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getApprovalTurnaroundReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Approval turnaround report fetched successfully', result);
  }

  // Report H: Leave Type Utilization — admin, hr
  @Get('leave-utilization')
  @Roles('org_admin', 'hr_manager')
  async getLeaveTypeUtilizationReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getLeaveTypeUtilizationReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Leave type utilization report fetched successfully', result);
  }

  // Report N: My Annual Summary — all roles
  @Get('my-annual-summary')
  async getMyAnnualSummaryReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getMyAnnualSummaryReport(
      user.sub,
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Annual summary report fetched successfully', result);
  }

  // Report C: Employee Register — admin, hr
  @Get('employee-register')
  @Roles('org_admin', 'hr_manager')
  async getEmployeeRegisterReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getEmployeeRegisterReport(
      user.organizationId,
      query,
    );
    return new ApiResponseDto(true, 'Employee register report fetched successfully', result);
  }

  // Report J: Team Availability Calendar — manager, admin, hr
  @Get('team-calendar')
  @Roles('org_admin', 'hr_manager', 'manager')
  async getTeamCalendarReport(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
  ) {
    const result = await this.reportsService.getTeamCalendarReport(
      user.sub,
      user.organizationId,
      user.role,
      query,
    );
    return new ApiResponseDto(true, 'Team calendar report fetched successfully', result);
  }

  // ─── CSV Export Endpoints ───────────────────────────────────────────────

  @Get('export/my-history')
  async exportMyHistory(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: any,
  ) {
    const result = await this.reportsService.getMyHistoryReport(user.sub, user.organizationId, { ...query, limit: 10000 } as any);
    const rows = result.applications || [];
    const csv = [
      ['Leave Type', 'From Date', 'To Date', 'Total Days', 'Status', 'Approver', 'Applied Date', 'Rejection Reason'],
      ...rows.map((r: any) => [
        r.leaveType?.name || '',
        r.fromDate ? new Date(r.fromDate).toLocaleDateString() : '',
        r.toDate ? new Date(r.toDate).toLocaleDateString() : '',
        r.totalDays,
        r.status,
        r.approvedBy?.name || '',
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
        r.rejectionReason || '',
      ]),
    ].map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=my-leave-history.csv');
    res.send(csv);
  }

  @Get('export/org-summary')
  @Roles('org_admin', 'hr_manager')
  async exportOrgSummary(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: any,
  ) {
    const result = await this.reportsService.getOrgSummaryReport(user.organizationId, query);
    const rows = result.leaveTypeStats || [];
    const csv = [
      ['Leave Type', 'Total Applications', 'Total Days Taken'],
      ...rows.map((r: any) => [r.name, r.count, r.days]),
    ].map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=org-leave-summary.csv');
    res.send(csv);
  }

  @Get('export/team-summary')
  @Roles('org_admin', 'hr_manager', 'manager')
  async exportTeamSummary(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: any,
  ) {
    const result = await this.reportsService.getTeamSummaryReport(user.sub, user.organizationId, user.role, query);
    const rows = result.members || [];
    const csv = [
      ['Employee', 'Email', 'Department', 'Total Applications', 'Approved', 'Pending', 'Rejected', 'Days Taken'],
      ...rows.map((r: any) => [r.name, r.email, r.department || '', r.totalApplications, r.approved, r.pending, r.rejected, r.totalDaysTaken]),
    ].map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=team-leave-summary.csv');
    res.send(csv);
  }

  @Get('export/leave-balances')
  @Roles('org_admin', 'hr_manager')
  async exportLeaveBalances(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: any,
  ) {
    const result = await this.reportsService.getLeaveBalanceSummaryReport(user.organizationId, query);
    const rows = result.employees || [];
    const csvRows: any[][] = [['Employee', 'Email', 'Department']];
    const leaveTypes: any[] = result.leaveTypes || [];
    leaveTypes.forEach((lt: any) => { csvRows[0].push(`${lt.name} - Allocated`, `${lt.name} - Used`, `${lt.name} - Remaining`); });
    rows.forEach((r: any) => {
      const row: any[] = [r.employee?.name || '', r.employee?.email || '', (r.employee?.department as any)?.name || ''];
      leaveTypes.forEach((lt: any) => {
        const bal = r.balances?.find((b: any) => (b.leaveType?._id?.toString() || b.leaveType?.toString()) === lt.id?.toString());
        row.push(bal?.totalAllocated ?? 0, bal?.used ?? 0, bal?.remaining ?? 0);
      });
      csvRows.push(row);
    });
    const csv = csvRows.map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leave-balances.csv');
    res.send(csv);
  }

  @Get('export/employee-register')
  @Roles('org_admin', 'hr_manager')
  async exportEmployeeRegister(
    @RequestUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: any,
  ) {
    const result = await this.reportsService.getEmployeeRegisterReport(user.organizationId, query);
    const rows = result.employees || [];
    const csv = [
      ['Name', 'Email', 'Role', 'Department', 'Designation', 'Manager', 'Joining Date', 'Status'],
      ...rows.map((r: any) => [r.name, r.email, r.role, r.department || '', r.designation || '', r.manager || '', r.joiningDate ? new Date(r.joiningDate).toLocaleDateString() : '', r.isActive ? 'Active' : 'Inactive']),
    ].map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-register.csv');
    res.send(csv);
  }
}
