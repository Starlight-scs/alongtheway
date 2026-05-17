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

interface IntakeFormProps {
  onSuccess: (personName: string) => void;
}

export function IntakeForm({ onSuccess }: IntakeFormProps) {
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
      // Update the form value with selected condition labels
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
        <h3 className="heading-normal text-xl font-semibold text-charcoal mb-2">About You</h3>
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
        <h3 className="heading-normal text-xl font-semibold text-charcoal mb-2">About Them</h3>
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

      {/* Section 3: What They're Walking Through */}
      <section>
        <h3 className="heading-normal text-xl font-semibold text-charcoal mb-2">Their Situation</h3>
        <p className="text-warm-gray mb-6">
          Select what best describes their situation. This helps us know how to pray.
        </p>

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

        {/* Context Text Area */}
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
