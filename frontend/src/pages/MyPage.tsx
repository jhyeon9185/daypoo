import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import {
  ShoppingBag, Package, Star, TrendingUp, MapPin,
  Settings, ChevronRight, Lock, Check, X,
  Sparkles, Trophy, Calendar, BarChart3, LogOut, Trash2,
} from 'lucide-react';
import { api } from '../services/apiClient';

// ── 타입 ──────────────────────────────────────────────────────────────
type TabKey = 'home' | 'collection' | 'report' | 'settings';

interface UserProfile {
  username: string;
  nickname: string;
  birthDate?: string;
  createdAt?: string;
}

interface AvatarItem {
  id: string; emoji: string; name: string;
  type: '헤드' | '이펙트' | '마커';
  owned: boolean; price?: number;
}

// ── Mock 데이터 ───────────────────────────────────────────────────────
const AVATAR_ITEMS: AvatarItem[] = [
  { id:'i1', emoji:'👑', name:'황금 왕관',    type:'헤드',   owned:true },
  { id:'i2', emoji:'🎩', name:'마법사 모자',  type:'헤드',   owned:true },
  { id:'i3', emoji:'✨', name:'황금 오라',    type:'이펙트', owned:true },
  { id:'i4', emoji:'🌟', name:'별빛 오라',    type:'이펙트', owned:false, price:500 },
  { id:'i5', emoji:'🦋', name:'나비 날개',    type:'이펙트', owned:false, price:800 },
  { id:'i6', emoji:'💎', name:'다이아 마커',  type:'마커',   owned:false, price:1200 },
];

const TITLES = [
  { id:'t1', label:'전설의 쾌변가', earned:true,  selected:true  },
  { id:'t2', label:'화장실 정복자', earned:true,  selected:false },
  { id:'t3', label:'쾌변 마스터',   earned:true,  selected:false },
  { id:'t4', label:'섬유질왕',      earned:true,  selected:false },
  { id:'t5', label:'7일 연속왕',    earned:false, selected:false },
  { id:'t6', label:'100회 달성',    earned:false, selected:false },
];

const BRISTOL_DATA = [
  { day:'월', type:2, emoji:'🍫', color:'#E8A838' },
  { day:'화', type:3, emoji:'🌽', color:'#52b788' },
  { day:'수', type:4, emoji:'🍌', color:'#52b788' },
  { day:'목', type:4, emoji:'🍌', color:'#52b788' },
  { day:'금', type:5, emoji:'🫘', color:'#E8A838' },
  { day:'토', type:6, emoji:'🌊', color:'#E85D5D' },
  { day:'일', type:4, emoji:'🍌', color:'#52b788' },
];

// ── 카운트업 ──────────────────────────────────────────────────────────
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const end = target;
    const duration = 1500; // 1.5초 동안 애니메이션
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo 효과
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeProgress * end);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── 페이드업 variant ──────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const } },
});

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ── 히어로 배너 ───────────────────────────────────────────────────────
function HeroBanner({
  equippedItem, onAvatarClick, user
}: { equippedItem: AvatarItem | null; onAvatarClick: () => void; user: UserProfile | null }) {
  return (
    <div className="relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* 배경 글로우 - 투명 배경에 맞춰 더 은은하게 조정 */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            top: '-10%', left: '20%',
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(82,183,136,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-40 pb-12">
        <div className="flex items-end justify-between gap-6">
          {/* 아바타 + 정보 */}
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="flex items-end gap-6"
          >
            {/* 아바타 */}
            <motion.div variants={fadeUp(0)} className="relative flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAvatarClick}
                className="relative group"
              >
                {/* 메인 아바타 원형 */}
                <div
                  className="relative z-10 flex items-center justify-center rounded-[32px] transition-all duration-300 group-hover:shadow-2xl"
                  style={{
                    width: '92px', height: '92px',
                    background: '#ffffff',
                    border: '1.5px solid rgba(26,43,39,0.08)',
                    fontSize: '42px',
                    boxShadow: '0 12px 32px rgba(27,67,50,0.08)',
                  }}
                >
                  {equippedItem?.emoji ?? '💩'}
                </div>
                
                {/* 레벨 뱃지 - 더 자연스럽게 통합 */}
                <div
                  className="absolute -bottom-1 -right-1 z-20 flex items-center justify-center rounded-xl font-black text-[11px] shadow-lg"
                  style={{
                    width: '30px', height: '30px',
                    background: 'linear-gradient(135deg, #E8A838 0%, #d4922a 100%)', 
                    color: '#1B4332',
                    border: '3px solid #ffffff',
                  }}
                >
                  12
                </div>

                {/* 은은한 배경 오라 */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
                  style={{ background: 'radial-gradient(circle, #E8A838 0%, transparent 70%)' }} />
              </motion.button>
            </motion.div>

            {/* 텍스트 */}
            <div className="pb-1">
              <motion.div variants={fadeUp(0.05)}>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(232,168,56,0.12)', color: '#E8A838', border: '1px solid rgba(232,168,56,0.2)' }}
                >
                  <Trophy size={9} /> 전설의 쾌변가
                </span>
              </motion.div>
              <motion.h1
                variants={fadeUp(0.1)}
                className="font-black text-[#1A2B27] text-2xl leading-tight mb-1"
                style={{ letterSpacing: '-0.04em' }}
              >
                {user?.nickname || '회원님'}
              </motion.h1>
              {/* 레벨바 */}
              <motion.div variants={fadeUp(0.15)} className="flex items-center gap-2 mt-2">
                <div className="relative overflow-hidden rounded-full" style={{ width: '120px', height: '5px', background: 'rgba(26,43,39,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #52b788, #E8A838)' }}
                  />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: 'rgba(26,43,39,0.4)' }}>
                  Lv.12 · 68%
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* 우측 통계 */}
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="hidden sm:flex flex-col gap-2 pb-1"
          >
            {[
              { label: '총 인증', value: 247, suffix: '회', color: '#E8A838' },
              { label: '방문 화장실', value: 38, suffix: '곳', color: '#52b788' },
              { label: '연속 기록', value: 12, suffix: '일', color: '#52b788' },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp(i * 0.06)}
                className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'rgba(26,43,39,0.35)' }}>{s.label}</span>
                <span className="font-black text-sm" style={{ color: s.color, letterSpacing: '-0.03em' }}>
                  <CountUp target={s.value} suffix={s.suffix} />
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 하단 웨이브 */}
      <div style={{ position: 'absolute', bottom: '-2px', left: 0, width: '100%', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%' }}>
          <path d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20 L1440,40 L0,40 Z" fill="#f8faf9" />
        </svg>
      </div>
    </div>
  );
}

// ── 탭 바 ─────────────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home',       label: '홈',     icon: <Sparkles size={15} /> },
  { key: 'collection', label: '컬렉션', icon: <Trophy size={15} /> },
  { key: 'report',     label: '리포트', icon: <BarChart3 size={15} /> },
  { key: 'settings',   label: '설정',   icon: <Settings size={15} /> },
];

function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div
      className="sticky top-20 z-40 flex gap-1 px-4 py-2 mx-auto"
      style={{
        maxWidth: '720px',
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,43,39,0.05)',
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          style={{ color: active === t.key ? '#E8A838' : 'rgba(26,43,39,0.35)' }}
        >
          {active === t.key && (
            <motion.div
              layoutId="tabHighlight"
              className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.2)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">{t.icon}{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── 홈 탭 ─────────────────────────────────────────────────────────────
function HomeTab({
  equipped, setEquipped,
}: { equipped: AvatarItem | null; setEquipped: (i: AvatarItem) => void }) {
  const [shopTab, setShopTab] = useState<'inventory' | 'shop'>('inventory');
  const [preview, setPreview] = useState<AvatarItem | null>(null);
  const [saved, setSaved] = useState(false);

  const displayed = preview ?? equipped;
  const items = shopTab === 'inventory'
    ? AVATAR_ITEMS.filter((i) => i.owned)
    : AVATAR_ITEMS.filter((i) => !i.owned);

  const handleSave = () => {
    if (preview) { setEquipped(preview); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setPreview(null);
  };

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-4"
    >
      {/* 아이템 탭 */}
      <motion.div variants={fadeUp(0)} className="rounded-[24px] p-5 mb-1"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        {/* 탭 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(26,43,39,0.3)' }}>
            아바타 꾸미기
          </p>
          <div className="flex rounded-xl p-0.5" style={{ background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.06)' }}>
            {(['inventory', 'shop'] as const).map((t) => (
              <button key={t}
                onClick={() => { setShopTab(t); setPreview(null); }}
                className="relative px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                style={{ color: shopTab === t ? '#1B4332' : 'rgba(26,43,39,0.35)' }}
              >
                {shopTab === t && (
                  <motion.div layoutId="shopTab" className="absolute inset-0 rounded-xl"
                    style={{ background: '#E8A838' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {t === 'inventory' ? <><Package size={11} />인벤토리</> : <><ShoppingBag size={11} />상점</>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 아이템 그리드 */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={shopTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setPreview(item)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
                  style={{
                    background: preview?.id === item.id || (!preview && equipped?.id === item.id)
                      ? 'rgba(232,168,56,0.1)' : 'rgba(26,43,39,0.04)',
                    border: preview?.id === item.id || (!preview && equipped?.id === item.id)
                      ? '1.5px solid #E8A838' : '1.5px solid rgba(26,43,39,0.06)',
                  }}
                >
                  <motion.span
                    animate={preview?.id === item.id ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    style={{ fontSize: '26px' }}
                  >
                    {item.emoji}
                  </motion.span>
                  <span className="text-[10px] font-semibold text-center leading-tight"
                    style={{ color: 'rgba(26,43,39,0.6)' }}>{item.name}</span>
                  {item.owned
                    ? (!preview && equipped?.id === item.id &&
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(82,183,136,0.15)', color: '#52b788' }}>착용 중</span>)
                    : <span className="text-[10px] font-bold" style={{ color: '#E8A838' }}>
                        {item.price?.toLocaleString()}P
                      </span>
                  }
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* 저장/구매 버튼 */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="flex gap-2.5 mt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPreview(null)}
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'rgba(26,43,39,0.05)', border: '1px solid rgba(26,43,39,0.08)' }}
                >
                  <X size={16} style={{ color: 'rgba(26,43,39,0.4)' }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm"
                  style={{
                    background: preview.owned
                      ? 'linear-gradient(135deg, #E8A838 0%, #d4922a 100%)'
                      : 'linear-gradient(135deg, #E85D5D 0%, #c04040 100%)',
                    color: preview.owned ? '#1B4332' : '#fff',
                    boxShadow: `0 4px 16px ${preview.owned ? 'rgba(232,168,56,0.3)' : 'rgba(232,93,93,0.3)'}`,
                  }}
                >
                  {saved
                    ? <><Check size={14} /> 저장됨!</>
                    : preview.owned
                    ? <><Check size={14} /> 착용 저장하기</>
                    : <><ShoppingBag size={14} /> {preview.price?.toLocaleString()}P 구매하기</>
                  }
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 데일리 분석 */}
      <motion.div variants={fadeUp(0.1)} className="rounded-[24px] p-5"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(26,43,39,0.3)' }}>
          데일리 자동 분석
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: '오늘 점수', value: 89, suffix: '점', color: '#E8A838' },
            { label: '브리스톨', value: 4, suffix: '형', color: '#52b788' },
            { label: '연속 기록', value: 12, suffix: '일', color: '#52b788' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center py-3 rounded-2xl"
              style={{ background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.06)' }}
            >
              <span className="font-black text-2xl" style={{ color: s.color, letterSpacing: '-0.04em' }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </span>
              <span className="text-[10px] mt-1" style={{ color: 'rgba(26,43,39,0.35)' }}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* AI 한줄 */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl"
          style={{ background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.14)' }}>
          <Sparkles size={16} style={{ color: '#E8A838', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="text-[10px] font-bold mb-0.5" style={{ color: '#E8A838' }}>AI 한줄 조언</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,43,39,0.65)' }}>
              "매운 음식을 줄이면 쾌변 점수 더 올라가요 🌶️ 수분 섭취도 늘려보세요!"
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 컬렉션 탭 ─────────────────────────────────────────────────────────
function CollectionTab() {
  const [titles, setTitles] = useState(TITLES);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const selectTitle = (id: string) => {
    setTitles((prev) => prev.map((t) => ({ ...t, selected: t.id === id && t.earned })));
  };

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-4">

      {/* 흔적 통계 */}
      <motion.div variants={fadeUp(0)} className="grid grid-cols-2 gap-2.5">
        {[
          { label: '총 인증 횟수', value: 247, suffix: '회', icon: <Check size={14} />, color: '#E8A838' },
          { label: '방문한 화장실', value: 38, suffix: '곳', icon: <MapPin size={14} />, color: '#52b788' },
          { label: '획득 칭호', value: 4, suffix: '개', icon: <Trophy size={14} />, color: '#cd7c4a' },
          { label: '연속 기록',  value: 12, suffix: '일', icon: <Calendar size={14} />, color: '#52b788' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: '#ffffff', border: '1px solid rgba(26,43,39,0.08)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="font-black text-xl leading-none" style={{ color: s.color, letterSpacing: '-0.04em' }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(26,43,39,0.35)' }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 칭호 도감 */}
      <motion.div variants={fadeUp(0.12)} className="rounded-[24px] p-5"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(26,43,39,0.3)' }}>
            칭호 도감
          </p>
          <span className="text-[10px]" style={{ color: 'rgba(26,43,39,0.25)' }}>
            선택 시 닉네임 앞에 표시
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {titles.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={t.earned ? { scale: 1.06, y: -2 } : {}}
              whileTap={t.earned ? { scale: 0.94 } : {}}
              onClick={() => t.earned && selectTitle(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: t.selected
                  ? 'rgba(232,168,56,0.12)'
                  : t.earned
                  ? 'rgba(82,183,136,0.08)'
                  : 'rgba(26,43,39,0.03)',
                border: t.selected
                  ? '1.5px solid #E8A838'
                  : t.earned
                  ? '1.5px solid rgba(82,183,136,0.2)'
                  : '1.5px solid rgba(26,43,39,0.06)',
                color: t.selected ? '#E8A838' : t.earned ? '#52b788' : 'rgba(26,43,39,0.2)',
                cursor: t.earned ? 'pointer' : 'default',
              }}
            >
              {!t.earned && <Lock size={10} />}
              {t.selected && <Star size={10} fill="#E8A838" />}
              {t.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 리포트 탭 ─────────────────────────────────────────────────────────
function ReportTab() {
  const [reportOpen, setReportOpen] = useState(false);
  const completedDays = 5;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-4">

      {/* 7일 진행 */}
      <motion.div variants={fadeUp(0)} className="rounded-[24px] p-5 mb-1"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(26,43,39,0.3)' }}>
              7일 정밀 분석
            </p>
            <p className="text-sm font-black text-[#1A2B27]" style={{ letterSpacing: '-0.02em' }}>
              닥터 푸의 주간 진단서
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(82,183,136,0.1)', color: '#52b788', border: '1px solid rgba(82,183,136,0.2)' }}>
            {completedDays}/7일
          </span>
        </div>

        {/* 요일 진행 바 */}
        <div className="flex gap-1.5 mb-4">
          {['월','화','수','목','금','토','일'].map((d, i) => (
            <motion.div
              key={d}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
              style={{ transformOrigin: 'bottom', flex: 1 }}
            >
              <div
                className="flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold"
                style={{
                  background: i < completedDays ? 'rgba(82,183,136,0.12)' : 'rgba(26,43,39,0.04)',
                  border: `1px solid ${i < completedDays ? 'rgba(82,183,136,0.25)' : 'rgba(26,43,39,0.06)'}`,
                  color: i < completedDays ? '#52b788' : 'rgba(26,43,39,0.2)',
                }}
              >
                {i < completedDays ? '✓' : '·'}
                <span>{d}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setReportOpen(true)}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
          style={{
            background: 'transparent',
            color: '#1B4332',
            border: '1.5px solid rgba(27,67,50,0.15)',
          }}
        >
          <BarChart3 size={16} />
          📋 주간 진단서 열기
        </motion.button>
      </motion.div>

      {/* 브리스톨 히스토리 */}
      <motion.div variants={fadeUp(0.1)} className="rounded-[24px] p-5"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(26,43,39,0.3)' }}>
          이번 주 브리스톨 기록
        </p>
        <div className="flex gap-2">
          {BRISTOL_DATA.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{ background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.06)' }}
            >
              <span style={{ fontSize: '18px' }}>{d.emoji}</span>
              <span className="text-[10px]" style={{ color: 'rgba(26,43,39,0.3)' }}>{d.day}</span>
              <span className="text-[11px] font-black" style={{ color: d.color }}>{d.type}형</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 주간 진단서 모달 */}
      <AnimatePresence>
        {reportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReportOpen(false)}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
              style={{
                width: 'min(520px, calc(100vw - 32px))',
                maxHeight: 'calc(100dvh - 48px)',
                background: '#ffffff',
                borderRadius: '28px',
                border: '1px solid rgba(26,43,39,0.08)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              }}
            >
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1"
                      style={{ color: 'rgba(26,43,39,0.3)' }}>주간 진단서</span>
                    <h2 className="font-black text-[#1A2B27] text-lg" style={{ letterSpacing: '-0.03em' }}>
                      닥터 푸의 3/12 ~ 3/18 리포트
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setReportOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(26,43,39,0.06)', color: 'rgba(26,43,39,0.4)' }}
                  >
                    <X size={15} />
                  </motion.button>
                </div>

                {/* 점수 원형 */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(26,43,39,0.06)" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke="#E8A838" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - 0.85) }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-black text-3xl" style={{ color: '#E8A838', letterSpacing: '-0.04em' }}>85</span>
                      <span className="text-[10px]" style={{ color: 'rgba(26,43,39,0.4)' }}>쾌변 점수</span>
                    </div>
                  </div>
                </div>

                {/* 7일 브리스톨 */}
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(26,43,39,0.3)' }}>7일 브리스톨 척도</p>
                <div className="flex gap-2 mb-5">
                  {BRISTOL_DATA.map((d, i) => (
                    <motion.div key={d.day}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl"
                      style={{ background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.06)' }}>
                      <span style={{ fontSize: '16px' }}>{d.emoji}</span>
                      <span className="text-[9px]" style={{ color: 'rgba(26,43,39,0.3)' }}>{d.day}</span>
                      <span className="text-[10px] font-black" style={{ color: d.color }}>{d.type}형</span>
                    </motion.div>
                  ))}
                </div>

                {/* AI 인사이트 */}
                <div className="rounded-2xl p-4 mb-4"
                  style={{ background: 'rgba(27,67,50,0.3)', border: '1px solid rgba(82,183,136,0.18)' }}>
                  <p className="text-xs font-bold mb-3" style={{ color: '#52b788' }}>🤖 AI 인사이트</p>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(26,43,39,0.7)' }}>
                    🌶️ 매운 음식을 드신 다음 날은 항상 묽은 변이 관찰돼요. 장이 조금 예민한 편이시군요!
                  </p>
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(232,168,56,0.07)', border: '1px solid rgba(232,168,56,0.15)' }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: '#E8A838' }}>💡 솔루션</p>
                    <p className="text-xs" style={{ color: 'rgba(26,43,39,0.6)' }}>
                      내일부터는 따뜻한 차를 한 잔 마셔보는 게 어떨까요?
                    </p>
                  </div>
                </div>

                {/* 푸터 */}
                <div className="flex gap-2.5">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm"
                    style={{ background: 'rgba(26,43,39,0.05)', border: '1px solid rgba(26,43,39,0.08)', color: 'rgba(26,43,39,0.55)' }}>
                    📸 이미지 저장
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setReportOpen(false)}
                    className="flex-1 py-3 rounded-2xl font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #E8A838 0%, #d4922a 100%)', color: '#1B4332', boxShadow: '0 4px 16px rgba(232,168,56,0.28)' }}>
                    확인 완료 ✓
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── 설정 탭 ───────────────────────────────────────────────────────────
function SettingsTab({ user }: { user: UserProfile | null }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const rows = [
    { label: '이메일', value: user?.username || '데이터 없음', action: '변경' },
    { label: '닉네임', value: user?.nickname || '데이터 없음', action: '변경' },
    { label: '생년월일', value: user?.birthDate || '미등록', action: null },
    { label: '가입일', value: (user?.createdAt && typeof user.createdAt === 'string') ? user.createdAt.split('T')[0] : '-', action: null },
  ];

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-4">

      <motion.div variants={fadeUp(0)} className="rounded-[24px] p-5 mb-1"
        style={{ background: 'transparent', border: '1px solid rgba(26,43,39,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-widest px-5 pt-5 pb-3"
          style={{ color: 'rgba(26,43,39,0.3)' }}>회원 정보</p>
        <div className="px-5 pb-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between py-3.5"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(26,43,39,0.05)' : 'none' }}
            >
              <span className="text-sm" style={{ color: 'rgba(26,43,39,0.4)' }}>{r.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#1A2B27]">{r.value}</span>
                {r.action && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(82,183,136,0.1)', color: '#52b788', border: '1px solid rgba(82,183,136,0.2)' }}>
                    {r.action}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 알림 설정 등 추가 섹션 */}
      <motion.div variants={fadeUp(0.1)} className="rounded-[24px] overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid rgba(26,43,39,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-widest px-5 pt-5 pb-3"
          style={{ color: 'rgba(26,43,39,0.3)' }}>더 보기</p>
        {[
          { icon: <Settings size={14} />, label: '알림 설정', color: '#52b788' },
          { icon: <TrendingUp size={14} />, label: '데이터 내보내기', color: '#52b788' },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            whileHover={{ x: 4 }}
            className="w-full flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(26,43,39,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="text-sm font-medium text-[#1A2B27]">{item.label}</span>
            </div>
            <ChevronRight size={14} style={{ color: 'rgba(26,43,39,0.2)' }} />
          </motion.button>
        ))}
      </motion.div>

      {/* 로그아웃 / 탈퇴 */}
      <motion.div variants={fadeUp(0.18)} className="flex gap-2.5">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(232,93,93,0.08)', border: '1px solid rgba(232,93,93,0.2)', color: '#E85D5D' }}
        >
          <LogOut size={15} /> 로그아웃
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
          style={{ background: 'rgba(26,43,39,0.03)', border: '1px solid rgba(26,43,39,0.08)', color: 'rgba(26,43,39,0.3)' }}
        >
          <Trash2 size={15} /> 회원탈퇴
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── MyPage (메인) ─────────────────────────────────────────────────────
export function MyPage({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user info', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined') {
      navigate('/');
      openAuth('login');
      return;
    }
    
    fetchUser();
  }, [navigate, openAuth, fetchUser]);

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [prevTab, setPrevTab] = useState<TabKey>('home');
  const [equipped, setEquipped] = useState<AvatarItem>(AVATAR_ITEMS[0]);

  const tabOrder: TabKey[] = ['home', 'collection', 'report', 'settings'];
  const tabDir = tabOrder.indexOf(activeTab) >= tabOrder.indexOf(prevTab) ? 1 : -1;

  const handleTabChange = (k: TabKey) => {
    setPrevTab(activeTab);
    setActiveTab(k);
  };

  const slideVar = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8faf9' }}>
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-3xl">💩</motion.span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8faf9' }}>
      <Navbar openAuth={openAuth} />

      {/* 히어로 배너 */}
      <HeroBanner
        equippedItem={equipped}
        onAvatarClick={() => handleTabChange('home')}
        user={user}
      />

      {/* 탭 바 */}
      <TabBar active={activeTab} onChange={handleTabChange} />

      {/* 탭 컨텐츠 */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-16 overflow-hidden">
        <AnimatePresence mode="wait" custom={tabDir}>
          <motion.div
            key={activeTab}
            custom={tabDir}
            variants={slideVar}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home'       && <HomeTab equipped={equipped} setEquipped={setEquipped} />}
            {activeTab === 'collection' && <CollectionTab />}
            {activeTab === 'report'     && <ReportTab />}
            {activeTab === 'settings'   && <SettingsTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
