import assert from 'node:assert/strict'
import { settle } from './settle.ts'

const sample = [
  { amount: 11000, payer: '나', shared: true }, { amount: 23000, payer: '나', shared: false },
  { amount: 11000, payer: '민지', shared: true }, { amount: 125000, payer: '나', shared: true },
  { amount: 46000, payer: '나', shared: true }, { amount: 27000, payer: '민지', shared: true },
  { amount: 18000, payer: '나', shared: true },
]
const two = settle(sample, ['나', '민지'])
assert.equal(two.total, 238000)
assert.equal(two.share, 119000)
assert.equal(two.personal, 23000)
assert.deepEqual(two.transfers, [{ from: '민지', to: '나', amount: 81000 }])

// three people + remainder: 10001 split → 3334, 3334, 3333 (1원 remainder goes to the first two)
const three = settle([{ amount: 10001, payer: 'A', shared: true }], ['A', 'B', 'C'])
assert.deepEqual(three.shares, { A: 3334, B: 3334, C: 3333 })
assert.equal(Object.values(three.shares).reduce((a, b) => a + b, 0), 10001)
assert.deepEqual(three.transfers.map(t => `${t.from}>${t.to}:${t.amount}`).sort(), ['B>A:3334', 'C>A:3333'])

// everyone even → no transfers; personal-only → nothing to settle
assert.deepEqual(settle([{ amount: 300, payer: 'A', shared: true }, { amount: 300, payer: 'B', shared: true }], ['A', 'B']).transfers, [])
assert.equal(settle([{ amount: 500, payer: 'A', shared: false }], ['A', 'B']).total, 0)
console.log('expense settlement ok')
