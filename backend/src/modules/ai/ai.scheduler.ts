import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiService } from './ai.service';
import { Organization } from '../../schemas/organization.schema';

@Injectable()
export class AiScheduler {
  private readonly logger = new Logger(AiScheduler.name);

  constructor(
    private readonly aiService: AiService,
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
  ) {}

  /**
   * Run absenteeism risk analysis every Monday at 6:00 AM.
   * Iterates through all active organizations and generates alerts.
   */
  @Cron(CronExpression.EVERY_WEEK, { name: 'absenteeism-risk-analysis' })
  async handleWeeklyAbsenteeismAnalysis() {
    this.logger.log('⏰ [Cron] Weekly absenteeism risk analysis starting...');

    try {
      const orgs = await this.orgModel
        .find({ isActive: true })
        .select('_id name')
        .lean();

      for (const org of orgs) {
        try {
          const result = await this.aiService.runAbsenteeismAnalysis(org._id.toString());
          this.logger.log(
            `✅ [Cron] Org "${org.name}": Generated ${result.generated} alerts ` +
            `(${result.periodStart} → ${result.periodEnd})`,
          );
        } catch (err: any) {
          this.logger.error(`❌ [Cron] Failed for org "${org.name}": ${err.message}`);
        }
      }

      this.logger.log('✅ [Cron] Weekly absenteeism analysis complete.');
    } catch (err: any) {
      this.logger.error(`❌ [Cron] Absenteeism analysis failed globally: ${err.message}`);
    }
  }
}
