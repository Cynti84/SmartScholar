export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
}
export interface ApiResponse<T> {
  success: boolean;
  user?: T;
  data?: T;
  message?: string;
}
