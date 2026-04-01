import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { LeaveTypeModule } from './modules/leave-type/leave-type.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';
import { LeaveApplicationModule } from './modules/leave-application/leave-application.module';
import { HolidayModule } from './modules/holiday/holiday.module';
import { DepartmentModule } from './modules/department/department.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';

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
    AuthModule,
    OrganizationModule,
    UserModule,
    LeaveTypeModule,
    LeaveBalanceModule,
    LeaveApplicationModule,
    HolidayModule,
    DepartmentModule,
    DashboardModule,
    MailModule,
  ],
})
export class AppModule {}
