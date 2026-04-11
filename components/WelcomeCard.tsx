'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { User } from 'firebase/auth';
import { database, userProfilePicRef } from './firebase';

interface WelcomeCardProps {
  user: User;
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  const [profilePic, setProfilePic] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const profileRef = userProfilePicRef(user.uid);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const value = snapshot.val();
      if (typeof value === 'string' && value) {
        setProfilePic(value);
      } else {
        setProfilePic('');
      }
    });
    return unsubscribe;
  }, [user.uid]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handlePicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setProfilePic(dataUrl);
      await set(ref(database, `users/${user.uid}/profilePic`), dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="rounded-[2rem] border p-6 shadow-panel animate-slide-up-fade backdrop-blur-xl"
      style={{
        borderColor: 'var(--border-accent)',
        backgroundColor: 'var(--surface-80)',
        background: `linear-gradient(135deg, var(--accent-soft) 0%, var(--surface-80) 60%, var(--bg-80) 100%)`,
      }}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={openFilePicker}
          className="relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shadow-lg transition-transform hover:scale-105 focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #e09600)',
            color: '#111',
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}
        >
          {profilePic ? (
            <Image
              src={profilePic}
              alt={displayName}
              width={64}
              height={64}
              unoptimized
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.onerror = null;
                t.src = '';
              }}
            />
          ) : user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={displayName}
              width={64}
              height={64}
              unoptimized
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.onerror = null;
                t.src = '';
              }}
            />
          ) : (
            firstLetter
          )}
          <span
            className="pointer-events-none absolute bottom-0 right-0 h-7 w-7 rounded-full border flex items-center justify-center text-[10px] font-semibold"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            Edit
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePicUpload}
        />

        <div>
          <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>
            Welcome back
          </p>
          <h3 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text)' }}>
            {displayName}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {user.email}
          </p>
          {!user.emailVerified && (
            <p
              className="mt-3 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
              }}
            >
              Check your inbox for the verification email.
            </p>
          )}
        </div>
      </div>

      {!user.emailVerified && (
        <div
          className="mt-4 rounded-3xl border px-4 py-3"
          style={{
            borderColor: 'var(--border-accent)',
            backgroundColor: 'var(--accent-soft)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            Email verification helps secure your dashboard. If the link doesn&apos;t appear, check spam and promotions.
          </p>
        </div>
      )}
    </div>
  );
}
