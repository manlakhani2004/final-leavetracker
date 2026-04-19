import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { Department, DepartmentSchema } from '../../schemas/department.schema';
import { Organization, OrganizationSchema } from '../../schemas/organization.schema';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
