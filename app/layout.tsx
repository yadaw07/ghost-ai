import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

import { dark } from '@clerk/ui/themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ghost AI',
  description: 'Ghost AI collaborative system design workspace',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>
        <ClerkProvider
          appearance={{
            theme: dark,

            variables: {
              colorBackground: 'var(--card)',
              colorForeground: 'var(--foreground)',
              colorPrimary: 'var(--primary)',
              colorPrimaryForeground: 'var(--primary-foreground)',

              colorInput: 'var(--input)',
              colorInputForeground: 'var(--foreground)',

              colorMuted: 'var(--muted)',
              colorMutedForeground: 'var(--muted-foreground)',

              colorNeutral: 'var(--foreground)',

              colorDanger: 'var(--destructive)',
              colorSuccess: 'var(--success)',
              colorWarning: 'var(--warning)',

              colorBorder: 'var(--border)',
              colorRing: 'var(--ring)',
              colorShadow: 'var(--background)',

              fontFamily: 'var(--font-geist-sans)',
              borderRadius: 'var(--radius)',
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
