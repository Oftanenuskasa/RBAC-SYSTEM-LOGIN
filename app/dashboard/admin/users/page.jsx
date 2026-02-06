'use client';

import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Admin Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">👥 User Management</h1>
          <p className="text-gray-600 mb-6">Manage all users in the system</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">Functionality</p>
              <p className="text-lg font-bold text-blue-700 mt-1">Add Users</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900">Functionality</p>
              <p className="text-lg font-bold text-green-700 mt-1">Edit Users</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900">Functionality</p>
              <p className="text-lg font-bold text-red-700 mt-1">Delete Users</p>
            </div>
          </div>
          
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-500">User management functionality will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
