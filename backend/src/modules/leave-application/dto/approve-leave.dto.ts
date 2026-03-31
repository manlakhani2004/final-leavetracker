import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApproveLeaveDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
