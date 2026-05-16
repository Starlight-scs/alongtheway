import { Container } from './Container';

export function Footer() {
  return (
    <footer className="mt-auto py-14">
      <Container size="wide">
        <div className="section-shell rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
          <p className="max-w-3xl text-sm leading-relaxed text-warm-gray">
            This is not a substitute for professional help. If you or someone you know is in immediate danger,
            please contact emergency services or a crisis helpline.
          </p>
          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-sm text-warm-gray md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Mama & Papa. All rights reserved.</p>
            <a
              href="https://starlightcreativestudios.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-charcoal"
            >
              starlightcreativestudios.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
