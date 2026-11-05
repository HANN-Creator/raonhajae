// Figma absolute-layer helpers shared by every 396×876 screen.
const assetPathPrefix = "/assets/3420a488-413a-4bef-a126-be092c981cb8";
const a = (f: string) => `${assetPathPrefix}/${f}`;

export const I = ({ c, s, pad }: { c: string; s: string; pad?: string }) =>
  pad ? <div className={`absolute ${c}`}><div className={`absolute ${pad}`}><img alt="" className="block max-w-none size-full" src={s} /></div></div>
      : <div className={`absolute ${c}`}><img alt="" className="absolute block inset-0 max-w-none size-full" src={s} /></div>;
export const B = "absolute font-['Noto_Sans_KR:Bold'] font-bold leading-[normal] whitespace-nowrap";
export const M = "absolute font-['Noto_Sans_KR:Medium'] font-medium leading-[normal] whitespace-nowrap";
export const R = "absolute font-['Noto_Sans_KR:Regular'] font-normal leading-[normal] whitespace-nowrap";

export const Bg = () => <img alt="" className="absolute block inset-0 max-w-none size-full" src={a('faa59.svg')} />;

export const StatusBar = () => (
  <>
    <p className={`${B} inset-[1.6%_83.59%_96.58%_7.58%] text-[#0d0d0d] text-[13px]`}>10:43</p>
    <I c="inset-[0.8%_35.86%_96.12%_35.86%]" s={a('6cb5d.svg')} />
    <I c="inset-[1.88%_8.26%_96.92%_87.88%]" s={a('640c9.svg')} />
    <I c="inset-[1.86%_3.59%_96.93%_92.68%]" s={a('24393.svg')} />
    <I c="inset-[1.94%_0.06%_97.03%_96.46%]" s={a('99143.svg')} pad="inset-[-5.56%_0_-5.56%_-3.64%]" />
  </>
);

/** Back chevron + page title + divider at y≈10.6% (variant used by most sub-pages). */
export const Header = ({ title, right, sub }: { title: string; right?: React.ReactNode; sub?: React.ReactNode }) => (
  <>
    <button className="absolute block cursor-pointer inset-[6.39%_92.42%_91.78%_5.56%]" data-name="Back to home">
      <div className="absolute inset-[-7.5%_-15%]"><img alt="뒤로" className="block max-w-none size-full" src={a('f3d6d.svg')} /></div>
    </button>
    <p className={`${B} inset-[5.71%_auto_91.32%_14.14%] text-[#24211d] text-[22px]`}>{title}</p>
    {right}
    {sub}
    <I c={sub ? 'inset-[14.38%_0_85.62%_0]' : 'inset-[10.62%_0_89.38%_0]'} s={a('6117b.svg')} pad="inset-[-0.5px_-0.13%]" />
  </>
);

export type Tab = 'home' | 'myRoute' | 'expenses' | 'benefits' | 'places';
const TABS: { id: Tab; label: string; icon: string; on: string; ic: string; pad: string; tc: string; nav: string }[] = [
  { id: 'home', label: '홈', icon: 'c692b.svg', on: '6e4a4.svg', ic: 'inset-[93.04%_85.1%_4.91%_10.35%]', pad: 'inset-[-5.56%]', tc: 'inset-[96%_85.98%_2.51%_11.24%]', nav: '홈 열기' },
  { id: 'myRoute', label: '내 코스', icon: '9fce1.svg', on: 'dd5cd.svg', ic: 'inset-[93.32%_66.41%_4.91%_29.04%]', pad: 'inset-[-6.45%_-5.56%]', tc: 'inset-[96%_64.52%_2.51%_27.15%]', nav: '내 코스 열기' },
  { id: 'expenses', label: '경비', icon: 'a30b4.svg', on: 'f1eab.svg', ic: 'inset-[93.04%_48.23%_4.91%_48.23%]', pad: 'inset-[-5.56%_-7.14%]', tc: 'inset-[96%_47.35%_2.51%_47.35%]', nav: '경비 열기' },
  { id: 'benefits', label: '혜택', icon: '7e949.svg', on: '7e949.svg', ic: 'inset-[93.26%_29.04%_4.91%_66.67%]', pad: 'inset-[-6.25%_-5.88%]', tc: 'inset-[96%_28.66%_2.51%_66.04%]', nav: '혜택 열기' },
  { id: 'places', label: '장소', icon: '7f589.svg', on: '7f589.svg', ic: 'inset-[92.87%_10.73%_4.91%_85.48%]', pad: 'inset-[-5.13%_-6.67%]', tc: 'inset-[96%_9.97%_2.51%_84.72%]', nav: '장소 열기' },
];

/** activeIcon: screen-specific asset URL for the highlighted tab icon (when it differs from the shared one). */
export const BottomNav = ({ active, activeIcon }: { active: Tab; activeIcon?: string }) => (
  <>
    <I c="inset-[91.67%_0_0_0]" s={a('312fb.svg')} />
    <I c="inset-[91.67%_0_8.33%_0]" s={a('6117b.svg')} pad="inset-[-0.5px_-0.13%]" />
    {TABS.map((t, i) => {
      const on = t.id === active;
      return (
        <div key={t.id} className="contents">
          <I c={t.ic} s={on ? activeIcon ?? a(t.on) : a(t.icon)} pad={t.pad} />
          <p className={`${B} ${t.tc} ${on ? 'text-[#7d3d00]' : 'text-[#6e6c68]'} text-[11px] text-center`}>{t.label}</p>
          {/* full-column hit area */}
          <a aria-label={t.label} className="absolute top-[91.67%] bottom-[2%] cursor-pointer" style={{ left: `${i * 18.5 + 4}%`, width: '18.5%' }} data-name={on ? undefined : t.nav} />
        </div>
      );
    })}
    <I c="inset-[98.74%_35.1%_0.8%_35.1%]" s={a('10db8.svg')} />
  </>
);
