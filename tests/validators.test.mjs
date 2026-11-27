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
  assert.equal(operations.length, 98);
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
      email, password: 'valid password', client_type: 'web', altcha:'proof' }), true);
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

test('video review DTOs preserve deletion revision and forbid moderation/credential injection', () => {
  assert.equal(validators.putVideoReview_request({ expected_revision: 4, text: null }), true);
  assert.equal(validators.putVideoReview_request({ expected_revision: 0, text: 'Рецензия' }), true);
  assert.equal(validators.putVideoReview_request({ expected_revision: 0 }), false);
  assert.equal(validators.putVideoReview_request({ expected_revision: 0, text: 'x', moderation_status: 'visible' }), false);
  const deleted = { kind: 'video_review', target_id: uid, review: { revision: 5, text: null }, change_seq: null };
  assert.equal(validators.getVideoReview_response_200(deleted), true);
  assert.equal(validators.putVideoReview_response_200({ ...deleted, change_seq: 7 }), true);
  assert.equal(validators.getVideoReview_response_200({ ...deleted, refresh_token: 'forbidden' }), false);
  assert.equal(validators.schema_VideoReview({ revision: 6, text: '😀'.repeat(1000) }), true);
  assert.equal(validators.schema_VideoReview({ revision: 6, text: '😀'.repeat(1001) }), false);
});

test('channel card requires verified UC identity and never exposes own state or voter IDs', () => {
 const card={id:uid,name:'Канал',youtube_channel_id:null,identity_verified:false,rating:{count:0,average:null}};
 assert.equal(validators.schema_ChannelCard(card),true);
 assert.equal(validators.schema_ChannelCard({...card,identity_verified:true}),false);
 const uc='UC'+'a'.repeat(22),url='https://www.youtube.com/channel/'+uc;
 assert.equal(validators.schema_ChannelCard({...card,youtube_channel_id:uc,identity_verified:true,url}),true);
 assert.equal(validators.schema_ChannelCard({...card,url}),false);
 assert.equal(validators.schema_ChannelCard({...card,my_state:{revision:1,rating:8}}),false);
 assert.equal(validators.schema_ChannelCard({...card,voters:[uid]}),false);
});

test('relationship keeps independent directions and hides both counts together', () => {
 const rel={user_id:uid,following:true,followed_by:false,friends:true,following_count:null,followers_count:null};
 assert.equal(validators.schema_Relationship(rel),true);
 assert.equal(validators.schema_Relationship({...rel,following_count:0,followers_count:3}),true);
 assert.equal(validators.schema_Relationship({...rel,followers_count:1}),false);
 assert.equal(validators.schema_Relationship({...rel,following_count:1}),false);
 assert.equal(validators.schema_Relationship({...rel,following_count:-1,followers_count:2}),false);
 assert.equal(validators.schema_Relationship({...rel,email:'private@example.invalid'}),false);
});

test('block list rejects partial redaction, private data, malformed and extra fields', () => {
 const entry={user:{id:uid,login:'qa_probe',name:'QA Probe'},since:'2026-11-21T00:00:00Z'};
 assert.equal(validators.listBlocks_response_200({items:[entry]}),true);
 assert.equal(validators.listBlocks_response_200({items:[{...entry,user:{id:uid,login:null,name:null}}],next_cursor:'cursor'}),true);
 assert.equal(validators.schema_Block({...entry,user:{id:uid,login:null,name:'Hidden'}}),false);
 assert.equal(validators.schema_Block({...entry,user:{...entry.user,email:'private@example.invalid'}}),false);
 assert.equal(validators.schema_Block({...entry,user:{...entry.user,login:''}}),false);
 assert.equal(validators.schema_Block({...entry,since:'not-a-date'}),false);
 assert.equal(validators.listBlocks_response_200({items:[entry],total:1}),false);
});


test('recommendation preference wire schema requires all fields and bounded unique tags',()=>{
 const value={expected_revision:1,show_site_recommendations:false,favorite_tags:['наука']};assert.equal(validators.putRecommendationPreferences_request(value),true);assert.equal(validators.putRecommendationPreferences_request({...value,favorite_tags:null}),false);assert.equal(validators.putRecommendationPreferences_request({...value,favorite_tags:['наука','наука']}),false);assert.equal(validators.putRecommendationPreferences_request({...value,favorite_tags:Array.from({length:21},(_,i)=>'tag'+i)}),false);assert.equal(validators.putRecommendationPreferences_request({...value,owner:uid}),false);
 const page={items:[],source:'site',enabled:true,preference_revision:0,updated_at:null,stale:true};assert.equal(validators.listSiteRecommendations_response_200(page),true);assert.equal(validators.listSiteRecommendations_response_200({...page,source:'friends'}),false);
});


test('avatar complaint and removal are explicit contract variants',()=>{assert.equal(validators.schema_ReportCreate({target_kind:'avatar',target_id:uid,reason:'inappropriate'}),true);assert.equal(validators.schema_ReportResolve({action:'remove_avatar'}),true);assert.equal(validators.schema_AvatarEvidence({available:false}),true);assert.equal(validators.schema_AvatarEvidence({available:'yes'}),false);});

test('registration contract requires bounded ALTCHA proof and a local v2 challenge shape',()=>{
 const request={login:'test_user',name:'Owner',email:'owner@example.invalid',password:'valid password',client_type:'web'};
 assert.equal(validators.registerAccount_request(request),false);
 for(const altcha of ['', 'x'.repeat(4097)])assert.equal(validators.registerAccount_request({...request,altcha}),false);
 assert.equal(validators.registerAccount_request({...request,altcha:'proof'}),true);
 const challenge={parameters:{algorithm:'PBKDF2/SHA-256',cost:5000,keyLength:32,keyPrefix:'00',nonce:'a'.repeat(32),salt:'b'.repeat(32),expiresAt:2000000000},signature:'c'.repeat(64)};
 assert.equal(validators.registrationChallenge_response_200(challenge),true);
 assert.equal(validators.registrationChallenge_response_200({...challenge,parameters:{...challenge.parameters,cost:1}}),false);
});
