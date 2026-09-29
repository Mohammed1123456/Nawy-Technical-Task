import { APIResponse } from '@playwright/test';
import { BaseApi } from '../base-api';

export interface UserAddress {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: UserAddress;
}

export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  created_at: string;
  address: Partial<UserAddress>;
}

export class UsersApi extends BaseApi {
  async register(user: RegisterUserRequest): Promise<APIResponse> {
    return this.request.post('/users/register', { data: user });
  }

  async getCurrentUser(): Promise<APIResponse> {
    return this.request.get('/users/me');
  }
}
