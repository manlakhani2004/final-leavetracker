import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { LeaveApplication, LeaveApplicationSchema } from '../../schemas/leave-application.schema';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';
import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Department, DepartmentSchema } from '../../schemas/department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveApplication.name, schema: LeaveApplicationSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
