import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType } from '../../schemas/leave-type.schema';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
  ) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto, organizationId: string) {
    const leaveType = await this.leaveTypeModel.create({
      ...createLeaveTypeDto,
      organizationId,
    });
    return leaveType;
  }

  async findAll(organizationId: string, includeInactive: boolean = false) {
    const query: any = { organizationId };
    
    // Default to only active leave types unless specified (e.g. for Admin settings)
    if (!includeInactive) {
      query.isActive = true;
    }
    
    return this.leaveTypeModel.find(query);
  }

  async findById(id: string, organizationId: string) {
    const leaveType = await this.leaveTypeModel.findOne({ _id: id, organizationId });
    
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return leaveType;
  }

  async update(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto, organizationId: string) {
    const leaveType = await this.leaveTypeModel.findOneAndUpdate(
      { _id: id, organizationId },
      updateLeaveTypeDto,
      { new: true, runValidators: true },
    );

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return leaveType;
  }

  async remove(id: string, organizationId: string) {
    const leaveType = await this.leaveTypeModel.findOneAndUpdate(
      { _id: id, organizationId },
      { isActive: false },
      { new: true },
    );

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return { message: 'Leave type deleted successfully' };
  }
}
