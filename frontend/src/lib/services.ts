import { api } from './api';
import { User, Organization, LeaveType, LeaveBalance, LeaveApplication, Holiday } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const authService = {
  registerOrg: async (data: {
    organizationName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    domain?: string;
    address?: string;
  }) => {
    const response = await api.post<ApiResponse<any>>('/auth/register-org', data);
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<any>>('/auth/login', { email, password });
    return response.data.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<any>>('/auth/logout');
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User & { organization: Organization }>>('/auth/me');
    return response.data.data;
  },
  updateProfile: async (data: { name?: string; password?: string }) => {
    const response = await api.patch<ApiResponse<any>>('/auth/profile', data);
    return response.data.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<any>>('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post<ApiResponse<any>>('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export const userService = {
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<any[]>>('/users', { params: { page, limit } });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: any) => {
    const response = await api.post<ApiResponse<any>>('/users', data);
    return response.data.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.patch<ApiResponse<any>>(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/users/${id}`);
    return response.data.data;
  },

  getTeamMembers: async (managerId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/users/${managerId}/team`);
    return response.data.data;
  },
};

export const leaveTypeService = {
  getLeaveTypes: async (includeInactive?: boolean) => {
    const response = await api.get<ApiResponse<LeaveType[]>>('/leave-types', {
      params: { includeInactive },
    });
    return response.data.data;
  },

  getLeaveType: async (id: string) => {
    const response = await api.get<ApiResponse<LeaveType>>(`/leave-types/${id}`);
    return response.data.data;
  },

  createLeaveType: async (data: Partial<LeaveType>) => {
    const response = await api.post<ApiResponse<LeaveType>>('/leave-types', data);
    return response.data.data;
  },

  updateLeaveType: async (id: string, data: Partial<LeaveType>) => {
    const response = await api.patch<ApiResponse<LeaveType>>(`/leave-types/${id}`, data);
    return response.data.data;
  },

  deleteLeaveType: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/leave-types/${id}`);
    return response.data.data;
  },
};

export const leaveBalanceService = {
  getMyBalances: async (year?: number) => {
    const response = await api.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me', { params: { year } });
    return response.data.data;
  },

  getUserBalances: async (userId: string, year?: number) => {
    const response = await api.get<ApiResponse<LeaveBalance[]>>(`/leave-balances/user/${userId}`, { params: { year } });
    return response.data.data;
  },

  allocateBalance: async (data: any) => {
    const response = await api.post<ApiResponse<LeaveBalance>>('/leave-balances/allocate', data);
    return response.data.data;
  },

  carryForward: async (fromYear: number, toYear: number) => {
    const response = await api.post<ApiResponse<any>>('/leave-balances/carry-forward', null, {
      params: { fromYear, toYear },
    });
    return response.data.data;
  },
};

export const leaveApplicationService = {
  applyLeave: async (data: {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => {
    const response = await api.post<ApiResponse<LeaveApplication>>('/leave-applications', data);
    return response.data.data;
  },

  getMyLeaves: async (status?: string, page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<LeaveApplication[]>>('/leave-applications', {
      params: { status, page, limit },
    });
    return response.data;
  },

  getLeaveApplication: async (id: string) => {
    const response = await api.get<ApiResponse<LeaveApplication>>(`/leave-applications/${id}`);
    return response.data.data;
  },

  approveLeave: async (id: string) => {
    const response = await api.patch<ApiResponse<LeaveApplication>>(`/leave-applications/${id}/approve`);
    return response.data.data;
  },

  rejectLeave: async (id: string, reason: string) => {
    const response = await api.patch<ApiResponse<LeaveApplication>>(`/leave-applications/${id}/reject`, {
      rejectionReason: reason,
    });
    return response.data.data;
  },

  cancelLeave: async (id: string) => {
    const response = await api.patch<ApiResponse<LeaveApplication>>(`/leave-applications/${id}/cancel`);
    return response.data.data;
  },
};

export const holidayService = {
  getHolidays: async (year?: number) => {
    const response = await api.get<ApiResponse<Holiday[]>>('/holidays', { params: { year } });
    return response.data.data;
  },

  createHoliday: async (data: { name: string; date: string; type?: 'national' | 'optional' }) => {
    const response = await api.post<ApiResponse<Holiday>>('/holidays', data);
    return response.data.data;
  },
  updateHoliday: async (id: string, data: { name?: string; date?: string; type?: 'national' | 'optional' }) => {
    const response = await api.patch<ApiResponse<Holiday>>(`/holidays/${id}`, data);
    return response.data.data;
  },

  deleteHoliday: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/holidays/${id}`);
    return response.data.data;
  },
};

export const departmentService = {
  getDepartments: async (includeInactive?: boolean) => {
    const response = await api.get<ApiResponse<any[]>>('/departments', { params: { includeInactive } });
    return response.data.data;
  },
  createDepartment: async (data: { name: string; headId?: string }) => {
    const response = await api.post<ApiResponse<any>>('/departments', data);
    return response.data.data;
  },
  updateDepartment: async (id: string, data: { name?: string; headId?: string; isActive?: boolean }) => {
    const response = await api.patch<ApiResponse<any>>(`/departments/${id}`, data);
    return response.data.data;
  },
  deleteDepartment: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/departments/${id}`);
    return response.data.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get<ApiResponse<any>>('/dashboard/summary');
    return response.data.data;
  },

  getTeamSummary: async () => {
    const response = await api.get<ApiResponse<any>>('/dashboard/team');
    return response.data.data;
  },

  getOrgSummary: async () => {
    const response = await api.get<ApiResponse<any>>('/dashboard/org');
    return response.data.data;
  },

  getOrgStats: async () => {
    const response = await api.get<ApiResponse<any>>('/dashboard/org');
    return response.data.data;
  },

  getChartData: async () => {
    const response = await api.get<ApiResponse<any>>('/dashboard/chart-data');
    return response.data.data;
  },
};

export const reportService = {
  getMyBalanceReport: async (year?: number) => {
    const response = await api.get<ApiResponse<any>>('/reports/my-balance', { params: { year } });
    return response.data.data;
  },

  getMyHistoryReport: async (params?: { year?: number; status?: string; leaveTypeId?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<any>>('/reports/my-history', { params });
    return response.data.data;
  },

  getOrgSummaryReport: async (params?: { year?: number; startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<any>>('/reports/org-summary', { params });
    return response.data.data;
  },

  getTeamSummaryReport: async (params?: { year?: number }) => {
    const response = await api.get<ApiResponse<any>>('/reports/team-summary', { params });
    return response.data.data;
  },
};

export const organizationService = {
  getOrganizations: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<any[]>>('/organizations', { params: { page, limit } });
    return response.data;
  },

  getOrganization: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/organizations/${id}`);
    return response.data.data;
  },

  updateOrganization: async (id: string, data: any) => {
    const response = await api.patch<ApiResponse<any>>(`/organizations/${id}`, data);
    return response.data.data;
  },

  deleteOrganization: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/organizations/${id}`);
    return response.data.data;
  },
};
