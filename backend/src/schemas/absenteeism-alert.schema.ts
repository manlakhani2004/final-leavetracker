import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RiskLevel = 'high' | 'medium' | 'low';

@Schema()
export class RiskFlag {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;
}

export const RiskFlagSchema = SchemaFactory.createForClass(RiskFlag);

@Schema({ timestamps: true })
export class AbsenteeismAlert extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  employeeName: string;

  @Prop({ trim: true })
  department: string;

  @Prop({ type: String, enum: ['high', 'medium', 'low'], required: true })
  riskLevel: RiskLevel;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  riskScore: number;

  @Prop({ type: [RiskFlagSchema], default: [] })
  flags: RiskFlag[];

  @Prop({ trim: true })
  aiSummary: string;

  @Prop({ trim: true })
  provider: string;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AbsenteeismAlertSchema = SchemaFactory.createForClass(AbsenteeismAlert);

AbsenteeismAlertSchema.index({ organizationId: 1, createdAt: -1 });
AbsenteeismAlertSchema.index({ organizationId: 1, riskLevel: 1 });
AbsenteeismAlertSchema.index({ organizationId: 1, userId: 1, periodEnd: -1 });
