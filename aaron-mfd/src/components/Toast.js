'use client';
import { createContext, useCallback, useContext, useState } from 'react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const toast = useCallback((m) => {
    setMsg(m);
    clearTimeout(globalThis.__toastT);
    globalThis.__toastT = setTimeout(() => setMsg(null), 2200);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      {msg && <div id="toast">{msg}</div>}
    </Ctx.Provider>
  );
}
