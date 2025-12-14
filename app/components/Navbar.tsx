'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/60 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-pink-700">Sweet Treats</Link>

          <div className="hidden md:flex gap-4">
            <Link href="/" className="hover:text-pink-600">Home</Link>
            <Link href="/dashboard" className="hover:text-pink-600">Dashboard</Link>
            <Link href="/login" className="hover:text-pink-600">Login</Link>
            <Link href="/register" className="hover:text-pink-600">Register</Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 px-4 pt-2 pb-4">
          <Link href="/" className="block py-2">Home</Link>
          <Link href="/dashboard" className="block py-2">Dashboard</Link>
          <Link href="/login" className="block py-2">Login</Link>
          <Link href="/register" className="block py-2">Register</Link>
        </div>
      )}
    </nav>
  );
}
