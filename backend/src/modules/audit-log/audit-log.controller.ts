import {
  Controller, Get, Query, UseGuards, Param,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('org_admin', 'hr_manager')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(
    @RequestUser() user: any,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorId') actorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.auditLogService.getAuditLogs(user.organizationId, {
      action,
      entityType,
      actorId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      startDate,
      endDate,
    });
    return new ApiResponseDto(true, 'Audit logs fetched successfully', result.logs, result.pagination);
  }

  @Get('stats')
  async getStats(@RequestUser() user: any) {
    const result = await this.auditLogService.getStats(user.organizationId);
    return new ApiResponseDto(true, 'Audit stats fetched', result);
  }

  @Get(':entityType/:entityId')
  async getEntityHistory(
    @RequestUser() user: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.auditLogService.getEntityHistory(
      user.organizationId,
      entityType,
      entityId,
    );
    return new ApiResponseDto(true, 'Entity history fetched', result);
  }
}
