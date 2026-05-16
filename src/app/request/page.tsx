'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [personName, setPersonName] = useState('');

  const handleSuccess = (name: string) => {
    setPersonName(name);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 pb-12 pt-2 md:px-6 md:pb-16">
        <Container size="wide">
          {submitted ? (
            <div className="glass-panel mx-auto max-w-3xl rounded-[2.5rem] px-6 py-12 text-center md:px-10">
              <div className="mb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl text-charcoal md:text-5xl">
                  Thank you
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-warm-gray">
                  Mama and Papa have received your request and are already praying for {personName}.
                </p>
              </div>

              <Card className="mb-8 text-left">
                <h2 className="text-2xl text-charcoal">
                  What happens next
                </h2>
                <p className="mt-4 leading-7 text-warm-gray">
                  Check your email — we have sent you an access code and booking link.
                  Please share it with {personName} personally, so they can book a time that works for them.
                </p>
                <p className="mt-4 leading-7 text-warm-gray">
                  The code is good for 60 days and allows unlimited sessions within that window.
                </p>
              </Card>

              <Link href="/">
                <Button variant="secondary">Return home</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="section-shell rounded-[2.5rem] px-6 py-8 md:px-8 md:py-10">
                <span className="eyebrow">Referral intake</span>
                <h1 className="mt-5 max-w-xl text-charcoal">Refer someone with care.</h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-warm-gray">
                  Use this form to tell us who needs prayer, encouragement, and a compassionate conversation. Mama and Papa will begin praying as soon as your request comes in.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    'Share enough context for prayer, without pressure to write perfectly.',
                    'We will send an access code and booking link for you to pass along personally.',
                    'The conversation is warm, private, and centered on listening, encouragement, and prayer.',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.25rem] bg-oat px-5 py-4">
                      <p className="text-base leading-7 text-charcoal">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-[1.75rem] bg-charcoal px-6 py-7 text-cream">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cream/70">A note from Mama & Papa</p>
                  <p className="mt-4 text-lg leading-8 text-cream/88">
                    We know it can be hard to ask for help. If someone is hurting right now, this can be one quiet way to let them know someone is ready to walk with them.
                  </p>
                </div>
              </section>

              <section className="glass-panel rounded-[2.5rem] px-6 py-8 md:px-8 md:py-10">
                <div className="mb-8">
                  <h2 className="text-3xl text-charcoal">Book / Refer section</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-warm-gray">
                    This form takes about three minutes. Once submitted, we will respond with the next step for scheduling.
                  </p>
                </div>

                <IntakeForm onSuccess={handleSuccess} />
              </section>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
