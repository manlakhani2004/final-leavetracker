import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { LeaveTypeModule } from './modules/leave-type/leave-type.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';
import { LeaveApplicationModule } from './modules/leave-application/leave-application.module';
import { HolidayModule } from './modules/holiday/holiday.module';
import { DepartmentModule } from './modules/department/department.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MailModule } from './mail/mail.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    OrganizationModule,
    UserModule,
    LeaveTypeModule,
    LeaveBalanceModule,
    LeaveApplicationModule,
    HolidayModule,
    DepartmentModule,
    DashboardModule,
    ReportsModule,
    MailModule,
    AiModule,
    NotificationModule,
    AuditLogModule,
  ],
})
export class AppModule {}

