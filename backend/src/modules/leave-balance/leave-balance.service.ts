import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveBalance } from '../../schemas/leave-balance.schema';
import { LeaveType } from '../../schemas/leave-type.schema';
import { AllocateLeaveDto } from './dto/allocate-leave.dto';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
  ) {}

  async allocate(allocateLeaveDto: AllocateLeaveDto, organizationId: string) {
    const existingBalance = await this.leaveBalanceModel.findOne({
      userId: allocateLeaveDto.userId,
      leaveTypeId: allocateLeaveDto.leaveTypeId,
      year: allocateLeaveDto.year,
      organizationId,
    });

    if (existingBalance) {
      // Update existing balance
      const updated = await this.leaveBalanceModel.findOneAndUpdate(
        {
          userId: allocateLeaveDto.userId,
          leaveTypeId: allocateLeaveDto.leaveTypeId,
          year: allocateLeaveDto.year,
          organizationId,
        },
        {
          totalAllocated: allocateLeaveDto.totalAllocated,
          carryForward: allocateLeaveDto.carryForward || 0,
          remaining: allocateLeaveDto.totalAllocated + (allocateLeaveDto.carryForward || 0) - existingBalance.used,
        },
        { new: true },
      );
      return updated;
    } else {
      // Create new balance
      const balance = await this.leaveBalanceModel.create({
        userId: allocateLeaveDto.userId,
        leaveTypeId: allocateLeaveDto.leaveTypeId,
        organizationId,
        year: allocateLeaveDto.year,
        totalAllocated: allocateLeaveDto.totalAllocated,
        used: 0,
        carryForward: allocateLeaveDto.carryForward || 0,
        remaining: allocateLeaveDto.totalAllocated + (allocateLeaveDto.carryForward || 0),
      });
      return balance;
    }
  }

  async findMyBalances(userId: string, organizationId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    
    const balances = await this.leaveBalanceModel.find({
      userId,
      organizationId,
      year: currentYear,
    }).populate('leaveTypeId', 'name isPaid');

    return balances;
  }

  async findUserBalances(userId: string, organizationId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    
    const balances = await this.leaveBalanceModel.find({
      userId,
      organizationId,
      year: currentYear,
    }).populate('leaveTypeId', 'name isPaid');

    return balances;
  }

  async deductLeaveBalance(
    userId: string,
    organizationId: string,
    leaveTypeId: string,
    days: number,
    year: number,
  ) {
    const balance = await this.leaveBalanceModel.findOne({
      userId,
      organizationId,
      leaveTypeId,
      year,
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    if (balance.remaining < days) {
      throw new BadRequestException('Insufficient leave balance');
    }

    await this.leaveBalanceModel.findOneAndUpdate(
      {
        userId,
        organizationId,
        leaveTypeId,
        year,
      },
      {
        $inc: { used: days, remaining: -days },
      },
    );

    return true;
  }

  async restoreLeaveBalance(
    userId: string,
    organizationId: string,
    leaveTypeId: string,
    days: number,
    year: number,
  ) {
    await this.leaveBalanceModel.findOneAndUpdate(
      {
        userId,
        organizationId,
        leaveTypeId,
        year,
      },
      {
        $inc: { used: -days, remaining: days },
      },
    );

    return true;
  }

  async carryForwardBalances(organizationId: string, fromYear: number, toYear: number) {
    const balances = await this.leaveBalanceModel.find({
      organizationId,
      year: fromYear,
    });

    const carryForwardOperations = balances.map(async (balance) => {
      const leaveType = await this.leaveTypeModel.findById(balance.leaveTypeId);
      
      if (!leaveType || !leaveType.carryForwardAllowed) {
        return;
      }

      const eligibleCarryForward = Math.min(
        balance.remaining,
        leaveType.carryForwardLimit,
      );

      if (eligibleCarryForward > 0) {
        await this.allocate(
          {
            userId: balance.userId,
            leaveTypeId: balance.leaveTypeId,
            year: toYear,
            totalAllocated: leaveType.totalDaysAllowed,
            carryForward: eligibleCarryForward,
          },
          organizationId,
        );
      }
    });

    await Promise.all(carryForwardOperations);
    return { message: 'Carry forward completed successfully' };
  }
}
