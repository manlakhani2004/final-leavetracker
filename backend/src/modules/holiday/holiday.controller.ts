import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidayController {
  constructor(private holidayService: HolidayService) {}

  @Post()
  @Roles('org_admin', 'hr_manager')
  async create(
    @Body() createHolidayDto: CreateHolidayDto,
    @RequestUser() user: any,
  ) {
    const result = await this.holidayService.create(createHolidayDto, user.organizationId);
    return new ApiResponseDto(true, 'Holiday created successfully', result);
  }

  @Get()
  async findAll(
    @RequestUser() user: any,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    const result = await this.holidayService.findAll(user.organizationId, year);
    return new ApiResponseDto(true, 'Holidays fetched successfully', result);
  }
  
  @Patch(':id')
  @Roles('org_admin', 'hr_manager')
  async update(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
    @RequestUser() user: any,
  ) {
    const result = await this.holidayService.update(id, updateHolidayDto, user.organizationId);
    return new ApiResponseDto(true, 'Holiday updated successfully', result);
  }


  @Delete(':id')
  @Roles('org_admin', 'hr_manager')
  async remove(@Param('id') id: string, @RequestUser() user: any) {
    const result = await this.holidayService.remove(id, user.organizationId);
    return new ApiResponseDto(true, result.message, {});
  }
}
