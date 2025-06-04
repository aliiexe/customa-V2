export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password?: string; // Optional when returned from API
  phone: string;
  address: string;
  city: string;
  balance: number;
  actived: boolean;
  createdAt: string;
  updatedAt: string;
}