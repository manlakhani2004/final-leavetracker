import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveApplicationController } from './leave-application.controller';
import { LeaveApplicationService } from './leave-application.service';
import { LeaveApplication, LeaveApplicationSchema } from '../../schemas/leave-application.schema';
import { LeaveBalance, LeaveBalanceSchema } from '../../schemas/leave-balance.schema';
import { LeaveType, LeaveTypeSchema } from '../../schemas/leave-type.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Organization, OrganizationSchema } from '../../schemas/organization.schema';
import { Holiday, HolidaySchema } from '../../schemas/holiday.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveApplication.name, schema: LeaveApplicationSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Holiday.name, schema: HolidaySchema },
    ]),
    NotificationModule,
  ],
  controllers: [LeaveApplicationController],
  providers: [LeaveApplicationService],
  exports: [LeaveApplicationService],
})
export class LeaveApplicationModule {}
