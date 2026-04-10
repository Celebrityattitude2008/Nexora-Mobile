'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create your account' : 'Welcome back';
  const description = isSignup
    ? 'Sign up to save your dashboard data and access it anywhere.'
    : 'Log in to continue using your personal productivity hub.';

  const submit = async () => {
    setError('');
    setStatus('Processing...');

    if (!email || !password || (isSignup && !confirmPassword)) {
      setError('Please fill in all required fields.');
      setStatus('');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      setStatus('');
      return;
    }

    try {
      if (isSignup) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        setStatus('Account created! Check your email to verify your account.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus('Success! Redirecting...');
      }
    } catch (err) {
      const message = (err as Error).message || 'Authentication failed.';
      setError(message.replace('Firebase: ', ''));
      setStatus('');
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setStatus('Signing in with Google...');
    try {
      await signInWithPopup(auth, googleProvider);
      setStatus('Success! Redirecting...');
    } catch (err) {
      const message = (err as Error).message || 'Google sign-in failed.';
      setError(message.replace('Firebase: ', ''));
      setStatus('');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="rounded-[2rem] border border-slate-700/70 bg-slate-900/90 p-8 shadow-panel animate-slide-up-fade backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Secure access</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-slate-400">{description}</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMode('login')}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
              !isSignup
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'border border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
              isSignup
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'border border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="grid gap-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-slate-100 outline-none transition focus:border-amber-400"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-slate-100 outline-none transition focus:border-amber-400"
          />
          {isSignup ? (
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-slate-100 outline-none transition focus:border-amber-400"
            />
          ) : null}

          {error ? <p className="text-sm text-amber-300">{error}</p> : null}
          {status ? <p className="text-sm text-amber-300">{status}</p> : null}

          <button
            onClick={submit}
            className="rounded-full bg-amber-400 px-6 py-4 text-base font-semibold text-slate-950 transition duration-300 hover:bg-amber-300"
          >
            {isSignup ? 'Create account' : 'Continue'}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Or</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 rounded-full border border-slate-700 bg-slate-950/80 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-700/70 bg-slate-900/90 p-6 shadow-panel backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Why sign in?</p>
        <ul className="mt-4 space-y-3 text-slate-400">
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-300" />
            Save tasks, goals, and calendar events across devices.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-300" />
            Access your personal dashboard from anywhere.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-300" />
            Keep your dashboard secure with Firebase authentication.
          </li>
        </ul>
      </div>
    </div>
  );
}
