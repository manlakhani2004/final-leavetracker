import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRoleEnum {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  HR_MANAGER = 'hr_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

export type UserRole = UserRoleEnum;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ 
    type: String, 
    enum: UserRoleEnum,
    default: UserRoleEnum.EMPLOYEE
  })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId: Types.ObjectId;

  @Prop({ trim: true })
  department: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ trim: true })
  designation: string;

  @Prop({ type: Date })
  joiningDate: Date;

  @Prop({ required: true })
  organizationId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ organizationId: 1, email: 1 });
UserSchema.index({ organizationId: 1, role: 1 });
