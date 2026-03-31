import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HolidayType = 'national' | 'optional';

@Schema({ timestamps: true })
export class Holiday extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: String, enum: ['national', 'optional'], default: 'national' })
  type: HolidayType;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);

HolidaySchema.index({ organizationId: 1, date: 1 });
