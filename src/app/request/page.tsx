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

      <main className="flex-1 py-12">
        <Container>
          {submitted ? (
            <div className="max-w-xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold text-charcoal mb-4">
                  Thank you
                </h1>
                <p className="text-lg text-warm-gray leading-relaxed mb-6">
                  Mama and Papa have received your request and are already praying for {personName}.
                </p>
              </div>

              <Card className="text-left mb-8">
                <h2 className="text-xl font-semibold text-charcoal mb-3">
                  What happens next
                </h2>
                <p className="text-warm-gray leading-relaxed mb-4">
                  Check your email — we have sent you an access code and booking link.
                  Please share it with {personName} personally, so they can book a time that works for them.
                </p>
                <p className="text-warm-gray leading-relaxed">
                  The code is good for 60 days and allows unlimited sessions within that window.
                </p>
              </Card>

              <Link href="/">
                <Button variant="secondary">Return home</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-semibold text-charcoal mb-4">
                  Request a session
                </h1>
                <p className="text-lg text-warm-gray leading-relaxed">
                  Tell us about the person you want to refer. Mama and Papa will begin praying
                  for them as soon as this arrives. This takes about 3 minutes.
                </p>
              </div>

              <div className="max-w-xl">
                <IntakeForm onSuccess={handleSuccess} />
              </div>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
