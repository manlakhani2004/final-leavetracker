import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService, ChatMessage } from './ai.service';
import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChatHistoryItemDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

class AiChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatMessage[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: AiChatRequestDto, @Request() req: any) {
    const { sub: userId, organizationId, email, role } = req.user;

    const result = await this.aiService.chat(
      userId.toString(),
      organizationId.toString(),
      email,
      role,
      dto.message,
      dto.history || [],
    );

    return {
      success: true,
      data: result,
    };
  }
}
