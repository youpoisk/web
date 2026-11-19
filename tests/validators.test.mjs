import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as validators from '../src/shared/api/validators.js';

const uid = '00000000-0000-4000-8000-000000000001';
const web = { access_token: 'access', session_id: uid,
  user: { id: uid, login: 'test_user', name: 'Owner', email: 'owner@example.invalid' } };

test('every pinned operation has runtime request/response validators', () => {
  const spec = JSON.parse(readFileSync(new URL('../contracts/openapi.json', import.meta.url)));
  const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({ path, method, operation })));
  assert.equal(operations.length, 19);
  assert.equal(Object.keys(validators.contract).length, operations.length);
  for (const { path, method, operation } of operations) {
    const actual = validators.contract[operation.operationId];
    assert.equal(actual.path, path);
    assert.equal(actual.method, method.toUpperCase());
    assert.deepEqual(Object.keys(actual.responses), Object.keys(operation.responses));
    if (actual.request) assert.equal(typeof validators[actual.request], 'function');
    for (const ref of Object.values(actual.responses)) if (ref) assert.equal(typeof validators[ref], 'function');
  }
});

test('web credentials cannot contain extension refresh fields, including null', () => {
  assert.equal(validators.schema_WebCredentials(web), true);
  assert.equal(validators.schema_WebCredentials({ ...web, refresh_token: null }), false);
  assert.equal(validators.schema_WebCredentials({ ...web, refresh_token: `${uid}.${'A'.repeat(43)}` }), false);
  assert.equal(validators.schema_ExtensionCredentials(web), false);
  assert.equal(validators.schema_ExtensionCredentials({ ...web, refresh_token: `${uid}.${'A'.repeat(43)}` }), true);
  assert.equal(validators.schema_ExtensionCredentials({ ...web, refresh_token: 'malformed' }), false);
});

test('Unicode mailbox responses preserve the existing server registration policy', () => {
  for (const email of ['тест@example.com', 'alice@пример.рф']) {
    const user = { ...web.user, email };
    assert.equal(validators.schema_User(user), true);
    assert.equal(validators.schema_WebCredentials({ ...web, user }), true);
    assert.equal(validators.registerAccount_request({ login: 'test_user', name: 'Owner',
      email, password: 'valid password', client_type: 'web' }), true);
  }
  for (const email of ['missing-at', 'owner\n@example.com', '\u0000@example.com']) {
    assert.equal(validators.schema_User({ ...web.user, email }), false);
  }
});

test('observation rejects caller trust and unknown positive tags, permits explicit complete-empty', () => {
  const observation = { youtube_video_id: 'AbCdEf_12-3', expected_revision: 0 };
  assert.equal(validators.addObservedVideo_request(observation), true);
  for (const extra of [{ source: 'youtube_verified' }, { category: 'science' }, { hashtags: ['tag'] }, { duration_seconds: -1 }, { expected_revision: -1 }]) {
    assert.equal(validators.addObservedVideo_request({ ...observation, ...extra }), false);
  }
  assert.equal(validators.addObservedVideo_request({ ...observation, hashtags: [], hashtags_observation_status: 'complete' }), true);
});

test('personal state enforces initial revision and nullable change sequence', () => {
  const result = { kind: 'video_state', target_id: uid, state: { revision: 0, added: false, later: false, rating: null }, change_seq: null };
  assert.equal(validators.schema_VideoStateResult(result), true);
  const { change_seq, ...missing } = result;
  assert.equal(validators.schema_VideoStateResult(missing), false);
  assert.equal(validators.schema_VideoStateResult({ ...result, target_id: 'other' }), false);
  assert.equal(validators.schema_VideoState({ revision: 0, added: false, later: false, rating: null }), true);
  assert.equal(validators.schema_VideoState({ revision: 0, added: true, later: false, rating: null }), false);
  assert.equal(validators.schema_VideoState({ revision: 0, added: false, later: true, rating: null }), false);
  assert.equal(validators.schema_VideoState({ revision: 0, added: false, later: false, rating: 8 }), false);
  assert.equal(validators.schema_Rating({ count: 0, average: null }), true);
  assert.equal(validators.schema_Rating({ count: 0, average: 0 }), false);
  assert.equal(validators.schema_Rating({ count: 1, average: null }), false);
  assert.equal(validators.schema_Rating({ count: 200, average: 1.01 }), true);
});

test('error envelopes and device DTOs reject accidental credential additions', () => {
  const error = { code: 'conflict', message: '', field_errors: {}, request_id: 'request' };
  assert.equal(validators.schema_Error(error), true);
  assert.equal(validators.schema_Error({ ...error, refresh_token: 'secret' }), false);
  assert.equal(validators.schema_Error({ ...error, field_errors: [] }), false);
  const device = { id: uid, client_type: 'web', device_label: '', created_at: '2026-11-19T00:00:00Z',
    updated_at: '2026-11-19T00:00:00Z', expires_at: '2026-11-26T00:00:00Z', current: true };
  assert.equal(validators.schema_Device(device), true);
  assert.equal(validators.schema_Device({ ...device, refresh_token_hash: 'secret' }), false);
  assert.equal(validators.schema_Device({ ...device, expires_at: '2026-02-31T00:00:00Z' }), false);
});

test('browser bundle contains no runtime eval/Function or external imports', () => {
  const text = readFileSync(new URL('../src/shared/api/validators.js', import.meta.url), 'utf8');
  assert.equal(/\b(?:eval\s*\(|new\s+Function\s*\()/.test(text), false);
  assert.equal(/\bfrom\s+["'](?:node:|ajv)|\bimport\s*\(/.test(text), false);
});
