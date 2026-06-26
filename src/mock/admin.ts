export type AdminStatus =
  | 'ACTIVE'
  | 'REQUESTED'
  | 'GENERATING'
  | 'READY'
  | 'FAILED'
  | 'SUCCESS'
  | 'PENDING'
  | 'SUSPENDED'
  | 'DRAFT'
  | 'VERIFIED'
  | 'REGISTERED'
  | 'EXPIRED'
  | 'DISMISSED'
  | 'REVIEWING';

export interface PipelineEvent {
  title: string;
  time: string;
  status: AdminStatus;
}

export interface RepositoryCategory {
  id: string;
  name: string;
  description: string;
  fields: number;
  status: AdminStatus;
}

export interface RepositoryPaper {
  id: string;
  title: string;
  authors: string;
  doi: string;
  journal: string;
  year: number;
  citations: number;
}

export interface UserDirectoryRow {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  status: AdminStatus;
}

export interface ActivityLog {
  type: 'ELEVATION' | 'LEDGER' | 'AUTH_FAIL' | 'UPDATE';
  time: string;
  title: string;
  ref: string;
}

export interface RevenueRow {
  invoiceId: string;
  transactionId: string;
  customer: string;
  plan: string;
  amount: string;
  method: string;
  paidAt: string;
  status: AdminStatus;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  status: AdminStatus;
}

export const pipelineHistory: PipelineEvent[] = [
  { title: 'OpenAlex Sync', time: '2 mins ago', status: 'SUCCESS' },
  { title: 'Manual Trigger', time: 'Just now', status: 'PENDING' },
  { title: 'Scheduled Crawl', time: '1 hour ago', status: 'FAILED' },
];

export const repositoryCategories: RepositoryCategory[] = [
  {
    id: 'KEY-001',
    name: 'Artificial Intelligence',
    description: 'AI-related papers including machine learning, neural networks and reasoning systems',
    fields: 128,
    status: 'ACTIVE',
  },
  {
    id: 'KEY-002',
    name: 'Federated Learning',
    description: 'Distributed model training without centralized data sharing',
    fields: 86,
    status: 'ACTIVE',
  },
  {
    id: 'KEY-003',
    name: 'Climate Modeling',
    description: 'Research related to climate simulation, forecasting and environmental analysis',
    fields: 54,
    status: 'ACTIVE',
  },
];

export const repositoryPapers: RepositoryPaper[] = [
  {
    id: 'AIS-W27491',
    title: 'Transformer Models for Scientific Trend Forecasting',
    authors: 'John Smith, Emily Carter, David Chen',
    doi: '10.1145/ais.2026.27491',
    journal: 'Journal of AI Systems',
    year: 2026,
    citations: 128,
  },
  {
    id: 'AIS-W19822',
    title: 'Federated Learning in Healthcare Data Networks',
    authors: 'Minh Tran, Sarah Ahmed, Robert Lang',
    doi: '10.1109/fed.2025.19822',
    journal: 'IEEE Access',
    year: 2025,
    citations: 342,
  },
  {
    id: 'AIS-W77120',
    title: 'Climate Modeling 2024: A Bibliometric Review',
    authors: 'Laura Green, Michael Brown',
    doi: '10.1016/clim.2024.77120',
    journal: 'Science Direct',
    year: 2024,
    citations: 76,
  },
  {
    id: 'AIS-W88401',
    title: 'Advanced Neural Networks for Citation Prediction',
    authors: 'Nguyen Hoang, Julianne Davies',
    doi: '10.1007/ann.2023.88401',
    journal: 'Springer AI Review',
    year: 2023,
    citations: 54,
  },
];

export const adminUsers: UserDirectoryRow[] = [
  {
    id: '#USR-8821',
    initials: 'JD',
    name: 'Dr. Julianne Davies',
    email: 'j.davies@ais-node.edu',
    role: 'Lecturer (Giảng viên)',
    status: 'ACTIVE',
  },
  {
    id: '#USR-6942',
    initials: 'MT',
    name: 'Minh Tran',
    email: 'm.tran@ais-node.edu',
    role: 'Researcher (Nhà nghiên cứu)',
    status: 'REGISTERED',
  },
  {
    id: '#USR-9102',
    initials: 'SA',
    name: 'Sarah Ahmed',
    email: 's.ahmed@ais-node.edu',
    role: 'Student (Sinh viên)',
    status: 'SUSPENDED',
  },
  {
    id: '#USR-9214',
    initials: 'RL',
    name: 'Robert Lang',
    email: 'r.lang@ais-node.edu',
    role: 'Admin Overseer',
    status: 'ACTIVE',
  },
];

export const activityLogs: ActivityLog[] = [
  {
    type: 'ELEVATION',
    time: '14:22:10 UTC',
    title: 'User #USR-8942 requested elevation to Researcher',
    ref: 'HASH: 462f4b1',
  },
  {
    type: 'LEDGER',
    time: '13:44:02 UTC',
    title: 'Periodic OpenAlex sync completed successfully',
    ref: 'BLOCK: 881203',
  },
  {
    type: 'AUTH_FAIL',
    time: '12:11:58 UTC',
    title: '3 failed login attempts on User #USR-1102',
    ref: 'IP: 192.x.x.x',
  },
  {
    type: 'UPDATE',
    time: '11:06:33 UTC',
    title: 'Dr. Julianne Davies updated profile metadata',
    ref: 'ID: v7.92',
  },
];

export const revenueRows: RevenueRow[] = [
  {
    invoiceId: '#INV-24001',
    transactionId: 'VNP-8FJ392KD',
    customer: 'Dr. Sarah Jenkins',
    plan: 'Premium Yearly',
    amount: '799.000₫',
    method: 'VNPAY',
    paidAt: '2026-06-12 09:24',
    status: 'SUCCESS',
  },
  {
    invoiceId: '#INV-24002',
    transactionId: 'QR-8HJD91',
    customer: 'Minh Tran',
    plan: 'Premium Monthly',
    amount: '99.000₫',
    method: 'VietQR',
    paidAt: '2026-06-13 12:45',
    status: 'SUCCESS',
  },
  {
    invoiceId: '#INV-24003',
    transactionId: 'VNP-23KD8',
    customer: 'j.doe@university.edu',
    plan: 'Premium Monthly',
    amount: '79.200₫',
    method: 'VNPAY',
    paidAt: '2026-06-14 18:04',
    status: 'PENDING',
  },
  {
    invoiceId: '#INV-24004',
    transactionId: 'QR-9AJD22',
    customer: 'r.smith@research.lab',
    plan: 'Premium Monthly',
    amount: '99.000₫',
    method: 'VietQR',
    paidAt: '2026-06-15 21:37',
    status: 'FAILED',
  },
];

export const revenueBars = [
  { month: 'Jan', amount: 34 },
  { month: 'Feb', amount: 46 },
  { month: 'Mar', amount: 42 },
  { month: 'Apr', amount: 58 },
  { month: 'May', amount: 64 },
  { month: 'Jun', amount: 76 },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'PLAN-FREE',
    name: 'Free',
    price: '0₫',
    duration: 'Unlimited',
    status: 'ACTIVE',
  },
  {
    id: 'PLAN-MONTHLY',
    name: 'Premium Monthly',
    price: '99.000₫',
    duration: '30 days',
    status: 'ACTIVE',
  },
  {
    id: 'PLAN-YEARLY',
    name: 'Premium Yearly',
    price: '799.000₫',
    duration: '365 days',
    status: 'ACTIVE',
  },
];
