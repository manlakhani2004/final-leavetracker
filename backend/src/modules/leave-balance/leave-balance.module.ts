import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveCarryOverService } from './leave-carry-over.service';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';
import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService, LeaveCarryOverService],
  exports: [LeaveBalanceService, LeaveCarryOverService],
})
export class LeaveBalanceModule {}
