import { APIResponse, expect } from '@playwright/test';
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

export type RegisteredUser = RegisterUserRequest & { id: string };

export class UsersApi extends BaseApi {
  async register(user: RegisterUserRequest): Promise<APIResponse> {
    return this.request.post('/users/register', { data: user });
  }

  async registerUser(user: RegisterUserRequest): Promise<RegisteredUser> {
    const body = await this.parseBody<UserResponse>(
      await this.register(user),
      201
    );

    expect(body.id).toBeTruthy();
    expect(body).toMatchObject({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
    });
    expect(body.address).toMatchObject({
      street: user.address.street,
      city: user.address.city,
      country: user.address.country,
    });
    expect(body).not.toHaveProperty('password');

    return { ...user, id: body.id };
  }

  async getCurrentUser(): Promise<APIResponse> {
    return this.request.get('/users/me');
  }

  async getCurrentUserProfile(): Promise<UserResponse> {
    return this.parseBody<UserResponse>(await this.getCurrentUser(), 200);
  }
}
