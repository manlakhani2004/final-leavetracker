import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsMongoId } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  headId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
