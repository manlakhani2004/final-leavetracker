export class ApiResponseDto<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  constructor(success: boolean, message: string, data: T, meta?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
