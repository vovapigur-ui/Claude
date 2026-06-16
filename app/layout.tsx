import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ToastHost from '@/components/Toast';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'APEX — Producer OS',
  description: 'The command center for top-producing real estate agents',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'APEX',
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${archivo.variable} ${jetbrainsMono.variable} ${inter.variable} bg-zinc-950 text-zinc-100 min-h-screen`}>
        <div className="max-w-[428px] mx-auto relative min-h-screen">
          <main className="pb-24">{children}</main>
          <BottomNav />
          <ToastHost />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
          }}
        />
      </body>
    </html>
  );
}
