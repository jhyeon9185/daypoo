import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridFlipRevealProps {
  children: React.ReactNode;
  rows?: number;
  cols?: number;
}

export const GridFlipReveal: React.FC<GridFlipRevealProps> = ({ 
  children, 
  rows = 8, 
  cols = 10 
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    // 세션당 한 번만 애니메이션 보여주기
    const hasSeenReveal = sessionStorage.getItem('daypoo_grid_reveal_seen');
    
    if (hasSeenReveal) {
      setIsStarted(true);
      setIsFinished(true);
      setShowReveal(false);
    } else {
      setShowReveal(true);
      const startTimer = setTimeout(() => setIsStarted(true), 150);
      const finishTimer = setTimeout(() => {
        setIsFinished(true);
        sessionStorage.setItem('daypoo_grid_reveal_seen', 'true');
      }, 1900); // 전체 대기시간을 약 1초 단축 (2.8s -> 1.9s)

      return () => {
        clearTimeout(startTimer);
        clearTimeout(finishTimer);
      };
    }
  }, []);

  // 그리드 인덱스 생성
  const tiles = useMemo(() => {
    const t = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        t.push({ r, c, id: `${r}-${c}` });
      }
    }
    return t;
  }, [rows, cols]);

  if (!showReveal && isFinished) {
    return <div className="relative w-full min-h-screen bg-[#F8FAF9]">{children}</div>;
  }

  return (
    <div className="relative w-full min-h-screen bg-[#F8FAF9]">
      {/* 실제 콘텐츠 레이어 - 바닥에 깔려 있음 */}
      <div className={`relative z-0 ${!isFinished ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>

      {/* 애니메이션 오버레이 레이어 */}
      {!isFinished && (
        <div className="fixed inset-0 z-[999] pointer-events-none grid"
             style={{ 
               gridTemplateRows: `repeat(${rows}, 1fr)`,
               gridTemplateColumns: `repeat(${cols}, 1fr)`,
               perspective: '1500px'
             }}>
          {tiles.map((tile) => (
            <div key={tile.id} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              <motion.div
                initial={{ rotateY: 0 }}
                animate={isStarted ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                transition={{
                  duration: 0.7, // 회전 가속 (1.0s -> 0.7s)
                  ease: [0.33, 1, 0.68, 1], // 끝부분에서 탄성 있게 멈춤
                  delay: (tile.r + tile.c) * 0.04 // 물결 전파 가속 (0.05s -> 0.04s)
                }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 앞면: 부드러운 하프톤 그린 */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#2D6A4F]/85 border-[0.2px] border-white/5 shadow-inner"
                  style={{ backfaceVisibility: 'hidden' }}
                />

                {/* 뒷면: 뒤집히면서 사라짐 */}
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)',
                    background: 'transparent'
                  }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* 중앙 브랜드 텍스트 (피어오르는 시차 애니메이션 - 가속 튜닝) */}
      <AnimatePresence>
        {isStarted && !isFinished && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none"
          >
            <div className="flex gap-2 overflow-hidden">
              {"Day.poo".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 35, filter: 'blur(15px)', rotateX: 30 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    y: [35, 0, -2, -20],
                    filter: ['blur(15px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
                    rotateX: [30, 0, 0, -15]
                  }}
                  transition={{ 
                    duration: 1.5, // 텍스트 유지 시간 가속 (2.2s -> 1.5s)
                    delay: index * 0.06, 
                    times: [0, 0.25, 0.75, 1],
                    ease: "easeOut"
                  }}
                  className="text-8xl font-bold text-amber-400 drop-shadow-[0_8px_30px_rgba(232,168,56,0.25)] tracking-tighter"
                  style={{ fontFamily: 'SchoolSafetyNotification, cursive' }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
