import { useMemo, useState } from 'react';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminModal from '../../components/admin/AdminModal';
import AdminSectionCard from '../../components/admin/AdminSectionCard';
import AdminTable from '../../components/admin/AdminTable';
import AdminToast from '../../components/admin/AdminToast';
import {
  revenueBars as seedRevenueBars,
  revenueRows as seedRevenueRows,
  subscriptionPlans as seedPlans,
  type RevenueRow,
  type SubscriptionPlan,
} from '../../mock/admin';

const parseVnd = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatMillion = (value: number) => `${Math.round(value / 100000) / 10}M₫`;

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

  const totalRevenue = useMemo(
    () => rows.filter((row) => row.status === 'SUCCESS').reduce((sum, row) => sum + parseVnd(row.amount), 0),
    [rows],
  );

  const totalSubscriptions = rows.length;
  const monthlyRevenue = revenueBars[revenueBars.length - 1]?.amount ?? 0;
  const pendingPayments = rows.filter((row) => row.status === 'PENDING').length;
  const activePremium = 842;
  const renewalRate = 81;

  const exportFinanceReport = () => {
    const content = rows
      .map(
        (row) =>
          `${row.invoiceId},${row.transactionId},${row.customer},${row.plan},${row.amount},${row.method},${row.paidAt},${row.status}`,
      )
      .join('\n');

    const blob = new Blob(
      [`Invoice,Transaction ID,Customer,Plan,Amount,Method,Paid At,Status\n${content}`],
      { type: 'text/csv;charset=utf-8;' },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'finance-report.csv';
    anchor.click();

    URL.revokeObjectURL(url);
    setToast('Finance report exported.');
  };

  const refreshPayments = () => {
    const nextInvoice: RevenueRow = {
      invoiceId: `#INV-${Math.floor(Math.random() * 90000 + 10000)}`,
      transactionId: `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customer: 'new.researcher@university.edu',
      plan: 'Premium Monthly',
      amount: '99.000₫',
      method: 'VietQR',
      paidAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'PENDING',
    };

    setRows((current) => [nextInvoice, ...current]);
    setRevenueBars((current) =>
      current.map((item, index) =>
        index === current.length - 1 ? { ...item, amount: item.amount + 3 } : item,
      ),
    );

    setToast('Payments refreshed. New payment callback received as PENDING.');

    window.setTimeout(() => {
      setRows((current) =>
        current.map((row) =>
          row.invoiceId === nextInvoice.invoiceId ? { ...row, status: 'SUCCESS' } : row,
        ),
      );

      setToast(`${nextInvoice.invoiceId} confirmed by payment gateway.`);
    }, 1300);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanPrice(plan.price);
  };

  const savePlan = () => {
    if (!editingPlan) return;

    setPlans((current) =>
      current.map((plan) =>
        plan.id === editingPlan.id ? { ...plan, price: planPrice } : plan,
      ),
    );

    setEditingPlan(null);
    setToast(`${editingPlan.name} price updated.`);
  };

  return (
    <div className="space-y-5">
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Revenue & Subscription Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor subscription revenue, payment transactions and premium plan performance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportFinanceReport}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            ⇩ Export Finance Report
          </button>

          <button
            onClick={refreshPayments}
            className="rounded-md bg-[#4338ca] hover:bg-[#3730a3] px-4 py-2 text-xs font-bold text-white"
          >
            Refresh Payments
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <AdminMetricCard
          label="Total Revenue"
          value={formatMillion(totalRevenue)}
          helper="Confirmed successful payments"
          icon="₫"
          accent="green"
        />

        <AdminMetricCard
          label="Total Subscriptions"
          value={String(totalSubscriptions)}
          helper="All subscription transactions"
          icon="★"
          accent="orange"
        />

        <AdminMetricCard
          label="Monthly Revenue"
          value={`${monthlyRevenue}M₫`}
          helper="Revenue in current month"
          icon="✓"
          accent="blue"
        />

        <AdminMetricCard
          label="Pending Payments"
          value={String(pendingPayments)}
          helper="Awaiting payment confirmation"
          icon="!"
          accent="slate"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <AdminSectionCard title="Revenue Trend" subtitle="Gross successful payments by month">
          <div className="p-5">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold text-slate-950">
                  {revenueBars.reduce((sum, item) => sum + item.amount, 0)}M₫
                </p>
                <p className="text-xs font-semibold text-slate-500">Revenue in last 6 months</p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                +20% peak growth
              </span>
            </div>

            <div className="flex h-64 items-end gap-4 rounded-xl bg-slate-50 p-5">
              {revenueBars.map((item) => (
                <div key={item.month} className="group relative flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full max-w-[76px] rounded-t-xl bg-[#0b6fb8] transition hover:bg-[#062b4f]"
                    style={{ height: `${(item.amount / maxBar) * 210}px` }}
                  />

                  <div className="pointer-events-none absolute bottom-16 z-10 hidden rounded-lg bg-slate-950 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    <p className="font-bold">{item.month}</p>
                    <p>{item.amount}M₫ revenue</p>
                  </div>

                  <span className="text-xs font-bold text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-500">Monthly Revenue</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{monthlyRevenue}M₫</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-500">Active Premium</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-700">{activePremium}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-500">Renewal Rate</p>
                <p className="mt-1 text-lg font-extrabold text-[#0b6fb8]">{renewalRate}%</p>
              </div>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Plan Management" subtitle="Manage subscription plan pricing">
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
                  {plan.id === 'PLAN-FREE' ? (
                    <button
                      onClick={() => setToast('Free plan is always enabled.')}
                      className="rounded border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700"
                    >
                      View
                    </button>
                  ) : (
                    <button
                      onClick={() => openEditPlan(plan)}
                      className="rounded border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700"
                    >
                      Edit Price
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
              Edu accounts are receiving a configured 20% discount for premium checkout.
            </div>
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard
        title="Recent Payment Transactions"
        subtitle="Subscription plan purchases and gateway callbacks"
        action={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | RevenueRow['status'])}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        }
      >
        <AdminTable
          headers={['Invoice ID', 'Transaction ID', 'Customer', 'Plan', 'Amount', 'Method', 'Paid At', 'Status', 'Actions']}
        >
          {filteredRows.map((row) => (
            <tr key={row.invoiceId} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-slate-700">{row.invoiceId}</td>
              <td className="px-5 py-4 font-semibold text-slate-700">{row.transactionId}</td>
              <td className="px-5 py-4">{row.customer}</td>
              <td className="px-5 py-4 font-semibold text-slate-800">{row.plan}</td>
              <td className="px-5 py-4 font-bold text-slate-950">{row.amount}</td>
              <td className="px-5 py-4">{row.method}</td>
              <td className="px-5 py-4">{row.paidAt}</td>
              <td className="px-5 py-4"><AdminBadge status={row.status} /></td>
              <td className="px-5 py-4">
                <button onClick={() => setSelectedRow(row)} className="text-xs font-bold text-[#0b6fb8] hover:underline">
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminSectionCard>

      <AdminModal
        open={Boolean(selectedRow)}
        title="Transaction Detail"
        subtitle="Gateway callback and subscription payment metadata."
        onClose={() => setSelectedRow(null)}
      >
        {selectedRow && (
          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <p><span className="font-bold">Invoice:</span> {selectedRow.invoiceId}</p>
            <p><span className="font-bold">Transaction ID:</span> {selectedRow.transactionId}</p>
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
        subtitle="Update subscription plan pricing for premium checkout."
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
            <input
              value={planPrice}
              onChange={(event) => setPlanPrice(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b6fb8]"
            />
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminRevenuePage;
