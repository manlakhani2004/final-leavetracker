import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HolidayController } from './holiday.controller';
import { HolidayService } from './holiday.service';
import { Holiday, HolidaySchema } from '../../schemas/holiday.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Holiday.name, schema: HolidaySchema },
    ]),
  ],
  controllers: [HolidayController],
  providers: [HolidayService],
  exports: [HolidayService],
})
export class HolidayModule {}
