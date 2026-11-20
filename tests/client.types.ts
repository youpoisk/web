import type { ApiClient } from '../src/shared/api/client';

// Compile-only boundary checks: this file is never imported by the application.
export async function businessBoundary(api: ApiClient) {
  const user = await api.request('getMe', {});
  const name: string = user.name;
  // @ts-expect-error The generated profile DTO does not contain refresh credentials.
  const secret = user.refresh_token;
  // @ts-expect-error Browser grants belong to the auth coordinator, not the business client.
  api.request('issueBrowserCode', { body: { redirect_uri: 'https://web.example/', state: 'A'.repeat(43), code_challenge: 'A'.repeat(43), code_challenge_method: 'S256' }, header: { Origin: 'https://api.example' } });
  // @ts-expect-error Exchanging a code requires pending flow/account checks outside this client.
  api.request('exchangeBrowserCode', { body: { authorization_code: 'A'.repeat(43), code_verifier: 'A'.repeat(43), redirect_uri: 'https://web.example/', state: 'A'.repeat(43) }, header: { Origin: 'https://web.example' } });
  // @ts-expect-error Native HttpOnly-cookie hint belongs to the API-origin coordinator.
  api.request('identifyBrowserSession', {body:{},header:{Origin:'https://api.example'}});
  return name;
}
