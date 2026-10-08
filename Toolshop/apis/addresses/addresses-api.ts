import { APIResponse } from '@playwright/test';
import { BaseApi } from '../base-api';

export interface PostcodeLookupResponse {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export class AddressesApi extends BaseApi {
  async lookupPostcode(
    country: string,
    postcode: string,
    houseNumber: string
  ): Promise<APIResponse> {
    return this.request.get('/postcode-lookup', {
      params: { country, postcode, house_number: houseNumber },
    });
  }

  async resolveBillingAddress(
    country: string,
    postcode: string,
    houseNumber: string
  ): Promise<BillingAddress> {
    const address = await this.parseBody<PostcodeLookupResponse>(
      await this.lookupPostcode(country, postcode, houseNumber),
      200
    );
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postcode,
    };
  }
}
