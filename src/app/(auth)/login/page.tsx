import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Giriş Yap',
};

export default function LoginPage() {
  return (
    <Container className="py-16">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-tight">GİRİŞ YAP</h1>
        <LoginForm />
        <p className="text-sm text-center text-gray-500 mt-6">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-black font-medium hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </Container>
  );
}
