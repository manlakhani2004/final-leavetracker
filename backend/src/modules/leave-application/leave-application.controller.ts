import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LeaveApplicationService } from './leave-application.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('leave-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveApplicationController {
  constructor(private leaveAppService: LeaveApplicationService) {}

  @Post()
  async apply(
    @Body() createLeaveApplicationDto: CreateLeaveApplicationDto,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveAppService.apply(createLeaveApplicationDto, user.sub, user.organizationId);
    return new ApiResponseDto(true, 'Leave application submitted successfully', result);
  }

  @Get()
  async findAll(
    @RequestUser() user: any,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.leaveAppService.findAll(user.sub, user.organizationId, user.role, status, page, limit);
    return new ApiResponseDto(
      true,
      'Leave applications fetched successfully',
      result.applications,
      result.pagination,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.leaveAppService.findById(id, user.organizationId, user.sub, user.role);
    return new ApiResponseDto(true, 'Leave application fetched successfully', result);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveApplicationDto,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveAppService.update(id, user.sub, user.organizationId, dto);
    return new ApiResponseDto(true, 'Leave application updated successfully', result);
  }

  @Patch(':id/approve')
  @Roles('org_admin', 'hr_manager', 'manager')
  async approve(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.leaveAppService.approve(id, user.sub, user.organizationId, user.role);
    return new ApiResponseDto(true, 'Leave application approved successfully', result);
  }

  @Patch(':id/reject')
  @Roles('org_admin', 'hr_manager', 'manager')
  async reject(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @RequestUser() user: any,
  ) {
    if (!approveLeaveDto.rejectionReason) {
      approveLeaveDto.rejectionReason = 'No reason provided';
    }
    const result = await this.leaveAppService.reject(id, user.sub, user.organizationId, user.role, approveLeaveDto.rejectionReason);
    return new ApiResponseDto(true, 'Leave application rejected', result);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.leaveAppService.cancel(id, user.sub, user.organizationId);
    return new ApiResponseDto(true, 'Leave application cancelled', result);
  }
}
