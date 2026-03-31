import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationSettings } from '../../schemas/organization.schema';
import { User } from '../../schemas/user.schema';
import { Utils } from '../../common/utils';
import { RegisterOrgDto } from './dto/register-org.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerOrg(registerOrgDto: RegisterOrgDto) {
    try {
      // Check if organization already exists with same domain or name
      const existingOrg = await this.orgModel.findOne({
        $or: [
          { name: registerOrgDto.organizationName },
          ...(registerOrgDto.domain ? [{ domain: registerOrgDto.domain }] : []),
        ],
      });

      if (existingOrg) {
        throw new ConflictException('Organization with this name or domain already exists');
      }

      // Create organization
      const orgData = {
        name: registerOrgDto.organizationName,
        domain: registerOrgDto.domain || '',
        address: registerOrgDto.address || '',
        settings: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timezone: 'UTC',
          leaveYearStart: 1,
        } as OrganizationSettings,
      };

      const organization = await this.orgModel.create([orgData]);
      const orgId = organization[0]._id;

      // Check if admin email already exists
      const existingUser = await this.userModel.findOne({ email: registerOrgDto.adminEmail });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Create admin user
      const passwordHash = await Utils.hashPassword(registerOrgDto.adminPassword);
      const adminData = {
        name: registerOrgDto.adminName,
        email: registerOrgDto.adminEmail,
        passwordHash,
        role: 'org_admin' as const,
        organizationId: orgId,
        isActive: true,
      };

      const adminUser = await this.userModel.create([adminData]);

      // Generate tokens
      const tokens = await this.generateTokens(adminUser[0]);

      return {
        user: {
          id: adminUser[0]._id,
          name: adminUser[0].name,
          email: adminUser[0].email,
          role: adminUser[0].role,
          organizationId: orgId,
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await Utils.comparePassword(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        department: user.department,
        designation: user.designation,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findById(payload.sub);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }

      const isRefreshTokenValid = await Utils.comparePassword(refreshToken, user.refreshToken);

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Access denied');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Access denied');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });

    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -refreshToken');
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const organization = await this.orgModel.findById(user.organizationId);

    return {
      ...user.toObject(),
      organization: organization ? organization.toObject() : null,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {};
    
    if (updateProfileDto.name) {
      updateData.name = updateProfileDto.name;
    }
    
    if (updateProfileDto.password) {
      updateData.passwordHash = await Utils.hashPassword(updateProfileDto.password);
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    // Hash and store refresh token
    const hashedRefreshToken = await Utils.hashPassword(refreshToken);
    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
