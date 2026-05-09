'use client';

import { useState, useRef, useCallback, useEffect, Children, ReactNode } from 'react';

interface CardDeckProps {
  children: ReactNode;
}

export default function CardDeck({ children }: CardDeckProps) {
  const cards = Children.toArray(children);
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(index, cards.length - 1)));
      setDragOffset(0);
    },
    [cards.length]
  );

  // Touch handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Prevent going past the first/last card
    if ((current === 0 && delta > 0) || (current === cards.length - 1 && delta < 0)) {
      setDragOffset(delta * 0.2); // rubber-band effect
    } else {
      setDragOffset(delta);
    }
    // Prevent vertical scroll while dragging horizontally
    if (Math.abs(delta) > 10) {
      e.preventDefault();
    }
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    if (dragOffset < -50) {
      goTo(current + 1);
    } else if (dragOffset > 50) {
      goTo(current - 1);
    } else {
      setDragOffset(0);
    }
    touchStartX.current = null;
    setIsDragging(false);
  }

  // Mouse drag handlers
  function handleMouseDown(e: React.MouseEvent) {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    if ((current === 0 && delta > 0) || (current === cards.length - 1 && delta < 0)) {
      setDragOffset(delta * 0.2);
    } else {
      setDragOffset(delta);
    }
  }

  function handleMouseUp() {
    if (mouseStartX.current === null) return;
    if (dragOffset < -50) {
      goTo(current + 1);
    } else if (dragOffset > 50) {
      goTo(current - 1);
    } else {
      setDragOffset(0);
    }
    mouseStartX.current = null;
    setIsDragging(false);
  }

  function handleMouseLeave() {
    if (mouseStartX.current !== null) {
      handleMouseUp();
    }
  }

  // Edge tap navigation
  function handleTap(e: React.MouseEvent) {
    // Only handle taps (no drag occurred)
    if (Math.abs(dragOffset) > 5) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left;
    const width = rect.width;
    if (relX < width * 0.2 && current > 0) {
      goTo(current - 1);
    } else if (relX > width * 0.8 && current < cards.length - 1) {
      goTo(current + 1);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goTo(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(current - 1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, goTo]);

  const translateX = `calc(${-current * 100}% + ${dragOffset}px)`;

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Card track */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleTap}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(${translateX})`,
            transition: isDragging ? 'none' : 'transform 300ms ease',
            willChange: 'transform',
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full h-full overflow-y-auto px-4 pb-20 pt-2"
            >
              {card}
            </div>
          ))}
        </div>
      </div>

      {/* Left chevron hint */}
      {current > 0 && (
        <button
          aria-label="Previous card"
          onClick={() => goTo(current - 1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 text-white/50 text-2xl pointer-events-auto select-none"
          style={{ background: 'none', border: 'none', padding: '0.5rem' }}
        >
          ‹
        </button>
      )}

      {/* Right chevron hint */}
      {current < cards.length - 1 && (
        <button
          aria-label="Next card"
          onClick={() => goTo(current + 1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 text-white/50 text-2xl pointer-events-auto select-none"
          style={{ background: 'none', border: 'none', padding: '0.5rem' }}
        >
          ›
        </button>
      )}

    </div>
  );
}
