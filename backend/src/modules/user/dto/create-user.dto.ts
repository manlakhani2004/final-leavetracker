import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { UserRole, UserRoleEnum } from '../../../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role: UserRole;

  @IsOptional()
  managerId?: Types.ObjectId | string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  joiningDate?: Date;
}
