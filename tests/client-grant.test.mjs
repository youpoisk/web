import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, ApiError } from '../src/shared/api/client.ts';
import * as schemas from '../src/shared/api/validators.js';

const nonce = 'A'.repeat(43);
const callback = 'http://127.0.0.1:5173/';
const issue = { redirect_uri: callback, state: nonce, code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', code_challenge_method: 'S256' };
const exchange = { authorization_code: nonce, code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', redirect_uri: callback, state: nonce };

test('grant schemas exist, bind S256 and reject injected credential channels', () => {
  assert.equal(schemas.issueBrowserCode_request(issue), true);
  assert.equal(schemas.exchangeBrowserCode_request(exchange), true);
  assert.equal(schemas.issueBrowserCode_request({ ...issue, code_challenge_method: 'plain' }), false);
  assert.equal(schemas.exchangeBrowserCode_request({ ...exchange, origin: 'https://evil.example' }), false);
  assert.equal(schemas.exchangeBrowserCode_request({ ...exchange, refresh_token: 'secret' }), false);
  assert.equal(schemas.schema_BrowserCodeIssued({ authorization_code: nonce, state: nonce, redirect_uri: callback, expires_at: '2026-11-19T00:00:00Z' }), true);
  assert.equal(schemas.schema_BrowserNonce(nonce.slice(0, 42) + 'B'), false);
});

test('business client rejects valid grant requests before fetch for every account state', async () => {
  for (const scope of [{ state: 'guest' }, { state: 'recovering', owner: 'owner', epoch: 'one' }, { state: 'authenticated', owner: 'owner', epoch: 'one', accessToken: 'aaa.bbb.ccc' }]) {
    let calls = 0;
    const api = new ApiClient({ baseUrl: 'https://api.example', session: () => scope,
      fetch: async () => { calls++; throw new Error('Grant must not reach fetch'); } });
    for (const [operation, body, origin] of [['issueBrowserCode', issue, 'http://127.0.0.1:18080'], ['exchangeBrowserCode', exchange, 'http://127.0.0.1:5173']]) {
      await assert.rejects(api.request(operation, { body, header: { Origin: origin } }), error => error instanceof ApiError && error.kind === 'invalid_input');
    }
    assert.equal(calls, 0);
  }
});
