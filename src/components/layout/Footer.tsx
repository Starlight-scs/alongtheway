import { Container } from './Container';

export function Footer() {
  return (
    <footer className="py-12 mt-auto">
      <Container>
        <div className="border-t border-border pt-8">
          <p className="text-sm text-warm-gray leading-relaxed">
            This is not a substitute for professional help. If you or someone you know is in immediate danger,
            please contact emergency services or a crisis helpline.
          </p>
          <p className="text-sm text-warm-gray mt-4">
            &copy; {new Date().getFullYear()} Prayer & Encouragement. Made with love.
          </p>
        </div>
      </Container>
    </footer>
  );
}
