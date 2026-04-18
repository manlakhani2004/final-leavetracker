import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /** List notifications (paginated) with optional filter */
  @Get()
  async findAll(
    @RequestUser() user: any,
    @Query('filter') filter?: 'all' | 'unread',
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;
    const limit = limitStr ? parseInt(limitStr, 10) || 20 : 20;

    const result = await this.notificationService.findAll(
      user.sub,
      user.organizationId,
      filter,
      page,
      limit,
    );
    return new ApiResponseDto(
      true,
      'Notifications fetched successfully',
      result.notifications,
      result.pagination,
    );
  }

  /** Get unread count for the bell badge */
  @Get('unread-count')
  async getUnreadCount(@RequestUser() user: any) {
    const count = await this.notificationService.getUnreadCount(
      user.sub,
      user.organizationId,
    );
    return new ApiResponseDto(true, 'Unread count fetched', { count });
  }

  /** Mark a single notification as read */
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @RequestUser() user: any,
  ) {
    const notification = await this.notificationService.markAsRead(id, user.sub);
    return new ApiResponseDto(true, 'Notification marked as read', notification);
  }

  /** Mark all notifications as read */
  @Patch('read-all')
  async markAllAsRead(@RequestUser() user: any) {
    const count = await this.notificationService.markAllAsRead(
      user.sub,
      user.organizationId,
    );
    return new ApiResponseDto(true, `${count} notifications marked as read`, { count });
  }

  /** Delete a notification */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @RequestUser() user: any,
  ) {
    await this.notificationService.delete(id, user.sub);
    return new ApiResponseDto(true, 'Notification deleted', null);
  }
}
