import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InterviewAI — AI Mock Interview & Practice Platform',
  description: 'AI-powered mock interview and career preparation platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#eff1f7] text-[#1c1e2d] antialiased p-2 sm:p-5 flex items-center justify-center font-sans`}
      >
        <div className="w-full max-w-[1400px] min-h-[92vh] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-[#e8ecf4] flex flex-col md:flex-row overflow-hidden">
          <Suspense fallback={<div className="w-56 bg-white border-r border-[#eaecf4]" />}>
            <LeftSidebar />
          </Suspense>

          <div className="flex-1 flex flex-col min-w-0 bg-[#fafbfe]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
