import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OrganizationSettings {
  @Prop({ type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] })
  workingDays: string[];

  @Prop({ type: [{ name: String, date: Date, type: String }], default: [] })
  holidays: Array<{ name: string; date: Date; type: string }>;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 1 })
  leaveYearStart: number; // Month number (1-12)
}

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  domain: string;

  @Prop({ trim: true })
  logo: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ type: Object, default: {} })
  settings: OrganizationSettings;

  @Prop({ default: true })
  isActive: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
