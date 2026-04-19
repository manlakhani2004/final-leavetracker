import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}
  async sendOtp(otp: string, email: string) {
    try {
      await this.mailService.sendMail({
        to: email,
        subject: 'Your Login OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Login Verification</h2>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for login is:</p>
              
              <div style="
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 4px;
                margin: 20px 0;
                color: #2c3e50;
              ">
                ${otp}
              </div>
    
              <p>This OTP is valid for <strong>1 minute 30 seconds</strong>.</p>
              <p>Please do not share this code with anyone.</p>
    
              <br/>
              <p>Thank you,<br/>School Management System</p>
            </div>
          `,
      });
      return { message: 'OTP sent successfully' };
    } catch {
      throw new InternalServerErrorException(
        'Unable to send OTP email. Please try again.',
      );
    }
  }

  async sendMail(resetLink: string, email: string) {
    await this.mailService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
                <h3>Dear User,</h3>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                `,
    });
  }

  async sendStudentCredentials(
    email: string,
    password: string,
    schoolName: string,
  ) {
    try {
      await this.mailService.sendMail({
        to: email,
        subject: `Welcome to ${schoolName} - Your Login Credentials`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; border:1px solid #eee; padding:20px; border-radius:8px;">
        
        <h2 style="color:#2c3e50;">Welcome to ${schoolName}</h2>

        <p>Hello Student,</p>

        <p>Your account has been successfully created in the <strong>${schoolName}</strong> School Management System.</p>

        <p>You can login using the following credentials:</p>

        <div style="background:#f4f6f8; padding:15px; border-radius:6px; margin:15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>

        <p style="color:#e74c3c;">
          For security reasons, please change your password after your first login.
        </p>

        <p>If you face any issue logging in, please contact your school administration.</p>

        <br/>

        <p>Best Regards,</p>
        <p><strong>${schoolName}</strong></p>

      </div>
      `,
      });

      return { message: 'Student credentials email sent successfully' };
    } catch (error) {
      console.error('Student credential email failed:', error);
    }
  }

  async sendTeacherCredentials(
    email: string,
    password: string,
    schoolName: string,
    employeeCode: string,
  ) {
    try {
      await this.mailService.sendMail({
        to: email,
        subject: `Welcome to ${schoolName} - Teacher Account Created`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; border:1px solid #eee; padding:20px; border-radius:8px;">
        
        <h2 style="color:#2c3e50;">Welcome to ${schoolName}</h2>

        <p>Hello Teacher,</p>

        <p>Your account has been successfully created in the <strong>${schoolName}</strong> School Management System.</p>

        <p>Your login credentials are:</p>

        <div style="background:#f4f6f8; padding:15px; border-radius:6px; margin:15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Employee Code:</strong> ${employeeCode}</p>
        </div>

        <p style="color:#e74c3c;">
          Please change your password after your first login for security purposes.
        </p>

        <p>If you face any issues logging in, please contact the school administration.</p>

        <br/>

        <p>Best Regards,</p>
        <p><strong>${schoolName}</strong></p>

      </div>
      `,
      });

      return { message: 'Teacher credentials email sent successfully' };
    } catch (error) {
      console.error('Teacher credential email failed:', error);
    }
  }

  async sendUserCredentials(
    email: string,
    password: string,
    name: string,
    role: string,
    organizationName: string,
  ) {
    const roleDisplayMap: Record<string, string> = {
      employee: 'Employee',
      manager: 'Manager',
      hr_manager: 'HR Manager',
      org_admin: 'Admin',
    };
    const displayRole = roleDisplayMap[role] || role;

    try {
      await this.mailService.sendMail({
        to: email,
        subject: `Welcome to ${organizationName} - Your Account Has Been Created`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; border:1px solid #eee; padding:20px; border-radius:8px;">
        
        <h2 style="color:#2c3e50;">Welcome to ${organizationName}</h2>

        <p>Hello ${name},</p>

        <p>Your <strong>${displayRole}</strong> account has been successfully created in the <strong>${organizationName}</strong> Leave Management System.</p>

        <p>Your login credentials are:</p>

        <div style="background:#f4f6f8; padding:15px; border-radius:6px; margin:15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Role:</strong> ${displayRole}</p>
        </div>

        <p style="color:#e74c3c;">
          Please change your password after your first login for security purposes.
        </p>

        <p>If you face any issues logging in, please contact the administration.</p>

        <br/>

        <p>Best Regards,</p>
        <p><strong>${organizationName}</strong></p>

      </div>
      `,
      });

      return { message: 'User credentials email sent successfully' };
    } catch (error) {
      console.error('User credential email failed:', error);
    }
  }

  // ─── Leave Application Emails ────────────────────────────────────────────

  async sendLeaveApplied(params: {
    managerEmail: string;
    managerName: string;
    employeeName: string;
    leaveTypeName: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    reason: string;
    organizationName: string;
  }) {
    try {
      await this.mailService.sendMail({
        to: params.managerEmail,
        subject: `Leave Request – ${params.employeeName} | ${params.leaveTypeName}`,
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;border-radius:8px;">
          <h2 style="color:#2c3e50;margin-bottom:4px;">📋 New Leave Request</h2>
          <p style="color:#888;margin-top:0;">Action required from you</p>

          <p>Hello <strong>${params.managerName}</strong>,</p>

          <p><strong>${params.employeeName}</strong> has submitted a leave request that requires your review.</p>

          <div style="background:#f4f6f8;padding:16px;border-radius:6px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#555;width:140px;"><strong>Leave Type:</strong></td><td>${params.leaveTypeName}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>From:</strong></td><td>${params.fromDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>To:</strong></td><td>${params.toDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>Total Days:</strong></td><td>${params.totalDays} day(s)</td></tr>
              <tr><td style="padding:6px 0;color:#555;vertical-align:top;"><strong>Reason:</strong></td><td>${params.reason || 'No reason provided'}</td></tr>
            </table>
          </div>

          <p>Please log in to the Leave Management System to approve or reject this request.</p>

          <br/>
          <p>Best Regards,</p>
          <p><strong>${params.organizationName}</strong></p>
        </div>`,
      });
    } catch (error) {
      console.error('Leave applied email failed:', error);
    }
  }

  async sendLeaveStatusUpdate(params: {
    employeeEmail: string;
    employeeName: string;
    status: 'approved' | 'rejected';
    leaveTypeName: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    reviewerName: string;
    rejectionReason?: string;
    organizationName: string;
  }) {
    const isApproved = params.status === 'approved';
    const statusLabel = isApproved ? 'Approved ✅' : 'Rejected ❌';
    const statusColor = isApproved ? '#27ae60' : '#e74c3c';

    try {
      await this.mailService.sendMail({
        to: params.employeeEmail,
        subject: `Leave ${isApproved ? 'Approved' : 'Rejected'} – ${params.leaveTypeName} | ${params.fromDate}`,
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;border-radius:8px;">
          <h2 style="color:${statusColor};margin-bottom:4px;">Leave ${isApproved ? 'Approved' : 'Rejected'}</h2>
          <p style="color:#888;margin-top:0;">Status: <strong style="color:${statusColor};">${statusLabel}</strong></p>

          <p>Hello <strong>${params.employeeName}</strong>,</p>

          <p>Your leave request has been <strong style="color:${statusColor};">${params.status}</strong> by <strong>${params.reviewerName}</strong>.</p>

          <div style="background:#f4f6f8;padding:16px;border-radius:6px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#555;width:140px;"><strong>Leave Type:</strong></td><td>${params.leaveTypeName}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>From:</strong></td><td>${params.fromDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>To:</strong></td><td>${params.toDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>Total Days:</strong></td><td>${params.totalDays} day(s)</td></tr>
              ${!isApproved && params.rejectionReason ? `<tr><td style="padding:6px 0;color:#555;vertical-align:top;"><strong>Reason:</strong></td><td style="color:#e74c3c;">${params.rejectionReason}</td></tr>` : ''}
            </table>
          </div>

          ${!isApproved ? '<p>You may submit a new leave request if needed.</p>' : '<p>Enjoy your time off!</p>'}

          <br/>
          <p>Best Regards,</p>
          <p><strong>${params.organizationName}</strong></p>
        </div>`,
      });
    } catch (error) {
      console.error('Leave status email failed:', error);
    }
  }

  async sendLeaveCancelled(params: {
    managerEmail: string;
    managerName: string;
    employeeName: string;
    leaveTypeName: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    organizationName: string;
  }) {
    try {
      await this.mailService.sendMail({
        to: params.managerEmail,
        subject: `Leave Cancelled – ${params.employeeName} | ${params.leaveTypeName}`,
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;border-radius:8px;">
          <h2 style="color:#e67e22;margin-bottom:4px;">🚫 Leave Cancelled</h2>
          <p style="color:#888;margin-top:0;">FYI – no action needed</p>

          <p>Hello <strong>${params.managerName}</strong>,</p>

          <p><strong>${params.employeeName}</strong> has cancelled their leave request.</p>

          <div style="background:#f4f6f8;padding:16px;border-radius:6px;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#555;width:140px;"><strong>Leave Type:</strong></td><td>${params.leaveTypeName}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>From:</strong></td><td>${params.fromDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>To:</strong></td><td>${params.toDate}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><strong>Total Days:</strong></td><td>${params.totalDays} day(s)</td></tr>
            </table>
          </div>

          <br/>
          <p>Best Regards,</p>
          <p><strong>${params.organizationName}</strong></p>
        </div>`,
      });
    } catch (error) {
      console.error('Leave cancelled email failed:', error);
    }
  }
}
