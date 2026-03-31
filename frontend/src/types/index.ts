export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'hr_manager' | 'manager' | 'employee';
  organizationId: string;
  department?: string;
  designation?: string;
  organization?: Organization;
}

export interface Organization {
  id: string;
  _id?: string;
  name: string;
  domain?: string;
  logo?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  settings: {
    workingDays: string[];
    timezone: string;
    leaveYearStart: number;
  };
}

export interface LeaveType {
  id: string;
  _id?: string;
  name: string;
  totalDaysAllowed: number;
  carryForwardAllowed: boolean;
  carryForwardLimit: number;
  isActive: boolean;
  isPaid: boolean;
  applicableGender: 'all' | 'male' | 'female';
}

export interface LeaveBalance {
  id: string;
  _id?: string;
  userId: string;
  organizationId: string;
  leaveTypeId: string;
  year: number;
  totalAllocated: number;
  used: number;
  remaining: number;
  carryForward: number;
}

export interface LeaveApplication {
  id: string;
  _id?: string;
  userId: any;
  organizationId: string;
  leaveTypeId: any;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  attachmentUrl?: string;
  approvedBy?: any;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  _id?: string;
  organizationId: string;
  name: string;
  date: string;
  type: 'national' | 'optional';
}
