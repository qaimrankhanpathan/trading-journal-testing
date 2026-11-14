import { expect, test, type APIRequestContext, type APIResponse } from "@playwright/test";

type Body = Record<string, unknown>;

/**
 * API CLIENT BASE: the "page object" of the API layer.
 *
 * Every service class (AccountsApi, TradesApi...) extends this. It does the things every API call needs, once:
 *  - sends the request with Playwright's `request` fixture (same baseURL as the browser);
 *  - checks the status code and puts the response body in the failure message, so a 422 tells you WHY;
 *  - wraps each call in a report step ("POST /api/accounts -> 201") so the HTML report shows the API traffic.
 *
 * Methods ending in "Raw" return the raw response for NEGATIVE tests that expect an error status.
 */
export class ApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async send(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: Body): Promise<APIResponse> {
    return test.step(`${method} ${url}`, () => this.request.fetch(url, { method, data }), { box: true });
  }

  /** Sends the request, checks the status is the expected one, and returns the parsed JSON body. */
  protected async expectJson<T>(method: "GET" | "POST" | "PUT" | "PATCH", url: string, status: number, data?: Body): Promise<T> {
    const res = await this.send(method, url, data);
    expect(res.status(), `${method} ${url} answered ${res.status()}: ${await res.text()}`).toBe(status);
    return (await res.json()) as T;
  }
}
