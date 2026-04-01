import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveApplication, LeaveStatus } from '../../schemas/leave-application.schema';
import { LeaveBalance } from '../../schemas/leave-balance.schema';
import { LeaveType } from '../../schemas/leave-type.schema';
import { User } from '../../schemas/user.schema';
import { Organization } from '../../schemas/organization.schema';
import { Holiday } from '../../schemas/holiday.schema';
import { Utils } from '../../common/utils';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';

@Injectable()
export class LeaveApplicationService {
  constructor(
    @InjectModel(LeaveApplication.name) private leaveAppModel: Model<LeaveApplication>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    @InjectModel(Holiday.name) private holidayModel: Model<Holiday>,
  ) {}

  async apply(createLeaveApplicationDto: CreateLeaveApplicationDto, userId: string, organizationId: string) {
    try {
      const fromDate = new Date(createLeaveApplicationDto.fromDate);
      const toDate = new Date(createLeaveApplicationDto.toDate);

      if (fromDate > toDate) {
        throw new BadRequestException('From date cannot be greater than to date');
      }

      // Get organization settings
      const organization = await this.orgModel.findById(organizationId);
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const workingDays = organization.settings?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      // Get holidays
      const holidays = await this.holidayModel.find({ 
        organizationId,
        date: { $gte: fromDate, $lte: toDate },
      });
      const holidayDates = holidays.map(h => h.date);

      // Calculate working days
      const totalDays = Utils.getWorkingDaysBetweenDates(fromDate, toDate, workingDays, holidayDates);

      if (totalDays === 0) {
        throw new BadRequestException('No working days in selected period');
      }

      // Check for overlapping applications
      const overlappingApplication = await this.leaveAppModel.findOne({
        userId,
        organizationId,
        status: { $in: ['pending', 'approved'] },
        $or: [
          { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } },
        ],
      });

      if (overlappingApplication) {
        throw new BadRequestException('You already have a leave application for this period');
      }

      // Check leave balance
      const leaveType = await this.leaveTypeModel.findById(createLeaveApplicationDto.leaveTypeId);
      if (!leaveType) {
        throw new NotFoundException('Leave type not found');
      }

      const year = fromDate.getFullYear();
      console.log(year);
      console.log(userId);
      console.log(organizationId);
      console.log(createLeaveApplicationDto.leaveTypeId);
      let balance = await this.leaveBalanceModel.findOne({
        userId,
        organizationId,
        leaveTypeId: createLeaveApplicationDto.leaveTypeId,
        year,
      });
      console.log(balance);
      if (!balance) {
        // Lazy initialize the leave balance for the user if they've never applied for this type before
        try {
          balance = await this.leaveBalanceModel.create({
            userId,
            organizationId,
            leaveTypeId: createLeaveApplicationDto.leaveTypeId,
            year,
            totalAllocated: leaveType.totalDaysAllowed,
            used: 0,
            carryForward: 0,
            remaining: leaveType.totalDaysAllowed,
          });
        } catch (error: any) {
          if (error.code === 11000) {
            balance = await this.leaveBalanceModel.findOne({
              userId,
              organizationId,
              leaveTypeId: createLeaveApplicationDto.leaveTypeId,
              year,
            });
          } else {
            throw error;
          }
        }
      }

      if (!balance || balance.remaining < totalDays) {
        throw new BadRequestException(`Insufficient leave balance. Available: ${balance?.remaining || 0}, Requested: ${totalDays}`);
      }

      // Create leave application
      const leaveApplication = await this.leaveAppModel.create([{
        ...createLeaveApplicationDto,
        userId,
        organizationId,
        fromDate,
        toDate,
        totalDays,
        status: 'pending',
      }]);

      return leaveApplication[0];
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    userId: string,
    organizationId: string,
    role: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { organizationId };

    // Filter based on role
    if (role === 'employee') {
      query.userId = userId;
    } else if (role === 'manager') {
      // Get team members
      const teamMembers = await this.userModel.find({ managerId: userId, organizationId });
      const teamMemberIds = teamMembers.map(m => m._id);
      query.userId = { $in: [...teamMemberIds, userId] };
    }
    // org_admin and hr_manager can see all

    if (status) {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      this.leaveAppModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email department')
        .populate('leaveTypeId', 'name isPaid')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 }),
      this.leaveAppModel.countDocuments(query),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, organizationId: string, userId: string, role: string) {
    let application;
    
    if (role === 'employee') {
      application = await this.leaveAppModel.findOne({ _id: id, userId, organizationId })
        .populate('userId', 'name email department')
        .populate('leaveTypeId', 'name isPaid')
        .populate('approvedBy', 'name email');
    } else {
      application = await this.leaveAppModel.findById(id)
        .populate('userId', 'name email department')
        .populate('leaveTypeId', 'name isPaid')
        .populate('approvedBy', 'name email');
    }

    if (!application || application.organizationId.toString() !== organizationId) {
      throw new NotFoundException('Leave application not found');
    }

    return application;
  }

  async approve(id: string, userId: string, organizationId: string, role: string) {
    const application = await this.leaveAppModel.findById(id);
    
    if (!application || application.organizationId.toString() !== organizationId) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not in pending state');
    }

    // Only managers, hr_managers, and org_admins can approve
    if (!['org_admin', 'hr_manager', 'manager'].includes(role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // If manager, check if they manage this employee
    if (role === 'manager') {
      const user = await this.userModel.findById(application.userId);
      if (!user || user.managerId?.toString() !== userId) {
        throw new ForbiddenException('You can only approve leaves for your team members');
      }
    }

    // Deduct leave balance
    const year = application.fromDate.getFullYear();
    await this.leaveBalanceModel.findOneAndUpdate(
      {
        userId: application.userId,
        organizationId,
        leaveTypeId: application.leaveTypeId,
        year,
      },
      {
        $inc: { used: application.totalDays, remaining: -application.totalDays },
      },
    );

    // Update application status
    application.status = 'approved';
    application.approvedBy = new Types.ObjectId(userId);
    application.approvedAt = new Date();
    await application.save();

    return application;
  }

  async reject(id: string, userId: string, organizationId: string, role: string, rejectionReason: string) {
    const application = await this.leaveAppModel.findById(id);
    
    if (!application || application.organizationId.toString() !== organizationId) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not in pending state');
    }

    // Only managers, hr_managers, and org_admins can reject
    if (!['org_admin', 'hr_manager', 'manager'].includes(role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // If manager, check if they manage this employee
    if (role === 'manager') {
      const user = await this.userModel.findById(application.userId);
      if (!user || user.managerId?.toString() !== userId) {
        throw new ForbiddenException('You can only approve/reject leaves for your team members');
      }
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    application.approvedBy = new Types.ObjectId(userId);
    application.approvedAt = new Date();
    await application.save();

    return application;
  }

  async cancel(id: string, userId: string, organizationId: string) {
    const application = await this.leaveAppModel.findOne({ _id: id, userId, organizationId });
    
    if (!application) {
      throw new NotFoundException('Leave application not found');
    }

    if (application.status !== 'pending' && application.status !== 'approved') {
      throw new BadRequestException('Cannot cancel this leave application');
    }

    // Restore leave balance if approved
    if (application.status === 'approved') {
      const year = application.fromDate.getFullYear();
      await this.leaveBalanceModel.findOneAndUpdate(
        {
          userId,
          organizationId,
          leaveTypeId: application.leaveTypeId,
          year,
        },
        {
          $inc: { used: -application.totalDays, remaining: application.totalDays },
        },
      );
    }

    application.status = 'cancelled';
    await application.save();

    return application;
  }
}
