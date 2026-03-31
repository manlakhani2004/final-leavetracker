import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@RequestUser() user: any) {
    const result = await this.dashboardService.getSummary(user.sub, user.organizationId, user.role);
    return new ApiResponseDto(true, 'Dashboard summary fetched successfully', result);
  }

  @Get('team')
  @Roles('org_admin', 'hr_manager', 'manager')
  async getTeamSummary(@RequestUser() user: any) {
    const result = await this.dashboardService.getTeamSummary(user.sub, user.organizationId, user.role);
    return new ApiResponseDto(true, 'Team summary fetched successfully', result);
  }

  @Get('org')
  @Roles('org_admin', 'hr_manager')
  async getOrgSummary(@RequestUser() user: any) {
    const result = await this.dashboardService.getOrgSummary(user.organizationId);
    return new ApiResponseDto(true, 'Organization summary fetched successfully', result);
  }

  @Get('chart-data')
  @Roles('org_admin', 'hr_manager')
  async getChartData(@RequestUser() user: any) {
    const result = await this.dashboardService.getChartData(user.organizationId);
    return new ApiResponseDto(true, 'Chart data fetched successfully', result);
  }
}
