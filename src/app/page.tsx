import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const encouragements = [
    {
      title: 'From Mama',
      message:
        'I know this season may feel heavier than you expected. You do not have to carry it in silence, and you do not have to perform strength for anyone here.',
    },
    {
      title: 'From Papa',
      message:
        'Hard days can make your path feel narrow, but there is still room for grace, truth, and another steady voice beside you. You are not alone.',
    },
    {
      title: 'From Both of Us',
      message:
        'If all you can bring is weariness, questions, or tears, bring that. We will listen carefully, speak gently, and pray with you along the way.',
    },
  ];

  const stats = [
    {
      value: '1 in 3',
      title: 'feel lonely',
      body:
        'Loneliness is widespread, not rare. The need for a caring conversation is more common than most people admit.',
    },
    {
      value: '1 in 4',
      title: 'lack support',
      body:
        'Many people are surrounded by noise yet still feel unsupported. A trusted human connection can interrupt that isolation.',
    },
    {
      value: '+29%',
      title: 'higher health risk',
      body:
        'Disconnection is not only painful emotionally. It is associated with measurable harm to long-term health and wellbeing.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="px-4 pb-10 pt-2 md:px-6">
          <Container size="wide">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-charcoal text-white shadow-[0_30px_80px_rgba(45,36,29,0.28)]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/hero-video-poster.jpg"
              >
                <source src="/hero-background.mp4" type="video/mp4" />
              </video>
              <div className="texture-overlay absolute inset-0 bg-[linear-gradient(120deg,rgba(26,20,16,0.75),rgba(45,36,29,0.45)_45%,rgba(26,20,16,0.76))]" />
              <div className="relative px-6 py-20 md:px-12 md:py-28 lg:px-16 lg:py-32">
                <div className="max-w-4xl">
                  <span className="eyebrow border-white/20 bg-white/15 text-white">A quiet, human-centered invitation</span>
                  <h1 className="mt-6 max-w-3xl text-white">
                    Along the way
                  </h1>
                  <p className="mt-6 max-w-3xl text-lg leading-8 text-white md:text-2xl md:leading-10">
                    Sometimes you need people to walk with you, talk with you, and pray with you along the way.
                  </p>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
                    Mama and Papa offer warm, faith-filled sessions for people who need to be heard, encouraged, and covered in prayer through difficult seasons.
                  </p>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link href="/request">
                      <Button>Refer Someone for Prayer</Button>
                    </Link>
                    <Link href="/book">
                      <Button variant="secondary" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
                        Book with an Access Code
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="encouragement" className="px-4 py-10 md:px-6 md:py-14">
          <Container size="wide">
            <div className="mb-10 max-w-3xl">
              <span className="eyebrow">Messages of encouragement</span>
              <h2 className="mt-5">A few words for the person carrying more than they can say out loud.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {encouragements.map((item) => (
                <article key={item.title} className="section-shell rounded-[2rem] p-7 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">{item.title}</p>
                  <p className="mt-5 text-lg leading-8 text-charcoal">{item.message}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="connection-matters" className="px-4 py-10 md:px-6 md:py-14">
          <Container size="wide">
            <div className="section-shell rounded-[2.5rem] px-6 py-10 md:px-10 md:py-12">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
                <div>
                  <span className="eyebrow">Why connection matters</span>
                  <h2 className="mt-5 max-w-3xl">Loneliness does more than hurt emotionally. It can quietly weigh on the whole person.</h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8">
                    When someone is overwhelmed, a wise conversation does not fix everything, but it can interrupt isolation, create space to breathe, and help them remember they are seen. That matters spiritually, emotionally, and physically.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  {stats.map((stat) => (
                    <div key={stat.title} className="rounded-[1.75rem] bg-oat p-6 shadow-[0_12px_30px_rgba(45,36,29,0.05)]">
                      <div className="text-3xl font-semibold text-charcoal md:text-4xl">{stat.value}</div>
                      <h3 className="mt-2 text-lg text-charcoal">{stat.title}</h3>
                      <p className="mt-2 text-sm leading-6">{stat.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="px-4 py-10 md:px-6 md:py-14">
          <Container size="wide">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="section-shell rounded-[2rem] p-8 lg:col-span-2">
                <span className="eyebrow">How it works</span>
                <div className="mt-8 grid gap-7 md:grid-cols-3">
                  {[
                    ['1', 'Refer with care', 'A friend, family member, or loved one shares who needs prayer and what they are walking through.'],
                    ['2', 'We pray first', 'Mama and Papa begin praying immediately and send an access code for scheduling.'],
                    ['3', 'Connect live', 'They choose a time for a private video session centered on listening, encouragement, and prayer.'],
                  ].map(([step, title, body]) => (
                    <div key={step} className="rounded-[1.5rem] bg-oat p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage text-lg font-semibold text-white">
                        {step}
                      </div>
                      <h3 className="mt-5 text-2xl text-charcoal">{title}</h3>
                      <p className="mt-3 text-base leading-7">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-shell rounded-[2rem] p-8">
                <span className="eyebrow">About Mama & Papa</span>
                <p className="mt-6 text-lg leading-8 text-charcoal">
                  With decades of ministry, they have spent years sitting with people through grief, loneliness, faith questions, family strain, and hard turning points.
                </p>
                <p className="mt-4 text-base leading-7">
                  These sessions are not clinical counseling. They are simple, reverent conversations where someone is heard well, encouraged honestly, and prayed for with care.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section id="why-referrals" className="px-4 py-10 md:px-6 md:py-14">
          <Container size="wide">
            <div className="rounded-[2.5rem] bg-charcoal px-6 py-12 text-white md:px-12 md:py-16">
              <div className="max-w-4xl mx-auto text-center">
                <span className="eyebrow border-white/20 bg-white/15 text-white">Walking Together</span>
                <h2 className="mt-6 text-white">Why Referrals?</h2>
                <p className="mt-6 text-lg leading-8 text-white md:text-xl">
                  We believe the most important thing is to be in community. None of us can be everything for someone who is hurting — and we were never meant to be.
                </p>
                <p className="mt-5 text-base leading-7 text-white/90 md:text-lg">
                  Along the way, we want and need each other to receive from people who carry the heart of the Father. When you refer someone, you are not handing them off — you are inviting more hands to hold them, more voices to encourage them, and more hearts to pray for them.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
                  <div className="rounded-2xl bg-white/10 p-6">
                    <div className="text-2xl mb-3">🤝</div>
                    <h3 className="text-white text-lg">Community, Not Isolation</h3>
                    <p className="mt-2 text-sm text-white/90">No one should walk through hard seasons alone. Referrals create connection.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-6">
                    <div className="text-2xl mb-3">💛</div>
                    <h3 className="text-white text-lg">Shared Burden</h3>
                    <p className="mt-2 text-sm text-white/90">You don't have to carry someone alone. Let others help you love them well.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-6">
                    <div className="text-2xl mb-3">🙏</div>
                    <h3 className="text-white text-lg">Heart of the Father</h3>
                    <p className="mt-2 text-sm text-white/90">More people praying means more of God's love surrounding those who need it most.</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="refer" className="px-4 py-10 md:px-6 md:py-14">
          <Container size="wide">
            <div className="section-shell rounded-[2.5rem] px-6 py-10 md:px-10 md:py-12">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <span className="eyebrow">Book or refer</span>
                  <h2 className="mt-5 max-w-2xl">Take the next gentle step for someone you love, or for yourself.</h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8">
                    If you know someone who needs prayer and a listening ear, send a referral. If you already have an access code, book a time that feels right.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[1.75rem] bg-oat p-6">
                    <h3 className="text-2xl text-charcoal">Refer someone</h3>
                    <p className="mt-3 text-base leading-7">Share their name, what they are walking through, and how Mama and Papa can pray.</p>
                    <div className="mt-6">
                      <Link href="/request">
                        <Button className="w-full">Open the Referral Form</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] bg-oat p-6">
                    <h3 className="text-2xl text-charcoal">Book your session</h3>
                    <p className="mt-3 text-base leading-7">Already received a private access code? Use it to choose a time and join the conversation.</p>
                    <div className="mt-6">
                      <Link href="/book">
                        <Button variant="secondary" className="w-full">Enter Access Code</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
