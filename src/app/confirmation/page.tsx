import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-semibold text-charcoal mb-4">
                You&apos;re all set
              </h1>
              <p className="text-lg text-warm-gray leading-relaxed">
                Your session is booked. Mama and Papa are looking forward to meeting you.
              </p>
            </div>

            <Card className="text-left mb-8">
              <h2 className="text-xl font-semibold text-charcoal mb-3">
                What to expect
              </h2>
              <ul className="space-y-3 text-warm-gray">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>You will receive a calendar invite with the Zoom link.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your session will be about 40 minutes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Mama and Papa are already praying for you.</span>
                </li>
              </ul>
            </Card>

            <div className="space-y-4">
              <p className="text-warm-gray">
                Need another session? Your access code is good for 60 days.
              </p>
              <Link href="/book">
                <Button variant="secondary">Book another session</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
