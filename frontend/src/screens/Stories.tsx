// New Figma frames: 산책길 (74:2), 와인터널·송금마을 상세 (69:22), 청도읍 풍경 상세 (69:127).
import type { ScreenProps } from '../nav';
import { B, Bg, BottomNav, Header, I, R } from '../ui';

const W = '/assets/42ab8d20-2e0e-49ba-b4a2-a962dfaaa8dc';
const C = '/assets/a4aec938-4fa3-4a25-82cb-aa0aa330f13d';
const T = '/assets/1de36c93-54d2-4d50-8c21-a76f236cac85';

/** 74:2 · 와인터널 → 송금마을 walking leg (schematic). */
export function Walk({ go }: ScreenProps) {
  return (
    <div className="relative size-full">
      <Bg /><Header title="산책길" />
      <p className={`${B} inset-[12.67%_37.88%_84.59%_5.05%] text-[#24211d] text-[20px]`}>와인터널에서 송금마을까지</p>
      <p className={`${R} inset-[16.55%_39.65%_81.74%_5.05%] text-[#6e6c68] text-[12px]`}>버스에서 내려 마을 쪽으로 천천히 걸어봐요.</p>
      <div role="img" aria-label="와인터널에서 송금마을까지 도보 약 10~15분 개략도" className="contents">
        <I c="inset-[20.66%_5.05%_43.49%_5.05%]" s={`${W}/beae9.svg`} />
        <I c="inset-[26.12%_3.54%_71.23%_7.07%]" s={`${W}/ea775.svg`} pad="inset-[-17.23%_-1.13%_-17.24%_-1.13%]" />
        <I c="inset-[32.54%_4.55%_65.47%_6.82%]" s={`${W}/d33ec.svg`} pad="inset-[-22.99%_-1.14%_-22.98%_-1.14%]" />
        <I c="inset-[41.85%_3.28%_54.75%_6.06%]" s={`${W}/923a3.svg`} pad="inset-[-13.39%_-1.11%_-13.4%_-1.11%]" />
        <I c="inset-[20.32%_74.68%_43.95%_17.68%]" s={`${W}/13eaf.svg`} pad="inset-[-0.96%_-9.91%]" />
        <I c="inset-[20.32%_55.56%_43.84%_38.52%]" s={`${W}/03dcc.svg`} pad="inset-[-0.96%_-12.8%_-0.96%_-12.79%]" />
        <I c="inset-[20.32%_22.08%_43.84%_73.64%]" s={`${W}/8ddb5.svg`} pad="inset-[-0.96%_-17.71%_-0.96%_-17.67%]" />
        <I c="inset-[20.89%_36.54%_53.31%_54.04%]" s={`${W}/ec169.svg`} pad="inset-[-1.11%_-6.7%]" />
        <p className={`${B} inset-[22.72%_70.71%_75.8%_8.59%] text-[#7d3d00] text-[11px]`}>산책 구간 · 개략도</p>
        <p className={`${R} inset-[29.34%_39.14%_68.84%_51.77%] text-[#c7cdc4] text-[13px]`}>남성현</p>
        <p className={`${R} inset-[47.37%_29.29%_50.91%_59.34%] text-[#c7cdc4] text-[12px]`}>송금마을</p>
        <I c="inset-[34.13%_23.48%_52.28%_18.94%]" s={`${W}/b4abe.svg`} pad="inset-[-5.46%_-2.85%]" />
        <I c="inset-[34.13%_23.48%_52.28%_18.94%]" s={`${W}/c94fe.svg`} pad="inset-[-2.94%_-1.54%]" />
        {[['inset-[46.12%_77.53%_50.68%_15.4%]', 'inset-[46.8%_79.04%_51.37%_16.92%]', 'inset-[47.43%_80.43%_52%_18.31%]'],
          ['inset-[34.93%_19.95%_61.87%_72.98%]', 'inset-[35.62%_21.46%_62.56%_74.49%]', 'inset-[36.24%_22.85%_63.18%_75.88%]']].map(([ring, dot, center], i) => (
          <div key={i} className="contents">
            <I c={ring} s={`${W}/5605a.svg`} /><I c={dot} s={`${W}/53011.svg`} /><I c={center} s={`${W}/06d66.svg`} />
          </div>
        ))}
        <I c="bottom-[46.92%] left-[7.07%] right-[69.19%] top-1/2" s={`${W}/96965.svg`} />
        <p className={`${B} inset-[50.8%_75.88%_47.72%_13.76%] text-[#24211d] text-[11px] text-center`}>와인터널</p>
        <I c="inset-[38.47%_11.11%_58.45%_65.15%]" s={`${W}/96965.svg`} />
        <p className={`${B} inset-[39.27%_17.8%_59.25%_71.84%] text-[#24211d] text-[11px] text-center`}>송금마을</p>
        <I c="inset-[22.26%_8.59%_74.66%_57.58%]" s={`${W}/084f7.svg`} />
        <I c="inset-[23.4%_37.37%_75.91%_61.11%]" s={`${W}/7758e.svg`} />
        <p className={`${B} inset-[23.17%_17.68%_75.46%_64.14%] text-[#24211d] text-[10px]`}>도보 약 10~15분</p>
      </div>
      <p className={`${R} inset-[58.33%_44.19%_40.3%_5.05%] text-[#6e6c68] text-[10px]`}>실제 도보길과 진입로는 현장에서 확인해 주세요.</p>
      <button onClick={() => go('map')} className="absolute inset-[58.1%_5.05%_40.1%_auto]"><span className={`${B.replace('absolute ', '')} text-[#7d3d00] text-[11px]`}>지도에서 보기 ↗</span></button>

      <p className={`${B} inset-[62.1%_64.9%_35.5%_5.3%] text-[#24211d] text-[17px]`}>이 길에서 만나요</p>
      <button className="absolute contents cursor-pointer" onClick={() => go('courseStory')} aria-label="와인터널·송금마을 상세 열기">
        <I c="inset-[66.21%_4.8%_25.11%_5.3%]" s={`${W}/f3217.svg`} />
        <I c="inset-[68.86%_85.26%_29.02%_10.26%]" s={`${W}/886f2.svg`} pad="inset-[-6.14%_-6.43%]" />
        <p className={`${B} inset-[68.04%_52.02%_30.02%_19.19%] text-[#24211d] text-[14px]`}>와인터널 · 송금마을</p>
        <p className={`${R} inset-[71%_43.43%_27.51%_19.19%] text-[#6e6c68] text-[11px]`}>버스 하차 후 이어지는 산책 코스</p>
        <I c="inset-[69.75%_9.09%_29.11%_89.65%]" s={`${W}/2ac57.svg`} pad="inset-[-10%_-20%]" />
      </button>
      <I c="inset-[76.6%_4.8%_23.4%_5.3%]" s={`${W}/da758.svg`} pad="inset-[-0.5px_-0.14%]" />
      <button className="absolute contents cursor-pointer" onClick={() => go('townView')} aria-label="청도읍에서 더 둘러보기">
        <I c="inset-[78.85%_85.65%_18.86%_10.65%]" s={`${W}/dab1b.svg`} pad="inset-[-5.67%_-7.76%]" />
        <p className={`${B} inset-[78.31%_46.46%_19.75%_19.19%] text-[#24211d] text-[14px]`}>청도읍에서 더 둘러보기</p>
        <p className={`${R} inset-[81.28%_39.14%_17.24%_19.19%] text-[#6e6c68] text-[11px]`}>방문할 장소를 골라 천천히 돌아봐요</p>
        <I c="inset-[79.91%_9.09%_18.95%_89.65%]" s={`${W}/2ac57.svg`} pad="inset-[-10%_-20%]" />
      </button>
      <p className={`${R} inset-[87.33%_49.24%_11.3%_5.3%] text-[#6e6c68] text-[10px]`}>지도는 위치와 방향을 설명하는 시안입니다.</p>
      <BottomNav active="home" />
    </div>
  );
}

const Hero = ({ src, alt, credit, left }: { src: string; alt: string; credit: string; left: string }) => (
  <>
    <div className="absolute inset-[10.73%_0_64.84%_0] overflow-hidden"><img alt={alt} className="absolute inset-0 size-full object-cover" src={src} /></div>
    <I c="inset-[29.11%_0_64.84%_0]" s={`${C}/ba269.svg`} />
    <p className={`${R} top-[32.76%] right-[3.54%] bottom-[65.98%] text-[9px] text-right text-white`} style={{ left }}>{credit}</p>
  </>
);

/** 69:22 · 7번 버스 + 도보 반나절 코스 소개. */
export function CourseStory({ go }: ScreenProps) {
  const stops = [
    { top: 64.95, icon: '757c1.svg', ic: 'inset-[66.19%_89.17%_32.28%_8.36%]', pad: 'inset-[-5.67%_-7.76%]', name: '청도역 인근', desc: '7번 버스 승차 위치를 확인해요.' },
    { top: 71, icon: 'fda2b.svg', ic: 'inset-[72.45%_88.77%_26.25%_7.96%]', pad: 'inset-[-6.68%_-5.87%]', name: '와인터널', desc: '남성현(와인터널)에서 내려 둘러봐요.' },
    { top: 77.05, icon: 'bfb33.svg', ic: 'inset-[78.4%_88.91%_20.18%_8.1%]', pad: 'inset-[-6.14%_-6.43%]', name: '송금마을', desc: '도보로 산책한 뒤 귀환 버스를 확인해요.' },
  ];
  return (
    <div className="relative size-full">
      <Bg /><Header title="와인터널과 송금마을" />
      <Hero src={`${C}/866bb.png`} alt="와인터널 내부" credit="사진 Roadgo · Wikimedia Commons" left="58.84%" />
      <p className={`${B} inset-[37.1%_65.15%_61.53%_5.05%] text-[#7d3d00] text-[10px]`}>BUS &amp; WALK · 반나절 코스</p>
      <p className={`${B} inset-[39.73%_41.67%_56.85%_5.05%] text-[#24211d] text-[25px]`}>7번 버스로 이어지는</p>
      <p className={`${B} inset-[43.49%_58.59%_53.08%_5.05%] text-[#24211d] text-[25px]`}>청도의 반나절</p>
      <p className={`${R} inset-[48.74%_38.38%_49.54%_5.05%] text-[#6e6c68] text-[12px]`}>청도역 인근에서 출발해 와인터널을 둘러보고</p>
      <p className={`${R} inset-[50.91%_53.28%_47.37%_5.05%] text-[#6e6c68] text-[12px]`}>송금마을까지 걸어보는 코스예요.</p>
      <p className={`${R} inset-[53.08%_29.55%_45.21%_5.05%] text-[#6e6c68] text-[12px]`}>도착 시각에 맞는 왕복 버스는 내 코스에서 확인해요.</p>
      <I c="inset-[56.56%_91.26%_42.22%_5.65%]" s={`${C}/11fa2.svg`} pad="inset-[-6.68%_-5.87%]" />
      <p className={`${B} inset-[56.39%_77.78%_41.89%_11.11%] text-[#7d3d00] text-[12px]`}>7번 버스</p>
      <button className="absolute contents cursor-pointer" onClick={() => go('walk')} aria-label="도보 구간 보기">
        <I c="inset-[56.47%_64.12%_42.2%_33.06%]" s={`${C}/e8076.svg`} pad="inset-[-6.14%_-6.43%]" />
        <p className={`${B} inset-[56.39%_49.75%_41.89%_38.38%] text-[#7d3d00] text-[12px]`}>도보 이동</p>
      </button>
      <I c="inset-[60.05%_5.05%_39.95%_5.05%]" s={`${C}/da758.svg`} pad="inset-[-0.5px_-0.14%]" />

      <p className={`${B} inset-[61.42%_66.16%_36.19%_5.05%] text-[#24211d] text-[17px]`}>이렇게 둘러봐요</p>
      <I c="inset-[67.24%_90.4%_20.55%_9.6%]" s={`${C}/460fd.svg`} pad="inset-[-0.47%_-0.5px]" />
      <ol aria-label="방문 순서" className="contents">
        {stops.map(s => (
          <li key={s.name} className="contents">
            <div className="absolute left-[5.05%] right-[85.86%]" style={{ top: `${s.top}%`, bottom: `${100 - s.top - 4.11}%` }}>
              <div className="absolute inset-[-1.39%]"><img alt="" className="block max-w-none size-full" src={`${C}/556aa.svg`} /></div>
            </div>
            <I c={s.ic} s={`${C}/${s.icon}`} pad={s.pad} />
            <p className={`${B} left-[16.67%] text-[#24211d] text-[13px]`} style={{ top: `${s.top + 0.92}%` }}>{s.name}</p>
            <p className={`${R} left-[16.67%] text-[#6e6c68] text-[11px]`} style={{ top: `${s.top + 3.2}%` }}>{s.desc}</p>
          </li>
        ))}
      </ol>
      <p className={`${R} inset-[83.22%_52.02%_15.41%_5.05%] text-[#6e6c68] text-[10px]`}>공개 시간표 기준 · 실시간 운행 정보 아님</p>
      <button className="absolute contents cursor-pointer" onClick={() => go('myInput')}>
        <I c="inset-[85.62%_52.02%_9.7%_5.05%]" s={`${C}/53e6c.svg`} />
        <p className={`${B} inset-[87.21%_64.39%_11.07%_17.42%] text-[12px] text-center text-white`}>내 코스 만들기</p>
      </button>
      <button className="absolute contents cursor-pointer" onClick={() => go('bus')}>
        <I c="bottom-[9.7%] left-1/2 right-[5.05%] top-[85.62%]" s={`${C}/2f95e.svg`} pad="inset-[-1.22%_-0.28%]" />
        <p className={`${B} inset-[87.21%_18.43%_11.07%_63.38%] text-[#7d3d00] text-[12px] text-center`}>버스 동선 보기</p>
      </button>
      <BottomNav active="home" />
    </div>
  );
}

/** 69:127 · 청도읍 풍경 (photo story + next steps). */
export function TownView({ go }: ScreenProps) {
  const next = [
    { top: 80.82, title: '청도 장소 둘러보기', desc: '볼거리와 체험을 골라보세요', to: 'places' as const },
    { top: 86.42, title: '도착 시각에 맞는 코스 찾기', desc: '7번 버스 왕복 동선을 확인해요', to: 'myInput' as const },
  ];
  return (
    <div className="relative size-full">
      <Bg /><Header title="청도읍 풍경" />
      <Hero src={`${T}/37863.png`} alt="산 사이로 펼쳐진 청도읍 전경" credit="사진 한국학중앙연구원 · Wikimedia Commons" left="50.51%" />
      <p className={`${B} inset-[37.1%_67.93%_61.53%_5.05%] text-[#7d3d00] text-[10px]`}>SLOW TRAVEL · 청도읍</p>
      <p className={`${B} inset-[39.73%_71.72%_56.85%_5.05%] text-[#24211d] text-[25px]`}>청도읍을</p>
      <p className={`${B} inset-[43.49%_39.65%_53.08%_5.05%] text-[#24211d] text-[25px]`}>천천히 바라보는 시간</p>
      <p className={`${R} inset-[48.74%_48.74%_49.54%_5.05%] text-[#6e6c68] text-[12px]`}>산 사이로 펼쳐진 마을의 풍경을 보며</p>
      <p className={`${R} inset-[50.91%_60.86%_47.37%_5.05%] text-[#6e6c68] text-[12px]`}>청도 여행을 시작해 보세요.</p>
      <p className={`${R} inset-[53.08%_42.42%_45.21%_5.05%] text-[#6e6c68] text-[12px]`}>마음에 드는 장소를 골라 천천히 둘러봐요.</p>
      <I c="inset-[56.05%_5.05%_38.58%_5.05%]" s={`${T}/54d87.svg`} />
      <p className={`${R} inset-[56.96%_42.68%_41.67%_8.08%] text-[#6e6c68] text-[10px]`}>이 사진은 청도읍 전경을 담은 자료 사진입니다.</p>
      <p className={`${R} inset-[58.79%_43.43%_39.84%_8.08%] text-[#6e6c68] text-[10px]`}>촬영 지점까지의 길 안내는 제공하지 않습니다.</p>

      <p className={`${B} inset-[62.56%_61.36%_35.05%_5.05%] text-[#24211d] text-[17px]`}>청도읍에서 들를 곳</p>
      <button className="absolute contents cursor-pointer" onClick={() => go('placeDetail', 'rail-bike')} aria-label="청도 레일바이크 보기">
        <I c="inset-[66.32%_5.05%_26.03%_5.05%]" s={`${T}/acad3.svg`} />
        <p className={`${B} inset-[68.04%_69.19%_30.14%_8.84%] text-[#24211d] text-[13px]`}>청도 레일바이크</p>
        <p className={`${R} inset-[70.55%_43.69%_27.97%_8.84%] text-[#6e6c68] text-[11px]`}>청도읍 하지길 46-51 · 체험 및 혜택 확인</p>
        <I c="inset-[69.29%_9.34%_29.57%_89.39%]" s={`${T}/2ac57.svg`} pad="inset-[-10%_-20%]" />
      </button>

      <p className={`${B} inset-[75.91%_66.16%_21.69%_5.05%] text-[#24211d] text-[17px]`}>여행을 이어가요</p>
      <I c="inset-[79.79%_5.05%_20.21%_5.05%]" s={`${T}/da758.svg`} pad="inset-[-0.5px_-0.14%]" />
      {next.map(n => (
        <button key={n.to} className="absolute contents cursor-pointer" onClick={() => go(n.to)}>
          <p className={`${B} left-[6.31%] text-[#24211d] text-[13px]`} style={{ top: `${n.top}%` }}>{n.title}</p>
          <p className={`${R} left-[6.31%] text-[#6e6c68] text-[10px]`} style={{ top: `${n.top + 2.29}%` }}>{n.desc}</p>
          <div className="absolute left-[88.38%] right-[8.59%]" style={{ top: `${n.top + 1.03}%`, bottom: `${100 - n.top - 2.17}%` }}>
            <div className="absolute inset-[-10%_-8.33%]"><img alt="" className="block max-w-none size-full" src={`${T}/3914c.svg`} /></div>
          </div>
        </button>
      ))}
      <I c="inset-[85.5%_5.05%_14.5%_5.05%]" s={`${T}/da758.svg`} pad="inset-[-0.5px_-0.14%]" />
      <BottomNav active="home" />
    </div>
  );
}
