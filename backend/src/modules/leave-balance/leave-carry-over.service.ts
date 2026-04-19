import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveBalance } from '../../schemas/leave-balance.schema';
import { LeaveType } from '../../schemas/leave-type.schema';
import { User } from '../../schemas/user.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class LeaveCarryOverService {
  private readonly logger = new Logger(LeaveCarryOverService.name);

  constructor(
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Runs at 00:01 on January 1st every year.
   * For every org × user × leave type:
   *   1. Carry forward remaining days (up to carryForwardLimit) if carryForwardAllowed
   *   2. Create the new year's balance record
   */
  @Cron('1 0 1 1 *', { name: 'annual-carry-forward' })
  async runAnnualCarryForward() {
    this.logger.log('▶ Annual carry-forward cron started');
    const fromYear = new Date().getFullYear() - 1;
    const toYear = new Date().getFullYear();
    await this.processCarryForward(fromYear, toYear, 'system', 'System', 'system');
    this.logger.log(`✔ Annual carry-forward done: ${fromYear} → ${toYear}`);
  }

  /**
   * Can also be triggered manually by an admin via the service directly.
   */
  async processCarryForward(
    fromYear: number,
    toYear: number,
    actorId: string,
    actorName: string,
    actorRole: string,
  ): Promise<{ processed: number; carried: number; errors: number }> {
    let processed = 0;
    let carried = 0;
    let errors = 0;

    // Get all active leave types (across all orgs)
    const leaveTypes = await this.leaveTypeModel.find({ isActive: true });

    for (const lt of leaveTypes) {
      const orgId = lt.organizationId.toString();

      // Get all active users in this org
      const users = await this.userModel
        .find({ organizationId: lt.organizationId, isActive: true })
        .select('_id name');

      for (const user of users) {
        try {
          processed++;
          const userId = user._id.toString();

          // Fetch previous year balance
          const prevBalance = await this.leaveBalanceModel.findOne({
            userId,
            organizationId: orgId,
            leaveTypeId: lt._id.toString(),
            year: fromYear,
          });

          // Calculate carry-forward amount
          let carryForward = 0;
          if (lt.carryForwardAllowed && prevBalance && prevBalance.remaining > 0) {
            carryForward = lt.carryForwardLimit > 0
              ? Math.min(prevBalance.remaining, lt.carryForwardLimit)
              : prevBalance.remaining;
          }

          // Create or update the new year's balance
          const newYearBalance = await this.leaveBalanceModel.findOneAndUpdate(
            {
              userId,
              organizationId: orgId,
              leaveTypeId: lt._id.toString(),
              year: toYear,
            },
            {
              $setOnInsert: {
                userId,
                organizationId: orgId,
                leaveTypeId: lt._id.toString(),
                year: toYear,
              },
              $set: {
                totalAllocated: lt.totalDaysAllowed,
                carryForward,
                used: 0,
                remaining: lt.totalDaysAllowed + carryForward,
              },
            },
            { upsert: true, new: true },
          );

          if (carryForward > 0) {
            carried++;
            this.auditLogService.log({
              organizationId: orgId,
              actorId,
              actorName,
              actorRole,
              action: 'leave_balance.carry_forward',
              entityType: 'leave_balance',
              entityId: newYearBalance?._id?.toString(),
              entityName: `${user.name} — ${lt.name}`,
              newValues: { carryForward, totalAllocated: lt.totalDaysAllowed, year: toYear },
              description: `Carried forward ${carryForward} day(s) of ${lt.name} for ${user.name} from ${fromYear} to ${toYear}`,
            });
          }
        } catch (err) {
          errors++;
          this.logger.error(
            `Carry-forward failed for user ${user._id}, leaveType ${lt._id}: ${err.message}`,
          );
        }
      }
    }

    this.logger.log(`Carry-forward complete — processed: ${processed}, carried: ${carried}, errors: ${errors}`);
    return { processed, carried, errors };
  }
}
