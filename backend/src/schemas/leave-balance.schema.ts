import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveBalance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, min: 0 })
  totalAllocated: number;

  @Prop({ required: true, min: 0, default: 0 })
  used: number;

  @Prop({ required: true, min: 0 })
  remaining: number;

  @Prop({ min: 0, default: 0 })
  carryForward: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);

LeaveBalanceSchema.index({ userId: 1, leaveTypeId: 1, year: 1 }, { unique: true });
LeaveBalanceSchema.index({ userId: 1, organizationId: 1, year: 1 });
LeaveBalanceSchema.index({ organizationId: 1, leaveTypeId: 1, year: 1 });
