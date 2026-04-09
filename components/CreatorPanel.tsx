'use client';

import { useState } from 'react';

export function CreatorPanel() {
  const [avatarSrc, setAvatarSrc] = useState(
    'https://drive.google.com/uc?id=1AUnYEZdGEjJk9RKt_O4fSsbLENiEQjHD'
  );

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: '🔗',
      url: 'https://www.linkedin.com/in/paul-adamu-67bb46324',
      color: 'hover:bg-blue-400/20 hover:border-blue-400/40',
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/paul_dev_zti',
      color: 'hover:bg-pink-400/20 hover:border-pink-400/40',
    },
    {
      name: 'TikTok',
      icon: '🎵',
      url: 'https://tiktok.com/@pa_zti',
      color: 'hover:bg-cyan-400/20 hover:border-cyan-400/40',
    },
    {
      name: 'YouTube',
      icon: '▶️',
      url: 'https://www.youtube.com/@officialpauladamu',
      color: 'hover:bg-red-400/20 hover:border-red-400/40',
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400/30 bg-gradient-to-br from-amber-400/20 to-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
            <img
              src={avatarSrc}
              alt="Paul Adamu"
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                const svgBase64 = btoa(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect fill="#1d2936" width="256" height="256"/><text x="50%" y="50%" font-size="64" fill="#fbbf24" text-anchor="middle" dominant-baseline="middle" font-family="Arial">PA</text></svg>`
                );
                target.src = `data:image/svg+xml;base64,${svgBase64}`;
              }}
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Paul Adamu</h2>
        <p className="text-sm sm:text-base text-amber-300 font-medium mb-2">Web Developer</p>
        <p className="text-xs sm:text-sm text-slate-400 px-2 mb-6">
          Building modern web experiences with React, Next.js, and creative APIs
        </p>

        <div className="space-y-2 mb-6">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 sm:p-4 transition ${link.color}`}
            >
              <span className="text-xl sm:text-2xl">{link.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm sm:text-base font-medium text-slate-100">{link.name}</p>
                <p className="text-xs text-slate-400 hidden sm:block">Visit my {link.name}</p>
              </div>
              <span className="text-slate-500 text-sm">→</span>
            </a>
          ))}
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 sm:p-5 text-left">
          <h3 className="font-semibold text-slate-100 mb-3 text-sm sm:text-base">About This Project</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Nexora is a personal productivity dashboard integrating real-time data from multiple APIs including News, Spotify, Stock Markets, Weather, and creative
            features like Meme Generation. Built with Next.js, React, Tailwind CSS, and fully responsive for mobile, tablet, and desktop.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 text-center text-xs text-slate-400">
          <p>Profile picture from Google Drive</p>
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-xs sm:text-sm text-slate-300 mb-3">Have a project in mind?</p>
          <a
            href="https://www.linkedin.com/in/paul-adamu-67bb46324"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto rounded-lg bg-amber-400/20 border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition text-center"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
