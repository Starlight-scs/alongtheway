'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intakeSchema, IntakeFormData } from '@/lib/validations';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

const relationshipOptions = [
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family member' },
  { value: 'pastor', label: 'Pastor or ministry leader' },
  { value: 'coworker', label: 'Coworker' },
  { value: 'other', label: 'Other' },
];

const conditionOptions = [
  { id: 'grief', label: 'Grief & Loss', icon: '💔' },
  { id: 'anxiety', label: 'Anxiety & Fear', icon: '😰' },
  { id: 'loneliness', label: 'Loneliness', icon: '🥀' },
  { id: 'health', label: 'Health Struggles', icon: '🏥' },
  { id: 'relationship', label: 'Relationship Pain', icon: '💑' },
  { id: 'family', label: 'Family Strain', icon: '👨‍👩‍👧' },
  { id: 'faith', label: 'Faith Questions', icon: '✝️' },
  { id: 'depression', label: 'Depression', icon: '🌧️' },
  { id: 'transition', label: 'Life Transition', icon: '🔄' },
  { id: 'financial', label: 'Financial Stress', icon: '💸' },
  { id: 'identity', label: 'Identity & Purpose', icon: '🧭' },
  { id: 'trauma', label: 'Past Trauma', icon: '🩹' },
];

export default function RequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [personName, setPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
  });

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => {
      const newConditions = prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId];
      const conditionLabels = newConditions.map(id =>
        conditionOptions.find(c => c.id === id)?.label || id
      ).join(', ');
      setValue('conditions', conditionLabels);
      return newConditions;
    });
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Something went wrong. Please try again.');
      }

      setPersonName(data.personFirstName);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 pb-12 pt-8 md:px-6 md:pb-16">
          <Container>
            <div className="glass-panel mx-auto max-w-3xl rounded-[2.5rem] px-6 py-12 text-center md:px-10">
              <div className="mb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl text-charcoal md:text-5xl">Thank You</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-warm-gray">
                  Mama and Papa have received your request and are already praying for {personName}.
                </p>
              </div>

              <Card className="mb-8 text-left">
                <h2 className="heading-normal text-2xl text-charcoal">What Happens Next</h2>
                <p className="mt-4 leading-7 text-warm-gray">
                  Check your email — we have sent you a meeting room code and booking link.
                  Please share it with {personName} personally, so they can book a time that works for them.
                </p>
                <p className="mt-4 leading-7 text-warm-gray">
                  The code is good for 60 days and allows unlimited sessions within that window.
                </p>
              </Card>

              <Link href="/">
                <Button variant="secondary">Return Home</Button>
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 pb-8 pt-4 md:px-6">
          <Container size="wide">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-charcoal text-white shadow-[0_30px_80px_rgba(45,36,29,0.28)]">
              <div className="texture-overlay absolute inset-0 bg-[linear-gradient(120deg,rgba(26,20,16,0.75),rgba(45,36,29,0.45)_45%,rgba(26,20,16,0.76))]" />
              <div className="relative px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
                <div className="max-w-3xl mx-auto text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white">Referral</span>
                  <h1 className="mt-6 text-white drop-shadow-sm">Refer Someone</h1>
                  <p className="mt-6 text-lg leading-8 text-white md:text-xl">
                    Tell us who needs prayer. We will begin praying as soon as your request comes in.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
                  {[
                    { step: '1', title: 'Share', desc: 'Tell us about them and what they\'re facing' },
                    { step: '2', title: 'Receive', desc: 'Get a meeting room code to share with them' },
                    { step: '3', title: 'Connect', desc: 'They book a private session with Mama & Papa' },
                  ].map((item) => (
                    <div key={item.step} className="rounded-2xl bg-white/15 p-5 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white font-semibold mb-3">
                        {item.step}
                      </div>
                      <h3 className="text-cream text-lg mb-1">{item.title}</h3>
                      <p className="text-sm" style={{ color: 'white' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* About You Section */}
          <section className="px-4 py-6 md:px-6">
            <Container>
              <div className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <div className="mb-6">
                  <span className="eyebrow">Step 1</span>
                  <h2 className="mt-4 text-charcoal">About You</h2>
                  <p className="mt-2 text-warm-gray">Tell us a bit about yourself so we can follow up.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Your name"
                    placeholder="Your full name"
                    error={errors.referrerName?.message}
                    required
                    {...register('referrerName')}
                  />
                  <Input
                    label="Your email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.referrerEmail?.message}
                    required
                    {...register('referrerEmail')}
                  />
                  <div className="md:col-span-2">
                    <Select
                      label="Your relationship to them"
                      options={relationshipOptions}
                      error={errors.referrerRelationship?.message}
                      required
                      {...register('referrerRelationship')}
                    />
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* About Them Section */}
          <section className="px-4 py-6 md:px-6">
            <Container>
              <div className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <div className="mb-6">
                  <span className="eyebrow">Step 2</span>
                  <h2 className="mt-4 text-charcoal">About Them</h2>
                  <p className="mt-2 text-warm-gray">Tell us about the person you are referring.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Their first name"
                    placeholder="First name"
                    error={errors.personFirstName?.message}
                    required
                    {...register('personFirstName')}
                  />
                  <Input
                    label="Their email (optional)"
                    type="email"
                    placeholder="them@example.com"
                    helperText="Optional — you can share the code with them yourself"
                    error={errors.personEmail?.message}
                    {...register('personEmail')}
                  />
                  <Input
                    label="Their phone (optional)"
                    type="tel"
                    placeholder="(555) 123-4567"
                    error={errors.personPhone?.message}
                    {...register('personPhone')}
                  />
                </div>
              </div>
            </Container>
          </section>

          {/* Their Situation Section */}
          <section className="px-4 py-6 md:px-6">
            <Container>
              <div className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <div className="mb-6">
                  <span className="eyebrow">Step 3</span>
                  <h2 className="mt-4 text-charcoal">Their Situation</h2>
                  <p className="mt-2 text-warm-gray">Select what best describes their situation. This helps us know how to pray.</p>
                </div>

                {/* Condition Buttons */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map((condition) => (
                      <button
                        key={condition.id}
                        type="button"
                        onClick={() => toggleCondition(condition.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                          selectedConditions.includes(condition.id)
                            ? 'bg-sage text-white shadow-md'
                            : 'bg-oat text-charcoal hover:bg-linen border border-border'
                        }`}
                      >
                        <span>{condition.icon}</span>
                        <span>{condition.label}</span>
                      </button>
                    ))}
                  </div>
                  {selectedConditions.length === 0 && (
                    <p className="text-sm text-warm-gray mt-3">Select at least one to help guide our prayers</p>
                  )}
                  <input type="hidden" {...register('conditions')} />
                </div>

                {/* Context Text Areas */}
                <div className="space-y-5">
                  <Textarea
                    label="Tell us more"
                    placeholder="Share any context that would help Mama and Papa understand and pray more specifically..."
                    error={errors.situation?.message}
                    required
                    {...register('situation')}
                  />
                  <Textarea
                    label="Specific prayer requests"
                    placeholder="What would you like Mama and Papa to pray for?"
                    error={errors.prayerRequests?.message}
                    required
                    {...register('prayerRequests')}
                  />
                  <Textarea
                    label="Anything else? (optional)"
                    placeholder="Any sensitivities or things that might help..."
                    error={errors.notesForMinisters?.message}
                    {...register('notesForMinisters')}
                  />
                </div>
              </div>
            </Container>
          </section>

          {/* How Did You Hear & Submit */}
          <section className="px-4 py-6 pb-12 md:px-6 md:pb-16">
            <Container>
              <div className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
                <Input
                  label="How did you hear about us? (optional)"
                  placeholder="A friend, church, social media, etc."
                  error={errors.howHeard?.message}
                  {...register('howHeard')}
                />

                {/* Error Message */}
                {error && (
                  <Card className="mt-6 bg-error/10 border border-error/20">
                    <p className="text-error">{error}</p>
                  </Card>
                )}

                {/* Submit */}
                <div className="mt-8 text-center">
                  <Button type="submit" isLoading={isSubmitting} className="px-12">
                    Send Referral
                  </Button>
                  <p className="mt-4 text-sm text-warm-gray">
                    We will send you a meeting room code and next steps by email.
                  </p>
                </div>
              </div>
            </Container>
          </section>
        </form>
      </main>

      <Footer />
    </div>
  );
}
