import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useAIChatStore } from './useAIChatStore';
import AIChatWindow from './AIChatWindow';

export default function AIChatBubble() {
  const { isOpen, toggleOpen, unreadCount } = useAIChatStore();
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const hasDragged = useRef(false);
  const dragStart = useRef<{ sx: number; sy: number; il: number; it: number } | null>(null);

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragStart.current = { sx: e.clientX, sy: e.clientY, il: rect.left, it: rect.top };
    hasDragged.current = false;
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragStart.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
    if (hasDragged.current) {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 56, d.il + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 56, d.it + dy)),
      });
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
    setTimeout(() => { hasDragged.current = false; }, 50);
  }, []);

  const onClick = useCallback(() => {
    if (!hasDragged.current) toggleOpen();
  }, [toggleOpen]);

  const style: React.CSSProperties =
    pos.x === 0 && pos.y === 0
      ? { right: 24, bottom: 100 }
      : { left: pos.x, top: pos.y };

  return (
    <>
      <AnimatePresence>
        {isOpen && <AIChatWindow key="chat-window" />}
      </AnimatePresence>

      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        className="fixed flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          zIndex: 9999,
          ...style,
          background: 'linear-gradient(135deg, #00AEEF 0%, #3B82F6 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0)',
          transition: 'opacity 0.3s, transform 0.3s',
          cursor: 'pointer',
        }}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <MessageCircle size={24} color="white" />
        )}

        {unreadCount > 0 && !isOpen && (
          <span
            className="absolute flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
            style={{ width: 18, height: 18, fontSize: 10, top: -2, right: -2 }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
