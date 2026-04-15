import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  HttpException,
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

  /**
   * GET /ai/health — check which AI providers are available
   * Priority order: 1) Ollama   2) Gemini (fallback)
   */
  @Get('health')
  async health() {
    const status = await this.aiService.healthCheck();
    return {
      success: true,
      data: status,
    };
  }

  /**
   * POST /ai/chat — conversational chat with LeaveBot
   * Priority: Ollama first → if Ollama fails → Gemini fallback
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: AiChatRequestDto, @Request() req: any) {
    const { sub: userId, organizationId, email, role } = req.user;

    try {
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
    } catch (err: any) {
      // Return a proper 503 instead of generic 500
      throw new HttpException(
        {
          success: false,
          message: err.message || 'AI service temporarily unavailable. Please try again.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * POST /ai/recommend-approval — Get AI recommendation for a leave application
   */
  @Post('recommend-approval')
  @HttpCode(HttpStatus.OK)
  async recommendApproval(@Body('applicationId') applicationId: string, @Request() req: any) {
    const { organizationId } = req.user;

    if (!applicationId) {
      throw new HttpException(
        { success: false, message: 'applicationId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.aiService.recommendApproval(
        applicationId,
        organizationId.toString(),
      );

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          success: false,
          message: err.message || 'AI recommendation service temporarily unavailable.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
