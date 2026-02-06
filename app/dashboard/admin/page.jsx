'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      router.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setUser(payload);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Full system access and control</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
              {user.name} (Admin)
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 User Management</h3>
            <p className="text-gray-600 mb-4">Manage all users in the system</p>
            <button 
              onClick={() => router.push('/dashboard/admin/users')}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Manage Users
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system-wide settings</p>
            <button 
              onClick={() => router.push('/dashboard/admin/settings')}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Configure
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Reports & Analytics</h3>
            <p className="text-gray-600 mb-4">View system reports and analytics</p>
            <button 
              onClick={() => router.push('/dashboard/admin/reports')}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              View Reports
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
