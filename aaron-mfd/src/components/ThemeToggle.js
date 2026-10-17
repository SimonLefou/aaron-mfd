'use client';
import { useEffect, useState } from 'react';

const KEY = 'aaron-mfd.theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('holo');
  useEffect(() => { setTheme(document.documentElement.dataset.theme || 'holo'); }, []);
  const toggle = () => {
    const next = theme === 'holo' ? 'classic' : 'holo';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
    setTheme(next);
  };
  return (
    <div className="chip theme-toggle" onClick={toggle} title="Changer de thème">
      Thème <b>{theme === 'holo' ? 'Holo' : 'Classique'}</b>
    </div>
  );
}
