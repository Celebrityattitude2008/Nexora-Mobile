'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  label?: string;
  message?: string;
}

export function LoadingScreen({
  label = 'Loading',
  message = 'Securing your workspace…',
}: LoadingScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    return () => setExiting(true);
  }, []);

  return (
    <div className={`nexora-loading-overlay${exiting ? ' exiting' : ''}`}>
      <div className="nexora-loading-center">
        <div className="nexora-loading-rings">
          <div className="nexora-ring nexora-ring-1" />
          <div className="nexora-ring nexora-ring-2" />
          <div className="nexora-ring nexora-ring-3" />
          <div className="nexora-loading-logo">
            <Image
              src="/icons/icon-192.png"
              alt="Nexora"
              width={44}
              height={44}
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="nexora-loading-dots">
          <div className="nexora-loading-dot" />
          <div className="nexora-loading-dot" />
          <div className="nexora-loading-dot" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
