import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../schemas/user.schema';
import { Utils } from '../../common/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto, organizationId: string, requesterRole: UserRole) {
    // Only org_admin and hr_manager can create users
    if (!['org_admin', 'hr_manager'].includes(requesterRole)) {
      throw new BadRequestException('Insufficient permissions');
    }

    // Check if email already exists in organization
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered in this organization');
    }

    // Validate manager if provided
    if (createUserDto.managerId) {
      const manager = await this.userModel.findById(createUserDto.managerId);
      if (!manager || manager.organizationId.toString() !== organizationId) {
        throw new BadRequestException('Invalid manager');
      }
    }

    // Auto-assign department manager if role is employee and no manager specified
    if (createUserDto.role === 'employee' && !createUserDto.managerId && createUserDto.departmentId) {
      const departmentManager = await this.userModel.findOne({
        departmentId: new Types.ObjectId(createUserDto.departmentId),
        role: 'manager',
        organizationId: new Types.ObjectId(organizationId),
        isActive: true
      });
      
      if (departmentManager) {
        createUserDto.managerId = departmentManager._id;
      }
    }

    const passwordHash = await Utils.hashPassword(createUserDto.password);
    
    const userData: any = {
      ...createUserDto,
      passwordHash,
      organizationId: new Types.ObjectId(organizationId),
    };

    if (userData.managerId === '' || userData.managerId === null) {
      delete userData.managerId;
    } else if (userData.managerId) {
      userData.managerId = new Types.ObjectId(userData.managerId as string);
    }

    if (userData.departmentId === '' || userData.departmentId === null) {
      delete userData.departmentId;
    } else if (userData.departmentId) {
      userData.departmentId = new Types.ObjectId(userData.departmentId as string);
    }

    const user = await this.userModel.create(userData);
    return this.sanitizeUser(user);
  }

  async findAll(organizationId: string, page: number = 1, limit: number = 10) {
    const orgId = new Types.ObjectId(organizationId);
    const skip = (page - 1) * limit;
    
    try {
      const [users, total] = await Promise.all([
        this.userModel.find({ organizationId: orgId })
          .skip(skip)
          .limit(limit)
          .populate('managerId', 'name email')
          .populate('departmentId', 'name')
          .sort({ createdAt: -1 }),
        this.userModel.countDocuments({ organizationId: orgId }),
      ]);

      return {
        users: users.map(user => this.sanitizeUser(user)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in UserService.findAll:', error);
      throw error;
    }
  }

  async findById(id: string, organizationId: string) {
    const user = await this.userModel.findOne({ 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(organizationId) 
    }).populate('managerId', 'name email').populate('departmentId', 'name');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, organizationId: string, requesterRole: UserRole) {
    // Only org_admin and hr_manager can update users
    if (!['org_admin', 'hr_manager'].includes(requesterRole)) {
      throw new BadRequestException('Insufficient permissions');
    }

    // Don't allow changing email to an existing one
    const updateData: any = { ...updateUserDto };
    
    if ((updateData as any).email) {
      const existingUser = await this.userModel.findOne({
        email: (updateData as any).email,
        organizationId: new Types.ObjectId(organizationId),
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    }

    // Hash new password if provided
    if ((updateData as any).password) {
      updateData.passwordHash = await Utils.hashPassword((updateData as any).password);
      delete updateData.password;
    }

    updateData.$unset = {};

    if (updateData.managerId === '' || updateData.managerId === null) {
      updateData.$unset.managerId = 1;
      delete updateData.managerId;
    } else if (updateData.managerId) {
      updateData.managerId = new Types.ObjectId(updateData.managerId as string);
    }

    if (updateData.departmentId === '' || updateData.departmentId === null) {
      updateData.$unset.departmentId = 1;
      delete updateData.departmentId;
    } else if (updateData.departmentId) {
      updateData.departmentId = new Types.ObjectId(updateData.departmentId as string);
    }

    if (Object.keys(updateData.$unset).length === 0) {
      delete updateData.$unset;
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), organizationId: new Types.ObjectId(organizationId) },
      updateData,
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async remove(id: string, organizationId: string, requesterRole: UserRole) {
    // Only org_admin can delete users
    if (requesterRole !== 'org_admin') {
      throw new BadRequestException('Insufficient permissions');
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, organizationId },
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deactivated successfully' };
  }

  async findTeamMembers(managerId: string, organizationId: string) {
    const teamMembers = await this.userModel.find({
      managerId: new Types.ObjectId(managerId),
      organizationId: new Types.ObjectId(organizationId),
      isActive: true,
    }).populate('managerId', 'name email');

    return teamMembers.map(member => this.sanitizeUser(member));
  }

  private sanitizeUser(user: User) {
    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.refreshToken;
    return userObj;
  }
}
