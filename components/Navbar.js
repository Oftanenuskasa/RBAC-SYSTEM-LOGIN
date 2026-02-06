'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        // Invalid token
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-gray-900">
            RBAC System
          </Link>
          
          {user && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
