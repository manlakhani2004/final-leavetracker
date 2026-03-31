import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  type?: 'national' | 'optional';
}
