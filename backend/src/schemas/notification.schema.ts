import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationType =
  | 'leave_applied'
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_cancelled'
  | 'leave_reminder'
  | 'system';

@Schema({ timestamps: true })
export class Notification extends Document {
  /** Who receives this notification */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'leave_applied',
      'leave_approved',
      'leave_rejected',
      'leave_cancelled',
      'leave_reminder',
      'system',
    ],
    required: true,
  })
  type: NotificationType;

  /** Human-readable title, e.g. "New Leave Application" */
  @Prop({ required: true, trim: true })
  title: string;

  /** Detailed message, e.g. "John Doe applied for 3 days of Sick Leave…" */
  @Prop({ required: true, trim: true })
  message: string;

  /** Optional link to a related leave application */
  @Prop({ type: Types.ObjectId, ref: 'LeaveApplication' })
  leaveApplicationId: Types.ObjectId;

  /** Who triggered the notification (the actor) */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  actorId: Types.ObjectId;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound index for fast queries: user's unread notifications
NotificationSchema.index({ recipientId: 1, organizationId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
