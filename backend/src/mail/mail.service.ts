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
}
