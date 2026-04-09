'use client';

import { useEffect, useState } from 'react';

export function NotesWidget() {
  const [note, setNote] = useState('Welcome to your personal notes! Add reminders, ideas, or anything important here.');
  const [isEditing, setIsEditing] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    const value = window.localStorage.getItem('dashboard-notes');
    if (value) {
      setNote(value);
      setCharacterCount(value.length);
    }
  }, []);

  const updateNote = (value: string) => {
    setNote(value);
    setCharacterCount(value.length);
    window.localStorage.setItem('dashboard-notes', value);
  };

  const clearNotes = () => {
    setNote('');
    setCharacterCount(0);
    window.localStorage.removeItem('dashboard-notes');
  };

  const exportNotes = () => {
    const dataStr = `data:text/plain;charset=utf-8,${encodeURIComponent(note)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `notes-${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Personal Notes</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Your digital notebook</h2>
          <div className="mt-2 flex gap-4 text-xs sm:text-sm text-slate-400">
            <span>{characterCount} characters</span>
            <span>{note.split('\n').length} lines</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-lg bg-slate-600/20 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600/40 transition"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={exportNotes}
            disabled={!note.trim()}
            className="rounded-lg bg-blue-600/20 px-3 py-2 text-xs text-blue-300 hover:bg-blue-600/40 transition disabled:opacity-50"
          >
            Export
          </button>
          <button
            onClick={clearNotes}
            disabled={!note.trim()}
            className="rounded-lg bg-red-600/20 px-3 py-2 text-xs text-red-300 hover:bg-red-600/40 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={note}
          onChange={(event) => updateNote(event.target.value)}
          placeholder="Start writing your thoughts, ideas, reminders..."
          className="min-h-[240px] w-full rounded-3xl border border-slate-700/80 bg-slate-950/90 p-5 text-slate-100 shadow-inner outline-none transition focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 resize-none"
          style={{ fontFamily: 'inherit' }}
        />
      ) : (
        <div className="min-h-[240px] w-full rounded-3xl border border-slate-700/80 bg-slate-950/90 p-5 text-slate-100">
          {note.trim() ? (
            <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
              {note}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <p>Click "Edit" to start writing your notes</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Your notes are stored locally in your browser for privacy</span>
        {note.trim() && (
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        )}
      </div>
    </section>
  );
}
