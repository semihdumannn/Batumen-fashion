import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { VerifyEmailContent } from './VerifyEmailContent';

export const metadata: Metadata = {
  title: 'E-postanızı Doğrulayın',
};

export default function VerifyEmailPage() {
  return (
    <Container className="py-16">
      <VerifyEmailContent />
    </Container>
  );
}
