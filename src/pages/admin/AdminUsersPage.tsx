import { useMemo, useState } from 'react';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminModal from '../../components/admin/AdminModal';
import AdminSectionCard from '../../components/admin/AdminSectionCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminToast from '../../components/admin/AdminToast';
import { activityLogs as seedActivityLogs, adminUsers as seedAdminUsers, type ActivityLog, type UserDirectoryRow } from '../../mock/admin';

const roleOptions = ['Admin Overseer', 'Researcher (Nhà nghiên cứu)', 'Lecturer (Giảng viên)', 'Student (Sinh viên)', 'Regular User'];

const logTone = {
  ELEVATION: 'border-blue-400 bg-blue-50 text-blue-700',
  LEDGER: 'border-slate-300 bg-slate-50 text-slate-700',
  AUTH_FAIL: 'border-red-400 bg-red-50 text-red-700',
  UPDATE: 'border-sky-400 bg-sky-50 text-sky-700',
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserDirectoryRow[]>(seedAdminUsers);
  const [logs, setLogs] = useState<ActivityLog[]>(seedActivityLogs);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDirectoryRow | null>(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState(roleOptions[3]);
  const [toast, setToast] = useState<string | null>(null);

  const filteredUsers = useMemo(() => users.filter((user) => `${user.id} ${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase())), [query, users]);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length;
  const pendingUsers = users.filter((user) => user.status === 'REGISTERED').length;

  const addLog = (log: ActivityLog) => {
    setLogs((current) => [log, ...current].slice(0, 6));
  };

  const changeRole = (userId: string, role: string) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
    addLog({ type: 'UPDATE', time: 'Just now', title: `${userId} role updated to ${role}`, ref: 'RBAC: local-state' });
    setToast(`${userId} role updated.`);
  };

  const toggleUserStatus = (user: UserDirectoryRow) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)));
    addLog({ type: nextStatus === 'SUSPENDED' ? 'AUTH_FAIL' : 'UPDATE', time: 'Just now', title: `${user.id} changed to ${nextStatus}`, ref: 'ADMIN_ACTION' });
    setToast(`${user.name} is now ${nextStatus}.`);
  };

  const approveResearcher = (user: UserDirectoryRow) => {
    setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, role: 'Researcher (Nhà nghiên cứu)', status: 'ACTIVE' } : item)));
    addLog({ type: 'ELEVATION', time: 'Just now', title: `${user.id} approved as Researcher`, ref: 'APPROVED' });
    setToast(`${user.name} approved as Researcher.`);
  };

  const denyResearcher = (user: UserDirectoryRow) => {
    setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, status: 'SUSPENDED' } : item)));
    addLog({ type: 'AUTH_FAIL', time: 'Just now', title: `${user.id} role request denied`, ref: 'DENIED' });
    setToast(`${user.name} request denied.`);
  };

  const provisionUser = () => {
    if (!newUserName.trim() || !newUserEmail.includes('@')) {
      setToast('Please enter a valid full name and email.');
      return;
    }

    const initials = newUserName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const nextUser: UserDirectoryRow = {
      id: `#USR-${Math.floor(Math.random() * 9000 + 1000)}`,
      initials,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'REGISTERED',
    };

    setUsers((current) => [nextUser, ...current]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole(roleOptions[3]);
    setShowProvisionModal(false);
    addLog({ type: 'UPDATE', time: 'Just now', title: `${nextUser.id} provisioned by admin`, ref: 'PROVISION' });
    setToast(`${nextUser.name} has been provisioned.`);
  };

  const downloadComplianceReport = () => {
    const content = `Total Users,Active Users,Pending Role Requests\n${users.length},${activeUsers},${pendingUsers}`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'compliance-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('Compliance report downloaded.');
  };

  return (
    <div className="space-y-5">
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">User Directory Governance</h1>
        <p className="mt-1 text-xs text-slate-500">Manage institution access, audit role transitions, and oversee global RBAC alignment across academic departments.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminMetricCard label="Total Active Users" value={String(activeUsers)} helper="Local demo active accounts" icon="♙" accent="blue" />
        <AdminMetricCard label="Role Requests Pending" value={String(pendingUsers)} helper="Registered users awaiting review" icon="▣" accent="orange" />
        <AdminMetricCard label="System Integrity Score" value="99.98%" helper="Status: High Resilience" icon="🛡" accent="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_285px]">
        <div className="space-y-5">
          <AdminSectionCard
            title="Access Control List"
            action={
              <div className="flex items-center gap-3">
                <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search user..." className="rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#0b6fb8]" />
                <button onClick={() => setShowProvisionModal(true)} className="rounded-md bg-[#0b6fb8] px-4 py-2 text-xs font-bold text-white">+ Provision User</button>
              </div>
            }
          >
            <AdminTable headers={['User ID', 'Entity Full Name', 'Registered Email Node', 'Role Authorization', 'Status', 'Actions']}>
              {visibleUsers.map((directoryUser) => (
                <tr key={directoryUser.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-700">{directoryUser.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{directoryUser.initials}</span>
                      <span className="font-bold text-slate-900">{directoryUser.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{directoryUser.email}</td>
                  <td className="px-5 py-4">
                    <select value={directoryUser.role} onChange={(event) => changeRole(directoryUser.id, event.target.value)} className="rounded border border-slate-200 bg-white px-2 py-1 text-xs">
                      {roleOptions.map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4"><AdminBadge status={directoryUser.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <button onClick={() => setSelectedUser(directoryUser)} className="text-[#0b6fb8] hover:underline">View</button>
                      <button onClick={() => toggleUserStatus(directoryUser)} className="text-orange-700 hover:underline">{directoryUser.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</button>
                      {directoryUser.status === 'REGISTERED' && <button onClick={() => approveResearcher(directoryUser)} className="text-emerald-700 hover:underline">Approve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>Displaying {visibleUsers.length} of {filteredUsers.length} user entries</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-7 w-7 rounded border text-xs font-bold ${pageNumber === page ? 'bg-[#062b4f] text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{pageNumber}</button>
                ))}
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Compliance Status">
            <div className="p-5">
              <p className="text-sm text-slate-600">The current RBAC configuration matches the institutional policy 2024-B. No unauthorized role elevations detected in the last 24 hours.</p>
              <button onClick={downloadComplianceReport} className="mt-3 text-xs font-bold text-[#0b6fb8]">Download Compliance Report →</button>
            </div>
          </AdminSectionCard>
        </div>

        <AdminSectionCard title="System Activity Logs" action={<button onClick={() => setToast('Audit trail refreshed.')} className="text-sm text-slate-500">↻</button>}>
          <div className="space-y-3 p-4">
            {logs.map((log, index) => (
              <div key={`${log.type}-${log.time}-${index}`} className={`rounded border-l-4 p-3 ${logTone[log.type]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-extrabold">{log.type}</span>
                  <span className="text-[10px] text-slate-500">{log.time}</span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-800">{log.title}</p>
                <p className="mt-2 text-[10px] text-slate-500">{log.ref}</p>
              </div>
            ))}
            <button onClick={() => setToast('Global audit trail opened in demo mode.')} className="w-full rounded border border-[#0b6fb8] py-2 text-xs font-bold text-[#0b6fb8] hover:bg-blue-50">View Global Audit Trail</button>
          </div>
        </AdminSectionCard>
      </div>

      <AdminModal
        open={showProvisionModal}
        title="Provision User"
        subtitle="Create a pending user account for admin review."
        onClose={() => setShowProvisionModal(false)}
        footer={
          <>
            <button onClick={() => setShowProvisionModal(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
            <button onClick={provisionUser} className="rounded-md bg-[#062b4f] px-4 py-2 text-xs font-bold text-white">Create User</button>
          </>
        }
      >
        <div className="space-y-4">
          <input value={newUserName} onChange={(event) => setNewUserName(event.target.value)} placeholder="Full name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b6fb8]" />
          <input value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} placeholder="Email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b6fb8]" />
          <select value={newUserRole} onChange={(event) => setNewUserRole(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b6fb8]">
            {roleOptions.map((role) => <option key={role}>{role}</option>)}
          </select>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(selectedUser)}
        title="User Detail"
        subtitle="Role, status and access information."
        onClose={() => setSelectedUser(null)}
        footer={selectedUser ? <button onClick={() => denyResearcher(selectedUser)} className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">Deny Request</button> : undefined}
      >
        {selectedUser && (
          <div className="space-y-3 text-sm text-slate-700">
            <p><span className="font-bold">User ID:</span> {selectedUser.id}</p>
            <p><span className="font-bold">Name:</span> {selectedUser.name}</p>
            <p><span className="font-bold">Email:</span> {selectedUser.email}</p>
            <p><span className="font-bold">Role:</span> {selectedUser.role}</p>
            <p><span className="font-bold">Status:</span> <AdminBadge status={selectedUser.status} /></p>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminUsersPage;
