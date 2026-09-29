import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export abstract class BaseApi {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async expectStatus(response: APIResponse, status: number): Promise<void> {
    expect(
      response.status(),
      `${response.url()} returned ${response.status()}: ${await response.text()}`
    ).toBe(status);
  }

  async parseBody<T>(response: APIResponse, status: number): Promise<T> {
    await this.expectStatus(response, status);
    return (await response.json()) as T;
  }
}
