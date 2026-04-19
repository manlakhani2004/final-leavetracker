import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateLeaveApplicationDto {
  @IsOptional()
  @IsString()
  leaveTypeId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  halfDayType?: 'first_half' | 'second_half';
}
