'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayedPathname, setDisplayedPathname] = useState(pathname);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (pathname === displayedPathname) {
      setDisplayedChildren(children);
      return;
    }

    setTransitioning(true);

    const timeout = window.setTimeout(() => {
      setDisplayedPathname(pathname);
      setDisplayedChildren(children);
      setTransitioning(false);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [children, displayedPathname, pathname]);

  return (
    <div
      key={displayedPathname}
      className={`transition-all duration-200 ease-in-out ${
        transitioning
          ? 'translate-y-2 opacity-0'
          : 'animate-page-enter translate-y-0 opacity-100'
      }`}
    >
      {displayedChildren}
    </div>
  );
}
