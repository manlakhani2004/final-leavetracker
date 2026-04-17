import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiScheduler } from './ai.scheduler';
import { LeaveApplication, LeaveApplicationSchema } from '../../schemas/leave-application.schema';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';
import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Department, DepartmentSchema } from '../../schemas/department.schema';
import { Holiday, HolidaySchema } from '../../schemas/holiday.schema';
import { AbsenteeismAlert, AbsenteeismAlertSchema } from '../../schemas/absenteeism-alert.schema';
import { Organization, OrganizationSchema } from '../../schemas/organization.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: LeaveApplication.name, schema: LeaveApplicationSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: AbsenteeismAlert.name, schema: AbsenteeismAlertSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, AiScheduler],
})
export class AiModule {}
