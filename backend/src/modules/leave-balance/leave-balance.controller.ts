import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveCarryOverService } from './leave-carry-over.service';
import { AllocateLeaveDto } from './dto/allocate-leave.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from '../auth/types';

@Controller('leave-balances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveBalanceController {
  constructor(
    private leaveBalanceService: LeaveBalanceService,
    private leaveCarryOverService: LeaveCarryOverService,
  ) {}

  @Post('allocate')
  @Roles('org_admin', 'hr_manager')
  async allocate(
    @Body() allocateLeaveDto: AllocateLeaveDto,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveBalanceService.allocate(allocateLeaveDto, user.organizationId);
    return new ApiResponseDto(true, 'Leave balance allocated successfully', result);
  }

  @Get('me')
  async findMyBalances(
    @RequestUser() user: any,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    const result = await this.leaveBalanceService.findMyBalances(user.sub, user.organizationId, year);
    return new ApiResponseDto(true, 'Leave balances fetched successfully', result);
  }

  @Get('user/:userId')
  @Roles('org_admin', 'hr_manager')
  async findUserBalances(
    @Param('userId') userId: string,
    @RequestUser() user: any,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    const result = await this.leaveBalanceService.findUserBalances(userId, user.organizationId, year);
    return new ApiResponseDto(true, 'User leave balances fetched successfully', result);
  }

  @Post('carry-forward')
  @Roles('org_admin', 'hr_manager')
  async carryForward(
    @Query('fromYear', new ParseIntPipe()) fromYear: number,
    @Query('toYear', new ParseIntPipe()) toYear: number,
    @RequestUser() user: any,
  ) {
    const result = await this.leaveBalanceService.carryForwardBalances(user.organizationId, fromYear, toYear);
    return new ApiResponseDto(true, result.message, {});
  }

  @Post('carry-forward/run')
  @Roles('org_admin', 'hr_manager')
  async runCarryForward(
    @Query('fromYear', new ParseIntPipe({ optional: true })) fromYear: number,
    @Query('toYear', new ParseIntPipe({ optional: true })) toYear: number,
    @RequestUser() user: any,
  ) {
    const from = fromYear || new Date().getFullYear() - 1;
    const to = toYear || new Date().getFullYear();
    const result = await this.leaveCarryOverService.processCarryForward(
      from, to, user.sub, user.name || 'Admin', user.role,
    );
    return new ApiResponseDto(true, `Carry-forward complete`, result);
  }
}
