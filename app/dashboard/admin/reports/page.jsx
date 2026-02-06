'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  // Your existing auth and fetch functions remain the same
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];

        if (!token) {
          router.push('/');
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'ADMIN') {
          router.push('/');
          return;
        }

        setUser(payload);
        await fetchUsers();
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Your existing fetchUsers function
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        console.log('Loaded', data.users?.length || 0, 'users from database');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Your existing export functions remain EXACTLY THE SAME
  const exportToCSV = () => {
    try {
      setExporting(true);
      
      if (users.length === 0) {
        alert('No users to export');
        setExporting(false);
        return;
      }

      // Prepare CSV content
      const headers = ['ID', 'Name', 'Email', 'Role', 'Created At', 'Updated At'];
      
      const csvRows = users.map(user => {
        return [
          `"${user.id || ''}"`,
          `"${(user.name || '').replace(/"/g, '""')}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${user.createdAt ? new Date(user.createdAt).toISOString() : ''}"`,
          `"${user.updatedAt ? new Date(user.updatedAt).toISOString() : ''}"`
        ].join(',');
      });

      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `users_export_${timestamp}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${users.length} users to CSV!`);
      setExporting(false);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('❌ Failed to export CSV: ' + error.message);
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    try {
      setExporting(true);
      
      if (users.length === 0) {
        alert('No users to export');
        setExporting(false);
        return;
      }

      // For Excel format (CSV with .xls extension)
      const headers = ['ID', 'Name', 'Email', 'Role', 'Created Date', 'Created Time', 'Updated Date', 'Updated Time'];
      
      const csvRows = users.map(user => {
        const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
        const updatedDate = user.updatedAt ? new Date(user.updatedAt) : null;
        
        return [
          `"${user.id || ''}"`,
          `"${(user.name || '').replace(/"/g, '""')}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${createdDate.toLocaleDateString('en-US')}"`,
          `"${createdDate.toLocaleTimeString('en-US')}"`,
          updatedDate ? `"${updatedDate.toLocaleDateString('en-US')}"` : '""',
          updatedDate ? `"${updatedDate.toLocaleTimeString('en-US')}"` : '""'
        ].join(',');
      });

      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      // Create and download Excel file (CSV with .xls extension)
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.download = `users_export_${timestamp}.xls`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${users.length} users to Excel!`);
      setExporting(false);
      
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('❌ Failed to export Excel: ' + error.message);
      setExporting(false);
    }
  };

  // React Table configuration - NEW
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-gray-600">
                {row.original.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500">ID: {row.original.id?.substring(0, 8)}...</div>
            </div>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.original.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
            row.original.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {row.original.role}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-gray-900">
              {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : ''}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.createdAt ? new Date(row.original.createdAt).toLocaleTimeString() : ''}
            </div>
          </div>
        ),
        enableSorting: true,
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Loading state remains the same
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header remains EXACTLY the same */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="text-purple-600 hover:text-purple-800 mb-4 flex items-center"
            >
              ← Back to Admin Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Export PostgreSQL users to CSV or Excel</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
              {user?.name} (Admin)
            </div>
          </div>
        </div>

        {/* Export Options remain EXACTLY the same */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Users from PostgreSQL</h2>
          <p className="text-gray-600 mb-6">Found {users.length} users in database</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <span className="text-green-600 text-xl">📄</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">CSV Export</h3>
                  <p className="text-sm text-gray-600">Comma-separated values</p>
                </div>
              </div>
              <button
                onClick={exportToCSV}
                disabled={exporting || users.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : `Export CSV (${users.length} users)`}
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Excel Export</h3>
                  <p className="text-sm text-gray-600">Microsoft Excel format</p>
                </div>
              </div>
              <button
                onClick={exportToExcel}
                disabled={exporting || users.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : `Export Excel (${users.length} users)`}
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={fetchUsers}
              className="text-purple-600 hover:text-purple-800"
            >
              ↻ Refresh User Data
            </button>
          </div>
        </div>

        {/* Users Preview with React Table - UPDATED SECTION */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Users Preview ({users.length} total)</h2>
                <p className="text-gray-600 text-sm">Data from PostgreSQL that will be exported</p>
              </div>
              
              {/* Search and Controls */}
              <div className="mt-4 md:mt-0 space-y-3 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    ←
                  </button>
                  <span className="flex items-center text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* React Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty state */}
            {table.getRowModel().rows.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="text-purple-600 hover:text-purple-800 text-sm mt-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer with pagination controls */}
          {table.getRowModel().rows.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600 mb-4 md:mb-0">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  users.length
                )} of {users.length} users
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Last
                </button>
                
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded"
                >
                  {[5, 10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}