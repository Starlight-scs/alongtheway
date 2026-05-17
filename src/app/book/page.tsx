'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyCodeSchema, VerifyCodeData } from '@/lib/validations';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CalEmbed } from '@/components/CalEmbed';

export default function BookPage() {
  const [verified, setVerified] = useState(false);
  const [personName, setPersonName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const onSubmit = async (data: VerifyCodeData) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code }),
      });

      const result = await response.json();

      if (!response.ok || !result.valid) {
        throw new Error(result.message || 'Invalid meeting room code');
      }

      setAccessCode(data.code.toUpperCase().trim());
      setPersonName(result.personName);
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || 'starlight-creative-studios-avhwm0/30min';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <Container size={verified ? 'wide' : 'default'}>
          {verified ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-semibold text-charcoal mb-3">
                  Welcome{personName ? `, ${personName}` : ''}
                </h1>
                <p className="text-lg text-warm-gray">
                  Pick a time that works for you. Mama and Papa are looking forward to meeting you.
                </p>
              </div>

              <CalEmbed calLink={calLink} accessCode={accessCode} />

              <p className="text-center text-warm-gray mt-6">
                You can book as many sessions as you need. Your code is good for 60 days.
              </p>
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-charcoal mb-4">
                  Ready to book your session?
                </h1>
                <p className="text-lg text-warm-gray leading-relaxed">
                  Enter the meeting room code you received to book a time with Mama and Papa.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Meeting room code"
                  placeholder="Enter your code"
                  error={errors.code?.message || (error ? error : undefined)}
                  className="text-center text-xl tracking-wider uppercase"
                  autoComplete="off"
                  autoCapitalize="characters"
                  {...register('code')}
                />

                <Button type="submit" isLoading={isVerifying} className="w-full">
                  Continue
                </Button>
              </form>

              <p className="text-center text-warm-gray text-sm mt-8">
                Don&apos;t have a code? Ask the person who referred you to share it with you.
              </p>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
