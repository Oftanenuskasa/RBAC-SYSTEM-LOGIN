'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('User Dashboard loaded');
    
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
      
      if (payload.role !== 'USER') {
        console.log('Not a regular user, redirecting. Role:', payload.role);
        router.push('/');
        return;
      }
      console.log('User authenticated:', payload.name);
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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading User Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome! You have basic access.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
              {user.name} (User)
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 User Features</h3>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                View Profile
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Update Settings
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                View Tasks
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Submit Reports
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Track Progress
              </li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              View Profile
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 My Tasks</h3>
            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium">Complete monthly report</p>
                <p className="text-sm text-gray-500">Due: Today</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="font-medium">Update project documentation</p>
                <p className="text-sm text-gray-500">Due: Tomorrow</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium">Team meeting preparation</p>
                <p className="text-sm text-gray-500">Due: This week</p>
              </div>
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              View All Tasks
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">5</p>
                <p className="text-sm text-gray-600">Active Tasks</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">3</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
            <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
              View Reports
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Settings</h3>
            <p className="text-gray-600 mb-4">Manage your account preferences and notifications</p>
            <div className="space-y-4">
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200">
                Notification Settings
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200">
                Privacy & Security
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200">
                Account Preferences
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}