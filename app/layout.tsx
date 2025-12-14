import './globals.css';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Sweet Treats',
  description: 'Delicious sweets delivered to your door',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
