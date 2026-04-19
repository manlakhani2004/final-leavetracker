import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  LeaveApplication,
  LeaveStatus,
} from "../../schemas/leave-application.schema";
import { LeaveBalance } from "../../schemas/leave-balance.schema";
import { LeaveType } from "../../schemas/leave-type.schema";
import { User } from "../../schemas/user.schema";
import { Organization } from "../../schemas/organization.schema";
import { Holiday } from "../../schemas/holiday.schema";
import { Utils } from "../../common/utils";
import { CreateLeaveApplicationDto } from "./dto/create-leave-application.dto";
import { UpdateLeaveApplicationDto } from "./dto/update-leave-application.dto";
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class LeaveApplicationService {
  constructor(
    @InjectModel(LeaveApplication.name)
    private leaveAppModel: Model<LeaveApplication>,
    @InjectModel(LeaveBalance.name)
    private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    @InjectModel(Holiday.name) private holidayModel: Model<Holiday>,
    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  async apply(
    createLeaveApplicationDto: CreateLeaveApplicationDto,
    userId: string,
    organizationId: string,
  ) {
    try {
      const fromDate = new Date(createLeaveApplicationDto.fromDate);
      const toDate = new Date(createLeaveApplicationDto.toDate);

      if (fromDate > toDate) {
        throw new BadRequestException(
          "From date cannot be greater than to date",
        );
      }

      // Get organization settings
      const organization = await this.orgModel.findById(organizationId);
      if (!organization) {
        throw new NotFoundException("Organization not found");
      }

      const workingDays = organization.settings?.workingDays || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];

      // Get holidays
      const holidays = await this.holidayModel.find({
        organizationId,
        date: { $gte: fromDate, $lte: toDate },
      });
      const holidayDates = holidays.map((h) => h.date);

      // Calculate working days
      let totalDays = Utils.getWorkingDaysBetweenDates(
        fromDate,
        toDate,
        workingDays,
        holidayDates,
      );

      if (createLeaveApplicationDto.halfDayType) {
        if (fromDate.getTime() !== toDate.getTime()) {
          throw new BadRequestException("Half day leave must be on a single day");
        }
        totalDays = 0.5;
      }

      if (totalDays === 0) {
        throw new BadRequestException("No working days in selected period");
      }

      // Check for overlapping applications
      const overlappingApplication = await this.leaveAppModel.findOne({
        userId,
        organizationId,
        status: { $in: ["pending", "approved"] },
        $or: [{ fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }],
      });

      if (overlappingApplication) {
        throw new BadRequestException(
          "You already have a leave application for this period",
        );
      }

      // Check leave balance
      const leaveType = await this.leaveTypeModel.findById(
        createLeaveApplicationDto.leaveTypeId,
      );
      if (!leaveType) {
        throw new NotFoundException("Leave type not found");
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
        throw new BadRequestException(
          `Insufficient leave balance. Available: ${balance?.remaining || 0}, Requested: ${totalDays}`,
        );
      }

      // Create leave application
      const leaveApplication = await this.leaveAppModel.create([
        {
          ...createLeaveApplicationDto,
          userId,
          organizationId,
          fromDate,
          toDate,
          totalDays,
          status: "pending",
        },
      ]);

      // Fire notifications to manager + HR/admin (async, don't block)
      const applicantUser = await this.userModel.findById(userId);
      this.notificationService.notifyLeaveApplied({
        applicantId: userId,
        applicantName: applicantUser?.name || 'Employee',
        organizationId,
        leaveApplicationId: leaveApplication[0]._id.toString(),
        leaveTypeName: leaveType.name,
        totalDays,
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      }).catch((err) => console.error('Notification error (apply):', err));

      // Email manager about new leave application
      if (applicantUser?.managerId) {
        const manager = await this.userModel.findById(applicantUser.managerId);
        if (manager?.email) {
          const org = await this.orgModel.findById(organizationId);
          this.mailService.sendLeaveApplied({
            managerEmail: manager.email,
            managerName: manager.name,
            employeeName: applicantUser.name,
            leaveTypeName: leaveType.name,
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: toDate.toISOString().split('T')[0],
            totalDays,
            reason: createLeaveApplicationDto.reason || '',
            organizationName: org?.name || 'Organization',
          }).catch((err) => console.error('Email error (apply):', err));
        }
      }

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
    if (role === "employee") {
      query.userId = userId;
    } else if (role === "manager") {
      // Get team members
      const managerObjectId = new Types.ObjectId(userId);
      const orgObjectId = new Types.ObjectId(organizationId);
      const teamMembers = await this.userModel.find({
        managerId: managerObjectId,
        organizationId: orgObjectId,
      });
      const teamMemberIds = teamMembers.map((m) => m._id.toString());  // Convert to string to match leave application format
      query.userId = {
        $in: [...teamMemberIds, userId],  // Use string types consistently
      };
    }
    // org_admin and hr_manager can see all

    if (status) {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      this.leaveAppModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email department")
        .populate("leaveTypeId", "name isPaid")
        .populate("approvedBy", "name email")
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

  async findById(
    id: string,
    organizationId: string,
    userId: string,
    role: string,
  ) {
    let application;

    if (role === "employee") {
      application = await this.leaveAppModel
        .findOne({ _id: id, userId, organizationId })
        .populate("userId", "name email department")
        .populate("leaveTypeId", "name isPaid")
        .populate("approvedBy", "name email");
    } else {
      application = await this.leaveAppModel
        .findById(id)
        .populate("userId", "name email department")
        .populate("leaveTypeId", "name isPaid")
        .populate("approvedBy", "name email");
    }

    if (
      !application ||
      application.organizationId.toString() !== organizationId
    ) {
      throw new NotFoundException("Leave application not found");
    }

    return application;
  }

  async approve(
    id: string,
    userId: string,
    organizationId: string,
    role: string,
  ) {
    const application = await this.leaveAppModel.findById(id);

    if (
      !application ||
      application.organizationId.toString() !== organizationId
    ) {
      throw new NotFoundException("Leave application not found");
    }

    if (application.status !== "pending") {
      throw new BadRequestException("Application is not in pending state");
    }

    // Only managers, hr_managers, and org_admins can approve
    if (!["org_admin", "hr_manager", "manager"].includes(role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    // If manager, check if they manage this employee
    if (role === "manager") {
      const user = await this.userModel.findById(application.userId);
      if (!user || user.managerId?.toString() !== userId) {
        throw new ForbiddenException(
          "You can only approve leaves for your team members",
        );
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
        $inc: {
          used: application.totalDays,
          remaining: -application.totalDays,
        },
      },
    );

    // Update application status
    application.status = "approved";
    application.approvedBy = new Types.ObjectId(userId);
    application.approvedAt = new Date();
    await application.save();

    // Notify the applicant that their leave was approved
    const approverUser = await this.userModel.findById(userId);
    const approvedLeaveType = await this.leaveTypeModel.findById(application.leaveTypeId);
    this.notificationService.notifyLeaveApproved({
      applicantId: application.userId.toString(),
      organizationId,
      leaveApplicationId: application._id.toString(),
      leaveTypeName: approvedLeaveType?.name || 'Leave',
      totalDays: application.totalDays,
      approverName: approverUser?.name || 'Approver',
      approverId: userId,
    }).catch((err) => console.error('Notification error (approve):', err));

    // Email employee about approval
    const applicant = await this.userModel.findById(application.userId);
    if (applicant?.email) {
      const org = await this.orgModel.findById(organizationId);
      this.mailService.sendLeaveStatusUpdate({
        employeeEmail: applicant.email,
        employeeName: applicant.name,
        status: 'approved',
        leaveTypeName: approvedLeaveType?.name || 'Leave',
        fromDate: application.fromDate.toISOString().split('T')[0],
        toDate: application.toDate.toISOString().split('T')[0],
        totalDays: application.totalDays,
        reviewerName: approverUser?.name || 'Approver',
        organizationName: org?.name || 'Organization',
      }).catch((err) => console.error('Email error (approve):', err));
    }

    return application;
  }

  async reject(
    id: string,
    userId: string,
    organizationId: string,
    role: string,
    rejectionReason: string,
  ) {
    const application = await this.leaveAppModel.findById(id);

    if (
      !application ||
      application.organizationId.toString() !== organizationId
    ) {
      throw new NotFoundException("Leave application not found");
    }

    if (application.status !== "pending") {
      throw new BadRequestException("Application is not in pending state");
    }

    // Only managers, hr_managers, and org_admins can reject
    if (!["org_admin", "hr_manager", "manager"].includes(role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    // If manager, check if they manage this employee
    if (role === "manager") {
      const user = await this.userModel.findById(application.userId);
      if (!user || user.managerId?.toString() !== userId) {
        throw new ForbiddenException(
          "You can only approve/reject leaves for your team members",
        );
      }
    }

    application.status = "rejected";
    application.rejectionReason = rejectionReason;
    application.approvedBy = new Types.ObjectId(userId);
    application.approvedAt = new Date();
    await application.save();

    // Notify the applicant that their leave was rejected
    const rejectorUser = await this.userModel.findById(userId);
    const rejectedLeaveType = await this.leaveTypeModel.findById(application.leaveTypeId);
    this.notificationService.notifyLeaveRejected({
      applicantId: application.userId.toString(),
      organizationId,
      leaveApplicationId: application._id.toString(),
      leaveTypeName: rejectedLeaveType?.name || 'Leave',
      totalDays: application.totalDays,
      rejectorName: rejectorUser?.name || 'Reviewer',
      rejectorId: userId,
      reason: rejectionReason,
    }).catch((err) => console.error('Notification error (reject):', err));

    // Email employee about rejection
    const rejectedApplicant = await this.userModel.findById(application.userId);
    if (rejectedApplicant?.email) {
      const org = await this.orgModel.findById(organizationId);
      this.mailService.sendLeaveStatusUpdate({
        employeeEmail: rejectedApplicant.email,
        employeeName: rejectedApplicant.name,
        status: 'rejected',
        leaveTypeName: rejectedLeaveType?.name || 'Leave',
        fromDate: application.fromDate.toISOString().split('T')[0],
        toDate: application.toDate.toISOString().split('T')[0],
        totalDays: application.totalDays,
        reviewerName: rejectorUser?.name || 'Reviewer',
        rejectionReason,
        organizationName: org?.name || 'Organization',
      }).catch((err) => console.error('Email error (reject):', err));
    }

    return application;
  }

  async cancel(id: string, userId: string, organizationId: string) {
    const application = await this.leaveAppModel.findOne({
      _id: id,
      userId,
      organizationId,
    });

    if (!application) {
      throw new NotFoundException("Leave application not found");
    }

    if (application.status !== "pending" && application.status !== "approved") {
      throw new BadRequestException("Cannot cancel this leave application");
    }

    // Restore leave balance if approved
    if (application.status === "approved") {
      const year = application.fromDate.getFullYear();
      await this.leaveBalanceModel.findOneAndUpdate(
        {
          userId,
          organizationId,
          leaveTypeId: application.leaveTypeId,
          year,
        },
        {
          $inc: {
            used: -application.totalDays,
            remaining: application.totalDays,
          },
        },
      );
    }

    application.status = "cancelled";
    await application.save();

    // Notify manager + HR/admin that the leave was cancelled
    const cancellingUser = await this.userModel.findById(userId);
    const cancelledLeaveType = await this.leaveTypeModel.findById(application.leaveTypeId);
    this.notificationService.notifyLeaveCancelled({
      applicantId: userId,
      applicantName: cancellingUser?.name || 'Employee',
      organizationId,
      leaveApplicationId: application._id.toString(),
      leaveTypeName: cancelledLeaveType?.name || 'Leave',
      totalDays: application.totalDays,
    }).catch((err) => console.error('Notification error (cancel):', err));

    // Email manager about cancellation
    if (cancellingUser?.managerId) {
      const manager = await this.userModel.findById(cancellingUser.managerId);
      if (manager?.email) {
        const org = await this.orgModel.findById(organizationId);
        this.mailService.sendLeaveCancelled({
          managerEmail: manager.email,
          managerName: manager.name,
          employeeName: cancellingUser.name,
          leaveTypeName: cancelledLeaveType?.name || 'Leave',
          fromDate: application.fromDate.toISOString().split('T')[0],
          toDate: application.toDate.toISOString().split('T')[0],
          totalDays: application.totalDays,
          organizationName: org?.name || 'Organization',
        }).catch((err) => console.error('Email error (cancel):', err));
      }
    }

    return application;
  }

  async update(
    id: string,
    userId: string,
    organizationId: string,
    dto: UpdateLeaveApplicationDto,
  ) {
    const application = await this.leaveAppModel.findOne({ _id: id, userId, organizationId });

    if (!application) {
      throw new NotFoundException('Leave application not found');
    }
    if (application.status !== 'pending') {
      throw new BadRequestException('Only pending leave applications can be edited');
    }

    const fromDate = new Date(dto.fromDate || application.fromDate);
    const toDate = new Date(dto.toDate || application.toDate);

    if (fromDate > toDate) {
      throw new BadRequestException('From date cannot be greater than to date');
    }

    // Recalculate working days
    const organization = await this.orgModel.findById(organizationId);
    const workingDays = organization?.settings?.workingDays || ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const holidays = await this.holidayModel.find({
      organizationId,
      date: { $gte: fromDate, $lte: toDate },
    });
    let totalDays = dto.halfDayType
      ? 0.5
      : Utils.getWorkingDaysBetweenDates(fromDate, toDate, workingDays, holidays.map((h) => h.date));

    if (totalDays === 0) {
      throw new BadRequestException('No working days in the selected period');
    }

    // Check for overlap (exclude current application)
    const overlap = await this.leaveAppModel.findOne({
      _id: { $ne: id },
      userId,
      organizationId,
      status: { $in: ['pending', 'approved'] },
      $or: [{ fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }],
    });
    if (overlap) {
      throw new BadRequestException('You already have a leave application for this period');
    }

    const leaveTypeId = dto.leaveTypeId || application.leaveTypeId.toString();
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const year = fromDate.getFullYear();

    // Restore old balance if the leave type or days changed
    const oldLeaveTypeId = application.leaveTypeId.toString();
    if (oldLeaveTypeId !== leaveTypeId.toString()) {
      // Fully restore old type balance (old was pending so nothing was deducted yet)
      // nothing to restore since pending apps don't deduct balance
    }

    // Check new balance is sufficient
    let balance = await this.leaveBalanceModel.findOne({
      userId, organizationId, leaveTypeId, year,
    });
    if (!balance) {
      balance = await this.leaveBalanceModel.create({
        userId, organizationId, leaveTypeId, year,
        totalAllocated: leaveType.totalDaysAllowed,
        used: 0,
        carryForward: 0,
        remaining: leaveType.totalDaysAllowed,
      });
    }

    if (balance.remaining < totalDays) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.remaining}, Requested: ${totalDays}`,
      );
    }

    // Apply updates
    application.leaveTypeId = leaveTypeId as any;
    application.fromDate = fromDate;
    application.toDate = toDate;
    application.totalDays = totalDays;
    if (dto.reason) application.reason = dto.reason;
    if (dto.halfDayType !== undefined) application.halfDayType = dto.halfDayType as any;
    await application.save();

    return application;
  }
}
