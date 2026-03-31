import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Exclude password from partial type and add it separately
class UpdateUserPartialDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class UpdateUserDto extends UpdateUserPartialDto {
  password?: string;
}
