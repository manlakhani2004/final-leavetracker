import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';
import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
    ]),
  ],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
