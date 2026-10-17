import './globals.css';
import './mobiglas.css';
import { Electrolize, Rajdhani } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { ToastProvider } from '@/components/Toast';

const ui = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-ui' });
const title = Electrolize({ subsets: ['latin'], weight: '400', variable: '--font-title' });

export const metadata = { title: 'AARON MFD', description: 'Gestion Star Citizen' };

// Applique le thème enregistré avant l'affichage (évite un flash)
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('aaron-mfd.theme')||'holo'}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-theme="holo" className={`${ui.variable} ${title.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <ToastProvider>
          <TopBar />
          <Sidebar />
          <main>{children}</main>
          <div className="watermark">Prototype · données d&apos;exemple</div>
        </ToastProvider>
      </body>
    </html>
  );
}
