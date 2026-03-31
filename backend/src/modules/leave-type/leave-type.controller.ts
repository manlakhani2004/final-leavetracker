import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('leave-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveTypeController {
  constructor(private leaveTypeService: LeaveTypeService) {}

  @Post()
  @Roles('org_admin', 'hr_manager')
  async create(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveTypeService.create(createLeaveTypeDto, user.organizationId);
    return new ApiResponseDto(true, 'Leave type created successfully', result);
  }

  @Get()
  async findAll(
    @RequestUser() user: any,
    @Query('includeInactive') includeInactive?: string
  ) {
    const shouldIncludeInactive = (user.role === 'org_admin' || user.role === 'hr_manager') && includeInactive === 'true';
    const result = await this.leaveTypeService.findAll(user.organizationId, shouldIncludeInactive);
    return new ApiResponseDto(true, 'Leave types fetched successfully', result);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.leaveTypeService.findById(id, user.organizationId);
    return new ApiResponseDto(true, 'Leave type fetched successfully', result);
  }

  @Patch(':id')
  @Roles('org_admin', 'hr_manager')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveTypeService.update(id, updateLeaveTypeDto, user.organizationId);
    return new ApiResponseDto(true, 'Leave type updated successfully', result);
  }

  @Delete(':id')
  @Roles('org_admin', 'hr_manager')
  async remove(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.leaveTypeService.remove(id, user.organizationId);
    return new ApiResponseDto(true, result.message, {});
  }
}
