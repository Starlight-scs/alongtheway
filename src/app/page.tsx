import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <Container>
            <h1 className="text-4xl md:text-5xl font-semibold text-charcoal leading-tight mb-6">
              A listening ear, a word of encouragement, and a prayer.
            </h1>
            <p className="text-xl text-warm-gray leading-relaxed mb-10 max-w-xl">
              Connecting hurting people with Mama and Papa — two ministers who have spent
              over 40 years listening, encouraging, and praying with people through hard seasons.
            </p>
            <Link href="/request">
              <Button>Request a session for someone</Button>
            </Link>
          </Container>
        </section>

        {/* Who This Is For */}
        <section className="py-16 bg-linen">
          <Container>
            <h2 className="text-3xl font-semibold text-charcoal mb-6">
              Who this is for
            </h2>
            <p className="text-lg text-warm-gray leading-relaxed mb-4">
              This is for people walking through hard times — single parents carrying weight alone,
              those feeling lonely or disillusioned, anyone who could use someone to listen and pray with them.
            </p>
            <p className="text-lg text-warm-gray leading-relaxed">
              These sessions are not therapy, and they are not prosperity-gospel encouragement.
              They are conversations where someone hears what you are carrying, encourages you in the Lord,
              and prays with you. Simple, sacred, and free.
            </p>
          </Container>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <Container>
            <h2 className="text-3xl font-semibold text-charcoal mb-10">
              How it works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage text-cream flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    You submit a request
                  </h3>
                  <p className="text-warm-gray leading-relaxed">
                    Fill out a short form telling us about the person you want to refer and what they are walking through.
                    Mama and Papa will begin praying as soon as it arrives.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage text-cream flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    You share the booking link
                  </h3>
                  <p className="text-warm-gray leading-relaxed">
                    We will send you an access code and booking link. You personally share it with the person you are caring for —
                    a small act of love that says, &ldquo;I see you, and I want to walk with you in this.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage text-cream flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    They book a time
                  </h3>
                  <p className="text-warm-gray leading-relaxed">
                    When they are ready, they enter the code and pick a time that works for them.
                    They will meet with Mama and Papa over Zoom for a 40-minute session.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* About Mama and Papa */}
        <section className="py-16 bg-linen">
          <Container>
            <h2 className="text-3xl font-semibold text-charcoal mb-6">
              About Mama and Papa
            </h2>
            <p className="text-lg text-warm-gray leading-relaxed mb-4">
              Mama and Papa are ministers who have spent over 40 years pastoring, encouraging,
              and praying for people through every season of life — grief, loneliness, family struggles,
              faith questions, and everything in between.
            </p>
            <p className="text-lg text-warm-gray leading-relaxed">
              They are not professional counselors. They are simply two people who love to listen,
              who believe that God is close to the brokenhearted, and who would love to pray with you.
            </p>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-16">
          <Container className="text-center">
            <h2 className="text-3xl font-semibold text-charcoal mb-4">
              Know someone who could use this?
            </h2>
            <p className="text-lg text-warm-gray mb-8">
              It only takes a few minutes to submit a request.
            </p>
            <Link href="/request">
              <Button>Request a session</Button>
            </Link>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
