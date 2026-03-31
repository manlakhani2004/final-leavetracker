import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../../schemas/organization.schema';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [organizations, total] = await Promise.all([
      this.orgModel.find().skip(skip).limit(limit),
      this.orgModel.countDocuments(),
    ]);

    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const organization = await this.orgModel.findById(id);
    
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto) {
    const organization = await this.orgModel.findByIdAndUpdate(
      id,
      updateOrgDto,
      { new: true, runValidators: true },
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async remove(id: string) {
    const organization = await this.orgModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return { message: 'Organization deactivated successfully' };
  }
}
