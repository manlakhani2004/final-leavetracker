import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class AiChatDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  context?: string; // extra context like report data
}

export class AiReasonDto {
  @IsNotEmpty()
  @IsString()
  leaveType: string;

  @IsNotEmpty()
  @IsString()
  fromDate: string;

  @IsNotEmpty()
  @IsString()
  toDate: string;

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  halfDayType?: string;
}

export class AiInsightDto {
  @IsNotEmpty()
  @IsString()
  reportType: string;

  @IsNotEmpty()
  data: any; // summary-level report data
}
