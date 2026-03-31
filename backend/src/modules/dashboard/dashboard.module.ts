import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LeaveApplication, LeaveApplicationSchema } from '../../schemas/leave-application.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';

import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';
import { Department, DepartmentSchema } from '../../schemas/department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveApplication.name, schema: LeaveApplicationSchema },
      { name: User.name, schema: UserSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
