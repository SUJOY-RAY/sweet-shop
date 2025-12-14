'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userRaw);

    if (user.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/user');
    }
  }, [router]);

  return <p className="text-center mt-10">Redirecting...</p>;
}
