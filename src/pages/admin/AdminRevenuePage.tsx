import { useMemo, useState } from 'react';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminModal from '../../components/admin/AdminModal';
import AdminSectionCard from '../../components/admin/AdminSectionCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminToast from '../../components/admin/AdminToast';
import { revenueBars as seedRevenueBars, revenueRows as seedRevenueRows, subscriptionPlans as seedPlans, type RevenueRow, type SubscriptionPlan } from '../../mock/admin';

const parseVnd = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const AdminRevenuePage = () => {
  const [revenueBars, setRevenueBars] = useState(seedRevenueBars);
  const [rows, setRows] = useState<RevenueRow[]>(seedRevenueRows);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(seedPlans);
  const [statusFilter, setStatusFilter] = useState<'ALL' | RevenueRow['status']>('ALL');
  const [selectedRow, setSelectedRow] = useState<RevenueRow | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planPrice, setPlanPrice] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const maxBar = Math.max(...revenueBars.map((item) => item.amount));
  const filteredRows = statusFilter === 'ALL' ? rows : rows.filter((row) => row.status === statusFilter);

  const successfulRevenue = useMemo(() => rows.filter((row) => row.status === 'SUCCESS').reduce((sum, row) => sum + parseVnd(row.amount), 0), [rows]);
  const successCount = rows.filter((row) => row.status === 'SUCCESS').length;
  const failedRate = rows.length ? Math.round((rows.filter((row) => row.status === 'FAILED').length / rows.length) * 1000) / 10 : 0;

  const exportFinanceReport = () => {
    const content = rows.map((row) => `${row.invoiceId},${row.customer},${row.plan},${row.amount},${row.method},${row.paidAt},${row.status}`).join('\n');
    const blob = new Blob([`Invoice,Customer,Plan,Amount,Method,Paid At,Status\n${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'finance-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('Finance report exported.');
  };

  const refreshLedger = () => {
    const nextInvoice: RevenueRow = {
      invoiceId: `#INV-${Math.floor(Math.random() * 90000 + 10000)}`,
      customer: 'new.researcher@university.edu',
      plan: 'Premium Monthly',
      amount: '99.000₫',
      method: 'VietQR',
      paidAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'PENDING',
    };
    setRows((current) => [nextInvoice, ...current]);
    setRevenueBars((current) => current.map((item, index) => (index === current.length - 1 ? { ...item, amount: item.amount + 3 } : item)));
    setToast('Ledger refreshed. New payment callback received as PENDING.');

    window.setTimeout(() => {
      setRows((current) => current.map((row) => (row.invoiceId === nextInvoice.invoiceId ? { ...row, status: 'SUCCESS' } : row)));
      setToast(`${nextInvoice.invoiceId} confirmed by payment gateway.`);
    }, 1300);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanPrice(plan.price);
  };

  const savePlan = () => {
    if (!editingPlan) return;
    setPlans((current) => current.map((plan) => (plan.id === editingPlan.id ? { ...plan, price: planPrice } : plan)));
    setEditingPlan(null);
    setToast(`${editingPlan.name} price updated.`);
  };

  const togglePlan = (plan: SubscriptionPlan) => {
    setPlans((current) => current.map((item) => (item.id === plan.id ? { ...item, status: item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : item)));
    setToast(`${plan.name} is now ${plan.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}.`);
  };

  return (
    <div className="space-y-5">
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Revenue Management Dashboard</h1>
          <p className="mt-1 text-xs text-slate-500">Subscription revenue, payment transaction health and premium conversion monitoring.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportFinanceReport} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">⇩ Export Finance Report</button>
          <button onClick={refreshLedger} className="rounded-md bg-[#062b4f] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b3d6f]">Refresh Ledger</button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <AdminMetricCard label="Successful Revenue" value={`${Math.round(successfulRevenue / 100000) / 10}M₫`} helper="Confirmed gateway payments" icon="₫" accent="green" />
        <AdminMetricCard label="Successful Transactions" value={String(successCount)} helper="VNPAY + VietQR success" icon="✓" accent="blue" />
        <AdminMetricCard label="Premium Subscribers" value="842" helper="76 yearly · 766 monthly" icon="★" accent="orange" />
        <AdminMetricCard label="Failed Payment Rate" value={`${failedRate}%`} helper="Calculated from visible ledger" icon="!" accent="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <AdminSectionCard title="Revenue Trend" subtitle="Gross successful payments by month">
          <div className="p-5">
            <div className="flex h-72 items-end gap-4 rounded-lg bg-slate-50 p-5">
              {revenueBars.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end rounded bg-white px-2">
                    <button
                      onClick={() => setToast(`${item.month} revenue: ${item.amount}M₫`)}
                      className="w-full rounded-t-md bg-[#0b6fb8] shadow-sm transition-all hover:bg-[#062b4f]"
                      style={{ height: `${(item.amount / maxBar) * 100}%` }}
                      title={`${item.month}: ${item.amount}M₫`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">ARPU</p><p className="mt-1 text-lg font-extrabold text-slate-950">96.400₫</p></div>
              <div className="rounded-md border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Conversion</p><p className="mt-1 text-lg font-extrabold text-emerald-700">12.8%</p></div>
              <div className="rounded-md border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Refunds</p><p className="mt-1 text-lg font-extrabold text-red-600">4</p></div>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Plan Management" subtitle="Subscription plans from local demo state">
          <div className="space-y-3 p-5">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{plan.price} · {plan.duration}</p>
                  </div>
                  <AdminBadge status={plan.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEditPlan(plan)} className="rounded border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">Edit</button>
                  <button onClick={() => togglePlan(plan)} className="rounded border border-orange-200 px-3 py-1 text-xs font-bold text-orange-700">{plan.status === 'ACTIVE' ? 'Disable' : 'Enable'}</button>
                </div>
              </div>
            ))}
            <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">Edu accounts are receiving a configured 20% discount for premium checkout.</div>
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard
        title="Recent Payment Transactions"
        subtitle="Subscription plan purchases and gateway callbacks"
        action={
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'ALL' | RevenueRow['status'])} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        }
      >
        <AdminTable headers={['Invoice ID', 'Customer', 'Plan', 'Amount', 'Method', 'Paid At', 'Status', 'Actions']}>
          {filteredRows.map((row) => (
            <tr key={row.invoiceId} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-slate-700">{row.invoiceId}</td>
              <td className="px-5 py-4">{row.customer}</td>
              <td className="px-5 py-4 font-semibold text-slate-800">{row.plan}</td>
              <td className="px-5 py-4 font-bold text-slate-950">{row.amount}</td>
              <td className="px-5 py-4">{row.method}</td>
              <td className="px-5 py-4">{row.paidAt}</td>
              <td className="px-5 py-4"><AdminBadge status={row.status} /></td>
              <td className="px-5 py-4"><button onClick={() => setSelectedRow(row)} className="text-xs font-bold text-[#0b6fb8] hover:underline">Detail</button></td>
            </tr>
          ))}
        </AdminTable>
      </AdminSectionCard>

      <AdminModal open={Boolean(selectedRow)} title="Transaction Detail" subtitle="Gateway callback and subscription payment metadata." onClose={() => setSelectedRow(null)}>
        {selectedRow && (
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p><span className="font-bold">Invoice:</span> {selectedRow.invoiceId}</p>
            <p><span className="font-bold">Customer:</span> {selectedRow.customer}</p>
            <p><span className="font-bold">Plan:</span> {selectedRow.plan}</p>
            <p><span className="font-bold">Amount:</span> {selectedRow.amount}</p>
            <p><span className="font-bold">Method:</span> {selectedRow.method}</p>
            <p><span className="font-bold">Paid At:</span> {selectedRow.paidAt}</p>
            <p className="sm:col-span-2"><span className="font-bold">Status:</span> <AdminBadge status={selectedRow.status} /></p>
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={Boolean(editingPlan)}
        title="Edit Subscription Plan"
        subtitle="This updates local frontend state for demo interaction."
        onClose={() => setEditingPlan(null)}
        footer={
          <>
            <button onClick={() => setEditingPlan(null)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
            <button onClick={savePlan} className="rounded-md bg-[#062b4f] px-4 py-2 text-xs font-bold text-white">Save Plan</button>
          </>
        }
      >
        {editingPlan && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-800">{editingPlan.name}</p>
            <input value={planPrice} onChange={(event) => setPlanPrice(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b6fb8]" />
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminRevenuePage;
