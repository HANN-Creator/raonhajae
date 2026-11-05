export const CATEGORIES = ['항공', '숙박', '식비', '쇼핑', '교통', '체험', '기타'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Everyone starts with just themselves; companions are added on the settlement screen. */
export const DEFAULT_PEOPLE = ['나'];
export const won = (n: number) => `₩${Math.round(n).toLocaleString('ko-KR')}`;
export const dayLabel = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return m && d ? `${m}월 ${d}일` : iso; };
