
export type TransactionType = 'income' | 'expense';

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  desc: string;
  amount: number;
  category: string;
  attachments: Attachment[];
}

export interface User {
  name: string;
  role: 'admin' | 'resident';
  unit?: string;
  email?: string;
  phone?: string;
}

export interface Resident {
  id: number;
  name: string;
  unit: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface VacationNotice {
  id: number;
  unit: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

export interface BudgetProposal {
  id: number;
  title: string;
  description: string;
  value: number;
  provider: string;
  status: 'open' | 'approved' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  deadline: string;
}

export interface ImprovementIdea {
  id: number;
  title: string;
  description: string;
  authorUnit: string;
  votes: {
    low: number;    // Melhoria Futura
    medium: number; // Ideia para o Momento
    high: number;   // Urgente
  };
  createdAt: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  date: string;
  author: string;
}

export interface Incident {
  id: number;
  unit: string;
  title: string;
  description: string;
  category: 'barulho' | 'manutencao' | 'limpeza' | 'seguranca' | 'outro';
  status: 'open' | 'in_progress' | 'resolved';
  response?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PackageDelivery {
  id: number;
  unit: string;
  recipient: string;
  carrier: string; // Mercado Livre, Correios, Amazon, etc.
  trackingCode?: string;
  receivedDate: string;
  pickedUpDate?: string;
  status: 'waiting' | 'delivered';
}

export interface CondoSettings {
  name: string;
  pixKey: string;
  pixType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  monthlyQuota: number;
  fundAmount: number;
  quotaDueDay: number;
  fundDueDay: number;
}
