import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';
import { UserRole } from '../../schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles('org_admin', 'hr_manager')
  async create(
    @Body() createUserDto: CreateUserDto,
    @RequestUser() user: any,
  ) {
    const result = await this.userService.create(createUserDto, user.organizationId, user.role);
    return new ApiResponseDto(true, 'User created successfully', result);
  }

  @Get()
  @Roles('org_admin', 'hr_manager', 'manager', 'employee')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @RequestUser() user: any,
  ) {
    const result = await this.userService.findAll(user.organizationId, page, limit);
    return new ApiResponseDto(
      true,
      'Users fetched successfully',
      result.users,
      result.pagination,
    );
  }

  @Get(':id')
  @Roles('org_admin', 'hr_manager', 'manager', 'employee')
  async findById(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.userService.findById(id, user.organizationId);
    return new ApiResponseDto(true, 'User fetched successfully', result);
  }

  @Get(':id/team')
  @Roles('org_admin', 'hr_manager', 'manager')
  async findTeamMembers(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.userService.findTeamMembers(id, user.organizationId);
    return new ApiResponseDto(true, 'Team members fetched successfully', result);
  }

  @Patch(':id')
  @Roles('org_admin', 'hr_manager')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @RequestUser() user: any,
  ) {
    const result = await this.userService.update(id, updateUserDto, user.organizationId, user.role);
    return new ApiResponseDto(true, 'User updated successfully', result);
  }

  @Delete(':id')
  @Roles('org_admin')
  async remove(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.userService.remove(id, user.organizationId, user.role);
    return new ApiResponseDto(true, 'User deactivated successfully', {});
  }
}
