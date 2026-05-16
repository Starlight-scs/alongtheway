'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intakeSchema, IntakeFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

const relationshipOptions = [
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family member' },
  { value: 'pastor', label: 'Pastor or ministry leader' },
  { value: 'coworker', label: 'Coworker' },
  { value: 'other', label: 'Other' },
];

interface IntakeFormProps {
  onSuccess: (personName: string) => void;
}

export function IntakeForm({ onSuccess }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
  });

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

      onSuccess(data.personFirstName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Section 1: About You */}
      <section>
        <h2 className="text-2xl font-semibold text-charcoal mb-2">About you</h2>
        <p className="text-warm-gray mb-6">Tell us a bit about yourself.</p>

        <div className="space-y-5">
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
          <Select
            label="Your relationship to them"
            options={relationshipOptions}
            error={errors.referrerRelationship?.message}
            required
            {...register('referrerRelationship')}
          />
        </div>
      </section>

      {/* Section 2: About Them */}
      <section>
        <h2 className="text-2xl font-semibold text-charcoal mb-2">About them</h2>
        <p className="text-warm-gray mb-6">Tell us about the person you are referring.</p>

        <div className="space-y-5">
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
      </section>

      {/* Section 3: Their Story */}
      <section>
        <h2 className="text-2xl font-semibold text-charcoal mb-2">Their story</h2>
        <p className="text-warm-gray mb-6">
          Help Mama and Papa understand what this person is walking through.
        </p>

        <div className="space-y-5">
          <Textarea
            label="What are they walking through?"
            placeholder="Share as much or as little as feels right..."
            error={errors.situation?.message}
            required
            {...register('situation')}
          />
          <Textarea
            label="Prayer requests"
            placeholder="What would you like Mama and Papa to pray for specifically?"
            error={errors.prayerRequests?.message}
            required
            {...register('prayerRequests')}
          />
          <Textarea
            label="Anything else Mama and Papa should know? (optional)"
            placeholder="Any sensitivities, context, or things that might help..."
            error={errors.notesForMinisters?.message}
            {...register('notesForMinisters')}
          />
        </div>
      </section>

      {/* Section 4: Optional */}
      <section>
        <Input
          label="How did you hear about us? (optional)"
          placeholder="A friend, church, social media, etc."
          error={errors.howHeard?.message}
          {...register('howHeard')}
        />
      </section>

      {/* Error Message */}
      {error && (
        <Card className="bg-error/10 border border-error/20">
          <p className="text-error">{error}</p>
        </Card>
      )}

      {/* Submit */}
      <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
        Send this request
      </Button>
    </form>
  );
}
