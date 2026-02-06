'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Manager Dashboard loaded');
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    console.log('Token found:', !!token);

    if (!token) {
      console.log('No token, redirecting to login');
      router.push('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('User role from token:', payload.role);
      
      if (payload.role !== 'MANAGER') {
        console.log('Not a manager, redirecting. Role:', payload.role);
        router.push('/');
        return;
      }
      console.log('Manager user authenticated:', payload.name);
      setUser(payload);
    } catch (error) {
      console.log('Token error:', error);
      router.push('/');
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-1">Team management and project oversight</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              {user.name} (Manager)
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Team Management</h3>
            <p className="text-gray-600 mb-4">Manage your team members</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              View Team
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Project Management</h3>
            <p className="text-gray-600 mb-4">Oversee projects and tasks</p>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Projects
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Performance Reports</h3>
            <p className="text-gray-600 mb-4">View team performance reports</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
              Reports
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
