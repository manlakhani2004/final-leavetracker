import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles('org_admin', 'hr_manager')
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @RequestUser() user: any,
  ) {
    const result = await this.departmentService.create(createDepartmentDto, user.organizationId);
    return new ApiResponseDto(true, 'Department created successfully', result);
  }

  @Get()
  async findAll(
    @RequestUser() user: any,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    const result = await this.departmentService.findAll(user.organizationId, includeInactive);
    return new ApiResponseDto(true, 'Departments fetched successfully', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.departmentService.findOne(id, user.organizationId);
    return new ApiResponseDto(true, 'Department fetched successfully', result);
  }

  @Patch(':id')
  @Roles('org_admin', 'hr_manager')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @RequestUser() user: any,
  ) {
    const result = await this.departmentService.update(id, updateDepartmentDto, user.organizationId);
    return new ApiResponseDto(true, 'Department updated successfully', result);
  }

  @Delete(':id')
  @Roles('org_admin', 'hr_manager')
  async remove(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.departmentService.remove(id, user.organizationId);
    return new ApiResponseDto(true, result.message, {});
  }
}
