import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Holiday } from '../../schemas/holiday.schema';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  private readonly logger = new Logger(HolidayService.name);

  constructor(
    @InjectModel(Holiday.name) private holidayModel: Model<Holiday>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto, organizationId: string) {
    try {
      this.logger.log(`Creating holiday for organization ${organizationId}: ${createHolidayDto.name}`);
      const holiday = await this.holidayModel.create({
        ...createHolidayDto,
        date: new Date(createHolidayDto.date),
        organizationId: new Types.ObjectId(organizationId),
      });
      return holiday;
    } catch (error) {
      this.logger.error(`Error creating holiday: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create holiday: ${error.message}`);
    }
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto, organizationId: string) {
    try {
      this.logger.log(`Updating holiday ${id} for organization ${organizationId}`);
      
      const updateData: any = { ...updateHolidayDto };
      if (updateHolidayDto.date) {
        updateData.date = new Date(updateHolidayDto.date);
      }

      const holiday = await this.holidayModel.findOneAndUpdate(
        { _id: id, organizationId: new Types.ObjectId(organizationId) },
        updateData,
        { new: true, runValidators: true }
      );

      if (!holiday) {
        throw new NotFoundException('Holiday not found');
      }

      return holiday;
    } catch (error) {
      this.logger.error(`Error updating holiday ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update holiday: ${error.message}`);
    }
  }

  async findAll(organizationId: string, year?: number) {
    const query: any = { organizationId: new Types.ObjectId(organizationId) };
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.date = { $gte: startDate, $lte: endDate };
    }

    return this.holidayModel.find(query).sort({ date: 1 });
  }


  async remove(id: string, organizationId: string) {
    const holiday = await this.holidayModel.findOneAndDelete({ 
      _id: id, 
      organizationId: new Types.ObjectId(organizationId) 
    });
    
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return { message: 'Holiday deleted successfully' };
  }
}
