'use client';

import { SignUp } from '@clerk/nextjs';
import { FileText, Network, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Architecture Generation',
    description:
      'Describe your system, AI maps it to nodes and edges on a live canvas.',
  },
  {
    icon: Network,
    title: 'Real-time Collaboration',
    description:
      'Live cursors, presence indicators, and shared node editing across your team.',
  },
  {
    icon: FileText,
    title: 'Instant Spec Generation',
    description:
      'Export a complete Markdown technical spec directly from the canvas graph.',
  },
];

export default function SignUpPage() {
  return (
    <main className='min-h-screen bg-background text-foreground md:grid md:grid-cols-[48%_52%]'>
      {/* Left panel */}
      <section className='hidden min-h-screen flex-col justify-between border-r border-border/70 bg-surface px-10 py-10 md:flex lg:px-16'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div className='flex size-7 items-center justify-center rounded-sm bg-primary'>
            <span className='text-sm font-bold text-primary-foreground'>G</span>
          </div>

          <span className='text-sm font-medium'>Ghost AI</span>
        </div>

        {/* Content */}
        <div className='max-w-xl'>
          <div className='mb-12'>
            <h1 className='max-w-md text-3xl font-semibold leading-tight tracking-tight lg:text-4xl'>
              Build systems at the
              <br />
              speed of thought.
            </h1>

            <p className='mt-5 max-w-lg text-sm leading-6 text-muted-foreground'>
              Create your workspace and turn your ideas into collaborative
              system architecture with Ghost AI.
            </p>
          </div>

          <div className='space-y-7'>
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className='flex gap-4'>
                <div className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border border-primary/30 bg-primary/10'>
                  <Icon className='size-3.5 text-primary' />
                </div>

                <div>
                  <h2 className='text-sm font-medium'>{title}</h2>

                  <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className='text-xs text-muted-foreground'>
          © 2026 Ghost AI. All rights reserved.
        </p>
      </section>

      {/* Sign up */}
      <section className='flex min-h-screen items-center justify-center bg-background px-5 py-10'>
        <SignUp signInUrl='/sign-in' />
      </section>
    </main>
  );
}
