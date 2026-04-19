import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../schemas/audit-log.schema';

export interface LogAuditParams {
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description: string;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  /** Fire-and-forget audit log creation. Never throws. */
  log(params: LogAuditParams): void {
    this.auditLogModel.create(params).catch((err) =>
      console.error('AuditLog error:', err),
    );
  }

  async getAuditLogs(
    organizationId: string,
    query: {
      action?: string;
      entityType?: string;
      actorId?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = { organizationId };

    if (query.action) filter.action = { $regex: query.action, $options: 'i' };
    if (query.entityType) filter.entityType = query.entityType;
    if (query.actorId) filter.actorId = query.actorId;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate + 'T23:59:59');
    }

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEntityHistory(
    organizationId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.auditLogModel
      .find({ organizationId, entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getStats(organizationId: string) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [total, recent, byAction] = await Promise.all([
      this.auditLogModel.countDocuments({ organizationId }),
      this.auditLogModel.countDocuments({
        organizationId,
        createdAt: { $gte: last30Days },
      }),
      this.auditLogModel.aggregate([
        { $match: { organizationId, createdAt: { $gte: last30Days } } },
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    return { total, last30Days: recent, byEntityType: byAction };
  }
}
