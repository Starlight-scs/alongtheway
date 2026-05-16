import Link from 'next/link';
import { Container } from './Container';

export function Header() {
  return (
    <header className="py-6">
      <Container>
        <Link href="/" className="text-xl font-semibold text-charcoal hover:text-sage transition-colors">
          Prayer & Encouragement
        </Link>
      </Container>
    </header>
  );
}
