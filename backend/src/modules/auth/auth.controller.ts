import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterOrgDto } from './dto/register-org.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { RequestUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register-org')
  @HttpCode(HttpStatus.CREATED)
  async registerOrg(@Body() registerOrgDto: RegisterOrgDto) {
    const result = await this.authService.registerOrg(registerOrgDto);
    return new ApiResponseDto(true, 'Organization registered successfully', result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(true, 'Login successful', result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(refreshTokenDto.refreshToken);
    return new ApiResponseDto(true, 'Token refreshed successfully', result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@RequestUser() user: any) {
    const result = await this.authService.logout(user.sub);
    return new ApiResponseDto(true, result.message, result);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@RequestUser() user: any) {
    const result = await this.authService.getProfile(user.sub);
    return new ApiResponseDto(true, 'Profile fetched successfully', result);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@RequestUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.authService.updateProfile(user.sub, updateProfileDto);
    return new ApiResponseDto(true, 'Profile updated successfully', result);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(email);
    return new ApiResponseDto(true, result.message, null);
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword }: ResetPasswordDto) {
    const result = await this.authService.resetPassword(token, newPassword);
    return new ApiResponseDto(true, result.message, null);
  }
}
