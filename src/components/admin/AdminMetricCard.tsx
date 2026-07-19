interface AdminMetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: string;
  accent?: 'blue' | 'green' | 'orange' | 'slate';
}

const accentMap = {
  blue: 'bg-indigo-50 text-indigo-700',
  green: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  slate: 'bg-gray-100 text-gray-700',
};

const AdminMetricCard = ({ label, value, helper, icon, accent = 'blue' }: AdminMetricCardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg ${accentMap[accent]}`}>
          {icon}
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">● LIVE</span>
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    </div>
  );
};

export default AdminMetricCard;
