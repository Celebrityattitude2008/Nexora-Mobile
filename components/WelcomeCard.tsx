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

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

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
    <div className="rounded-[2rem] border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950/90 p-6 shadow-panel animate-slide-up-fade backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={openFilePicker}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-2xl font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:scale-105 focus:outline-none"
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
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '';
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
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '';
              }}
            />
          ) : (
            firstLetter
          )}
          <span className="pointer-events-none absolute bottom-0 right-0 h-7 w-7 rounded-full bg-slate-950/90 text-[10px] font-semibold text-amber-300 border border-slate-800 flex items-center justify-center">
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
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Welcome back</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{displayName}</h3>
          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
          {!user.emailVerified && (
            <p className="mt-3 rounded-full bg-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Check your inbox, spam, or promotions folder for the verification email.
            </p>
          )}
        </div>
      </div>

      {!user.emailVerified && (
        <div className="mt-4 rounded-3xl border border-amber-400/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-slate-200">
            Email verification helps secure your dashboard. If the link doesn’t appear, check spam and promotions.
          </p>
        </div>
      )}
    </div>
  );
}
                                                                  