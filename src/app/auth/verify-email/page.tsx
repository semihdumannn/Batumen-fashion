import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { EmailVerificationHandler } from './EmailVerificationHandler';

export const metadata: Metadata = {
  title: 'E-posta Doğrulanıyor',
};

export default function AuthVerifyEmailPage() {
  return (
    <Container className="py-16">
      <EmailVerificationHandler />
    </Container>
  );
}
