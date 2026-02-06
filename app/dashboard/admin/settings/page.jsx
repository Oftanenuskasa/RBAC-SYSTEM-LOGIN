'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: 'RBAC System',
    maintenanceMode: false,
    userRegistration: true,
    defaultUserRole: 'USER',
    sessionTimeout: 24, // hours
    emailNotifications: true,
    auditLogging: true,
  });
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, action: 'System Settings Loaded', user: 'System', timestamp: new Date().toISOString() },
    { id: 2, action: 'User Admin logged in', user: 'Admin User', timestamp: new Date().toISOString() },
    { id: 3, action: 'User Manager created', user: 'Admin User', timestamp: new Date().toISOString() },
  ]);

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
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    setSaving(true);
    
    // Save to localStorage
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    // Add to audit log
    const newLog = {
      id: logs.length + 1,
      action: 'System settings updated',
      user: user?.name || 'Admin',
      timestamp: new Date().toISOString()
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 9)]);
    
    setTimeout(() => {
      setSaving(false);
      alert('✅ Settings saved successfully!');
    }, 500);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        siteName: 'RBAC System',
        maintenanceMode: false,
        userRegistration: true,
        defaultUserRole: 'USER',
        sessionTimeout: 24,
        emailNotifications: true,
        auditLogging: true,
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('systemSettings');
      alert('✅ Settings reset to default!');
    }
  };

  const clearLogs = () => {
    if (confirm('Clear all audit logs?')) {
      setLogs([]);
    }
  };

  const toggleMaintenanceMode = () => {
    const newMode = !settings.maintenanceMode;
    handleSettingChange('maintenanceMode', newMode);
    
    const newLog = {
      id: logs.length + 1,
      action: `Maintenance mode ${newMode ? 'enabled' : 'disabled'}`,
      user: user?.name || 'Admin',
      timestamp: new Date().toISOString()
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 9)]);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system_settings_backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading System Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="text-green-600 hover:text-green-800 mb-4 flex items-center"
            >
              ← Back to Admin Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              {user?.name} (Admin)
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* General Settings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">⚙️ General Settings</h2>
              
              <div className="space-y-6">
                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter site name"
                  />
                </div>

                {/* User Registration */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Allow User Registration
                    </label>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.userRegistration}
                      onChange={(e) => handleSettingChange('userRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {/* Default User Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default User Role
                  </label>
                  <select
                    value={settings.defaultUserRole}
                    onChange={(e) => handleSettingChange('defaultUserRole', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="USER">User</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Session Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">Users will be logged out after this time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">🚀 Quick Actions</h2>
              
              <div className="space-y-4">
                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Take system offline</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={toggleMaintenanceMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send email alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {/* Audit Logging */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Audit Logging</p>
                    <p className="text-sm text-gray-500">Track system activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auditLogging}
                      onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : '💾 Save All Settings'}
              </button>
              
              <button
                onClick={exportSettings}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                📥 Export Settings
              </button>
              
              <button
                onClick={resetSettings}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                🔄 Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📋 Audit Logs</h2>
              <p className="text-gray-600 text-sm">System activity records</p>
            </div>
            <button
              onClick={clearLogs}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear All Logs
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{log.action}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.user}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Current Status</p>
            <p className="text-lg font-bold text-blue-700 mt-1">
              {settings.maintenanceMode ? '🛑 Maintenance Mode' : '✅ Active'}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">User Registration</p>
            <p className="text-lg font-bold text-green-700 mt-1">
              {settings.userRegistration ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900">Default Role</p>
            <p className="text-lg font-bold text-purple-700 mt-1">{settings.defaultUserRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
