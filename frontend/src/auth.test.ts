import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeEmail, readAuthResponse, validateSignup } from './authCore.ts'

const ok = { name: '왕휘도', email: 'me@example.com', password: 'abcd1234', confirm: 'abcd1234' }

test('signup validation matches the backend rules', () => {
  assert.deepEqual(validateSignup(ok), {})
  assert.ok(validateSignup({ ...ok, name: ' ' }).name)
  assert.ok(validateSignup({ ...ok, email: 'nope' }).email)
  assert.ok(validateSignup({ ...ok, password: 'short1', confirm: 'short1' }).password)
  assert.ok(validateSignup({ ...ok, password: 'onlyletters', confirm: 'onlyletters' }).password)
  assert.ok(validateSignup({ ...ok, confirm: 'abcd12345' }).confirm)
  assert.equal(normalizeEmail('  Me@Example.COM '), 'me@example.com')
})

test('reads backend auth responses', () => {
  assert.deepEqual(readAuthResponse(201, { user: { id: 1, email: 'a@b.cd', name: 'A' } }), { user: { id: 1, email: 'a@b.cd', name: 'A' } })
  assert.deepEqual(readAuthResponse(409, { error: '이미 가입한 이메일이에요.', field: 'email' }), { errors: { email: '이미 가입한 이메일이에요.' } })
  assert.deepEqual(readAuthResponse(401, { error: '맞지 않아요' }), { errors: { form: '맞지 않아요' } })
  assert.deepEqual(readAuthResponse(502, null), { errors: { form: '요청에 실패했어요 (502).' } })
})
