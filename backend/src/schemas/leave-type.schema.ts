import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LeaveType extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  totalDaysAllowed: number;

  @Prop({ default: false })
  carryForwardAllowed: boolean;

  @Prop({ default: 0, min: 0 })
  carryForwardLimit: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isPaid: boolean;

  @Prop({ type: String, enum: ['all', 'male', 'female'], default: 'all' })
  applicableGender: string;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);

LeaveTypeSchema.index({ organizationId: 1, name: 1 });
