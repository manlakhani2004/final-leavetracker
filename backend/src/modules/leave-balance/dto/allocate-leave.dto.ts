import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class AllocateLeaveDto {
  @IsNotEmpty()
  userId: Types.ObjectId | string;

  @IsNotEmpty()
  leaveTypeId: Types.ObjectId | string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAllocated: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carryForward?: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;
}
