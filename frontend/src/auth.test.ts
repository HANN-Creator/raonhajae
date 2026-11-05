import assert from 'node:assert/strict'
import test from 'node:test'
import { hashPassword, normalizeEmail, validateSignup } from './authCore.ts'

const ok = { name: '왕휘도', email: 'me@example.com', password: 'abcd1234', confirm: 'abcd1234' }

test('signup validation', () => {
  assert.deepEqual(validateSignup(ok), {})
  assert.ok(validateSignup({ ...ok, name: ' ' }).name)
  assert.ok(validateSignup({ ...ok, email: 'nope' }).email)
  assert.ok(validateSignup({ ...ok, password: 'short1', confirm: 'short1' }).password)
  assert.ok(validateSignup({ ...ok, password: 'onlyletters', confirm: 'onlyletters' }).password)
  assert.ok(validateSignup({ ...ok, confirm: 'abcd12345' }).confirm)
  assert.equal(normalizeEmail('  Me@Example.COM '), 'me@example.com')
})

test('password hash depends on password and salt, never stores plaintext', async () => {
  const salt = new Uint8Array(16).fill(7)
  const h = await hashPassword('abcd1234', salt)
  assert.equal(h, await hashPassword('abcd1234', salt))
  assert.notEqual(h, await hashPassword('abcd1235', salt))
  assert.notEqual(h, await hashPassword('abcd1234', new Uint8Array(16).fill(8)))
  assert.ok(!h.includes('abcd1234'))
})
