'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);
  const sessionId = useRef<string>('');

  useEffect(() => {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let session = sessionStorage.getItem('analytics_session_id');
      if (!session) {
        session = crypto.randomUUID();
        sessionStorage.setItem('analytics_session_id', session);
      }
      sessionId.current = session;
    }
  }, []);

  useEffect(() => {
    if (pathname === trackedPath.current) return;
    trackedPath.current = pathname;

    // Track page view
    const trackPageView = async () => {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            page_title: document.title,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            session_id: sessionId.current
          })
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
