export type Expense = { amount: number; payer: string; shared: boolean };

/** Split shared expenses evenly between `people`; returns per-person paid, share, and who owes whom. */
export function settle(expenses: Expense[], people: string[]) {
  const shared = expenses.filter(e => e.shared);
  const total = shared.reduce((s, e) => s + e.amount, 0);
  const share = total / people.length;
  const paid = Object.fromEntries(people.map(p => [p, shared.filter(e => e.payer === p).reduce((s, e) => s + e.amount, 0)]));
  // ponytail: 2-person transfer only; >2 people needs a min-cash-flow pass
  const [a, b] = people;
  const owe = share - paid[b];
  return { total, share, paid, personal: expenses.filter(e => !e.shared).reduce((s, e) => s + e.amount, 0),
    transfer: owe >= 0 ? { from: b, to: a, amount: owe } : { from: a, to: b, amount: -owe } };
}
