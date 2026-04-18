import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from '../../schemas/notification.schema';
import { User } from '../../schemas/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  // ─── Create a single notification ────────────────────────────────────
  async create(data: {
    recipientId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    leaveApplicationId?: string;
    actorId?: string;
  }): Promise<Notification> {
    const notification = await this.notificationModel.create(data);
    return notification;
  }

  // ─── Bulk-create notifications for multiple recipients ───────────────
  async createMany(
    recipients: string[],
    data: {
      organizationId: string;
      type: NotificationType;
      title: string;
      message: string;
      leaveApplicationId?: string;
      actorId?: string;
    },
  ): Promise<void> {
    const docs = recipients.map((recipientId) => ({
      recipientId,
      ...data,
    }));
    await this.notificationModel.insertMany(docs);
  }

  // ─── List notifications for a user (paginated) ──────────────────────
  async findAll(
    userId: string,
    organizationId: string,
    filter?: 'all' | 'unread',
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { recipientId: userId, organizationId };

    if (filter === 'unread') {
      query.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actorId', 'name email role')
        .populate('leaveApplicationId', 'fromDate toDate totalDays status')
        .lean(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Unread count ────────────────────────────────────────────────────
  async getUnreadCount(userId: string, organizationId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: userId,
      organizationId,
      isRead: false,
    });
  }

  // ─── Mark one notification as read ───────────────────────────────────
  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  // ─── Mark ALL notifications as read ──────────────────────────────────
  async markAllAsRead(userId: string, organizationId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { recipientId: userId, organizationId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.modifiedCount;
  }

  // ─── Delete a notification ───────────────────────────────────────────
  async delete(id: string, userId: string): Promise<void> {
    await this.notificationModel.deleteOne({ _id: id, recipientId: userId });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  HIGH-LEVEL HELPERS — called from LeaveApplicationService
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * When an employee applies for leave, notify:
   *  • Their direct manager (if assigned)
   *  • All HR managers in the organization
   *  • All org admins
   */
  async notifyLeaveApplied(params: {
    applicantId: string;
    applicantName: string;
    organizationId: string;
    leaveApplicationId: string;
    leaveTypeName: string;
    totalDays: number;
    fromDate: string;
    toDate: string;
  }): Promise<void> {
    const { applicantId, applicantName, organizationId, leaveApplicationId, leaveTypeName, totalDays, fromDate, toDate } = params;

    // Find recipients: manager + HR managers + org admins
    const applicant = await this.userModel.findById(applicantId);
    const recipients: string[] = [];

    // Direct manager
    if (applicant?.managerId) {
      recipients.push(applicant.managerId.toString());
    }

    // HR managers and org admins in this organization
    const adminsAndHR = await this.userModel.find({
      organizationId,
      role: { $in: ['hr_manager', 'org_admin'] },
      _id: { $ne: applicantId }, // don't notify the applicant themselves
      isActive: true,
    });
    adminsAndHR.forEach((u) => {
      const uid = u._id.toString();
      if (!recipients.includes(uid)) {
        recipients.push(uid);
      }
    });

    if (recipients.length === 0) return;

    const dateRange = totalDays === 0.5
      ? `half day on ${fromDate}`
      : totalDays === 1
        ? `1 day on ${fromDate}`
        : `${totalDays} days (${fromDate} — ${toDate})`;

    await this.createMany(recipients, {
      organizationId,
      type: 'leave_applied',
      title: 'New Leave Application',
      message: `${applicantName} applied for ${leaveTypeName} — ${dateRange}`,
      leaveApplicationId,
      actorId: applicantId,
    });
  }

  /**
   * When a leave is approved, notify the applicant.
   */
  async notifyLeaveApproved(params: {
    applicantId: string;
    organizationId: string;
    leaveApplicationId: string;
    leaveTypeName: string;
    totalDays: number;
    approverName: string;
    approverId: string;
  }): Promise<void> {
    const { applicantId, organizationId, leaveApplicationId, leaveTypeName, totalDays, approverName, approverId } = params;

    await this.create({
      recipientId: applicantId,
      organizationId,
      type: 'leave_approved',
      title: 'Leave Approved ✓',
      message: `Your ${leaveTypeName} (${totalDays} day${totalDays !== 1 ? 's' : ''}) has been approved by ${approverName}`,
      leaveApplicationId,
      actorId: approverId,
    });
  }

  /**
   * When a leave is rejected, notify the applicant.
   */
  async notifyLeaveRejected(params: {
    applicantId: string;
    organizationId: string;
    leaveApplicationId: string;
    leaveTypeName: string;
    totalDays: number;
    rejectorName: string;
    rejectorId: string;
    reason?: string;
  }): Promise<void> {
    const { applicantId, organizationId, leaveApplicationId, leaveTypeName, totalDays, rejectorName, rejectorId, reason } = params;

    const reasonSuffix = reason ? ` Reason: "${reason}"` : '';

    await this.create({
      recipientId: applicantId,
      organizationId,
      type: 'leave_rejected',
      title: 'Leave Rejected',
      message: `Your ${leaveTypeName} (${totalDays} day${totalDays !== 1 ? 's' : ''}) has been rejected by ${rejectorName}.${reasonSuffix}`,
      leaveApplicationId,
      actorId: rejectorId,
    });
  }

  /**
   * When an employee cancels their leave, notify:
   *  • Their direct manager
   *  • All HR managers and org admins
   */
  async notifyLeaveCancelled(params: {
    applicantId: string;
    applicantName: string;
    organizationId: string;
    leaveApplicationId: string;
    leaveTypeName: string;
    totalDays: number;
  }): Promise<void> {
    const { applicantId, applicantName, organizationId, leaveApplicationId, leaveTypeName, totalDays } = params;

    const applicant = await this.userModel.findById(applicantId);
    const recipients: string[] = [];

    if (applicant?.managerId) {
      recipients.push(applicant.managerId.toString());
    }

    const adminsAndHR = await this.userModel.find({
      organizationId,
      role: { $in: ['hr_manager', 'org_admin'] },
      _id: { $ne: applicantId },
      isActive: true,
    });
    adminsAndHR.forEach((u) => {
      const uid = u._id.toString();
      if (!recipients.includes(uid)) {
        recipients.push(uid);
      }
    });

    if (recipients.length === 0) return;

    await this.createMany(recipients, {
      organizationId,
      type: 'leave_cancelled',
      title: 'Leave Cancelled',
      message: `${applicantName} cancelled their ${leaveTypeName} (${totalDays} day${totalDays !== 1 ? 's' : ''})`,
      leaveApplicationId,
      actorId: applicantId,
    });
  }
}
