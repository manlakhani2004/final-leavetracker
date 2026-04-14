import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}
