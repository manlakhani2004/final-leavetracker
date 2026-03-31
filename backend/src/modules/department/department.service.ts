import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department } from '../../schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, organizationId: string) {
    try {
      const existing = await this.departmentModel.findOne({
        organizationId: new Types.ObjectId(organizationId),
        name: { $regex: new RegExp(`^${createDepartmentDto.name}$`, 'i') },
      });

      if (existing) {
        throw new ConflictException('Department with this name already exists in your organization');
      }

      const department = await this.departmentModel.create({
        ...createDepartmentDto,
        organizationId: new Types.ObjectId(organizationId),
        headId: createDepartmentDto.headId ? new Types.ObjectId(createDepartmentDto.headId) : undefined,
      });

      return department;
    } catch (error) {
      this.logger.error(`Error creating department: ${error.message}`);
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException(`Failed to create department: ${error.message}`);
    }
  }

  async findAll(organizationId: string, includeInactive: boolean = false) {
    const query: any = { organizationId: new Types.ObjectId(organizationId) };
    if (!includeInactive) {
      query.isActive = true;
    }
    return this.departmentModel.find(query).populate('headId', 'name email').sort({ name: 1 });
  }

  async findOne(id: string, organizationId: string) {
    const department = await this.departmentModel.findOne({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    }).populate('headId', 'name email');

    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, organizationId: string) {
    try {
      const updateData: any = { ...updateDepartmentDto };
      if (updateDepartmentDto.headId) {
        updateData.headId = new Types.ObjectId(updateDepartmentDto.headId);
      }

      const department = await this.departmentModel.findOneAndUpdate(
        { _id: id, organizationId: new Types.ObjectId(organizationId) },
        updateData,
        { new: true, runValidators: true }
      );

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      return department;
    } catch (error) {
      this.logger.error(`Error updating department ${id}: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update department: ${error.message}`);
    }
  }

  async remove(id: string, organizationId: string) {
    // Optionally: check if users are assigned to this department before deleting or just deactivate
    const result = await this.departmentModel.findOneAndDelete({
      _id: id,
      organizationId: new Types.ObjectId(organizationId),
    });

    if (!result) {
      throw new NotFoundException('Department not found');
    }

    return { message: 'Department deleted successfully' };
  }
}
