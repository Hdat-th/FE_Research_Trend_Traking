import { useState } from 'react';
import AdminSectionCard from '../../components/admin/AdminSectionCard';
import AdminToast from '../../components/admin/AdminToast';

const AdminSettingsPage = () => {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Settings</h1>
        <p className="mt-1 text-xs text-gray-500">
          Configure system information, OpenAlex integration, notifications and security.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSectionCard title="General Settings" subtitle="Basic system information.">
          <div className="space-y-4 p-5">
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="AIS Journal Trend System" />
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="FPT University" />
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="GMT+7">
              <option>GMT+7</option>
              <option>UTC</option>
            </select>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="OpenAlex Integration" subtitle="External academic data source configuration.">
          <div className="space-y-4 p-5">
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="********************" />
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="Daily">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Manual</option>
            </select>
            <button
              onClick={() => setToast('OpenAlex settings saved.')}
              className="rounded-md bg-indigo-700 hover:bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
            >
              Save OpenAlex Config
            </button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Notification Settings" subtitle="Choose events that notify admins.">
          <div className="space-y-4 p-5">
            {['Notify when sync failed', 'Notify when new user registered', 'Notify when payment success'].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3 text-sm font-semibold">
                <span>{item}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Security Settings" subtitle="Control admin session and authentication behavior.">
          <div className="space-y-4 p-5">
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" defaultValue="60 minutes">
              <option>30 minutes</option>
              <option>60 minutes</option>
              <option>120 minutes</option>
            </select>

            <label className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3 text-sm font-semibold">
              <span>Require 2FA for admin</span>
              <input type="checkbox" className="h-4 w-4" />
            </label>

            <button
              onClick={() => setToast('Security settings saved.')}
              className="rounded-md bg-indigo-700 hover:bg-indigo-800 px-4 py-2 text-xs font-bold text-white"
            >
              Save Security Config
            </button>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
