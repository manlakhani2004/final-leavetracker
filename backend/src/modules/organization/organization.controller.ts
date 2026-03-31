import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserRole } from '../../schemas/user.schema';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.organizationService.findAll(page, limit);
    return new ApiResponseDto(
      true,
      'Organizations fetched successfully',
      result.organizations,
      result.pagination,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.organizationService.findById(id);
    return new ApiResponseDto(true, 'Organization fetched successfully', result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrganizationDto) {
    const result = await this.organizationService.update(id, updateOrgDto);
    return new ApiResponseDto(true, 'Organization updated successfully', result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.organizationService.remove(id);
    return new ApiResponseDto(true, result.message, {});
  }
}
