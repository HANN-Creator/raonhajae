import assert from 'node:assert/strict'
import { settle } from './settle.ts'
import { EXPENSES, PEOPLE } from './data.ts'

const result = settle(EXPENSES, PEOPLE)
assert.equal(result.total, 238000)
assert.equal(result.share, 119000)
assert.equal(result.paid['나'], 200000)
assert.equal(result.paid['민지'], 38000)
assert.equal(result.personal, 23000)
assert.deepEqual(result.transfer, { from: '민지', to: '나', amount: 81000 })
console.log('expense settlement ok')
