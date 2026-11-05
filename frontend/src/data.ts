import type { Expense } from './settle';

// Sample trip from the Figma design (11/3–4, 나 · 민지)
export const EXPENSES: (Expense & { name: string; cat: string; date: string })[] = [
  { name: '와인터널 입장', cat: '기타', date: '11월 4일', amount: 11000, payer: '나', shared: true },
  { name: '청도반시 구매', cat: '쇼핑', date: '11월 4일', amount: 23000, payer: '나', shared: false },
  { name: '청도 시내버스', cat: '교통', date: '11월 4일', amount: 11000, payer: '민지', shared: true },
  { name: '청도 숙소', cat: '숙박', date: '11월 3일', amount: 125000, payer: '나', shared: true },
  { name: '청도 식당', cat: '식비', date: '11월 3일', amount: 46000, payer: '나', shared: true },
  { name: '카페', cat: '식비', date: '11월 3일', amount: 27000, payer: '민지', shared: true },
  { name: '택시', cat: '교통', date: '11월 3일', amount: 18000, payer: '나', shared: true },
];
export const PEOPLE = ['나', '민지'];
export const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
