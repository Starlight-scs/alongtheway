import Link from 'next/link';
import { Container } from './Container';

export function Header() {
  return (
    <header className="sticky top-0 z-50 py-4">
      <Container size="wide">
        <div className="glass-panel flex items-center justify-between rounded-full px-5 py-3">
          <Link href="/" className="text-lg md:text-xl font-semibold text-charcoal hover:text-sage">
            Mama & Papa
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-warm-gray">
            <Link href="/#encouragement" className="hover:text-charcoal">Encouragement</Link>
            <Link href="/#connection-matters" className="hover:text-charcoal">Why Connection Matters</Link>
            <Link href="/#refer" className="hover:text-charcoal">Book or Refer</Link>
          </nav>
          <Link
            href="/request"
            className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-cream hover:bg-sage-dark"
          >
            Refer Someone
          </Link>
        </div>
      </Container>
    </header>
  );
}
