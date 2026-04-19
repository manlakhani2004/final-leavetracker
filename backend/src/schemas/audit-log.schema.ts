import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditAction =
  | 'user.create' | 'user.update' | 'user.delete' | 'user.deactivate' | 'user.activate'
  | 'leave.apply' | 'leave.approve' | 'leave.reject' | 'leave.cancel' | 'leave.update'
  | 'department.create' | 'department.update' | 'department.delete'
  | 'leave_type.create' | 'leave_type.update' | 'leave_type.delete'
  | 'leave_balance.carry_forward' | 'leave_balance.allocate'
  | 'holiday.create' | 'holiday.update' | 'holiday.delete'
  | 'org.update';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  organizationId: string;

  // Who performed the action
  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true })
  actorName: string;

  @Prop({ required: true })
  actorRole: string;

  // What action
  @Prop({ required: true })
  action: string;

  // What entity was affected
  @Prop({ required: true })
  entityType: string; // 'user', 'leave_application', 'department', etc.

  @Prop()
  entityId: string;

  @Prop()
  entityName: string; // Human-readable description

  // Change details (optional)
  @Prop({ type: Object })
  previousValues?: Record<string, any>;

  @Prop({ type: Object })
  newValues?: Record<string, any>;

  // Extra context
  @Prop()
  description: string;

  @Prop()
  ipAddress?: string;

  // createdAt is auto-managed by timestamps: true
  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
