import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

@Schema({ timestamps: true })
export class LeaveApplication extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @Prop({ required: true })
  fromDate: Date;

  @Prop({ required: true })
  toDate: Date;

  @Prop({ required: true, min: 0 })
  totalDays: number;

  @Prop({ type: String, enum: ['first_half', 'second_half'] })
  halfDayType?: 'first_half' | 'second_half';

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  })
  status: LeaveStatus;

  @Prop({ trim: true })
  attachmentUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  @Prop({ trim: true })
  rejectionReason: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LeaveApplicationSchema = SchemaFactory.createForClass(LeaveApplication);

LeaveApplicationSchema.index({ userId: 1, organizationId: 1, status: 1 });
LeaveApplicationSchema.index({ organizationId: 1, status: 1 });
LeaveApplicationSchema.index({ fromDate: 1, toDate: 1 });
