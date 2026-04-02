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
}
