export type Expense = { amount: number; payer: string; shared: boolean };
export type Transfer = { from: string; to: string; amount: number };

/**
 * Split shared expenses evenly across `people` (won, integer).
 * Remainder won goes 1원 each to the first people in order, so shares always add up to the total.
 * Transfers: greedy largest-debtor → largest-creditor, which gives at most N−1 transfers.
 */
export function settle(expenses: Expense[], people: string[]) {
  const shared = expenses.filter(e => e.shared && people.includes(e.payer));
  const total = shared.reduce((s, e) => s + e.amount, 0);
  const n = Math.max(people.length, 1);
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  const shares = Object.fromEntries(people.map((p, i) => [p, base + (i < remainder ? 1 : 0)]));
  const paid = Object.fromEntries(people.map(p => [p, shared.filter(e => e.payer === p).reduce((s, e) => s + e.amount, 0)]));
  const personal = expenses.filter(e => !e.shared).reduce((s, e) => s + e.amount, 0);

  const bal = people.map(p => ({ p, v: paid[p] - shares[p] }));
  const transfers: Transfer[] = [];
  for (;;) {
    bal.sort((a, b) => a.v - b.v);
    const debtor = bal[0], creditor = bal[bal.length - 1];
    if (!debtor || debtor.v >= 0 || creditor.v <= 0) break;
    const amount = Math.min(-debtor.v, creditor.v);
    transfers.push({ from: debtor.p, to: creditor.p, amount });
    debtor.v += amount; creditor.v -= amount;
  }
  return { total, share: base, remainder, shares, paid, personal, transfers };
}
