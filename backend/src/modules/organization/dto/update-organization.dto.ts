import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  settings?: {
    workingDays?: string[];
    timezone?: string;
    leaveYearStart?: number;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
