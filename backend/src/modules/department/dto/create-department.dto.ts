import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId, ValidateIf } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateIf((object, value) => value !== '' && value !== null)
  @IsOptional()
  @IsMongoId()
  headId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
