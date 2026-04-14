import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateLeaveApplicationDto {
  @IsNotEmpty()
  leaveTypeId: Types.ObjectId | string;

  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  halfDayType?: 'first_half' | 'second_half';
}
