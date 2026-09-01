import { supabase } from './supabase';
import { 
  Transaction, 
  Resident, 
  VacationNotice, 
  BudgetProposal, 
  ImprovementIdea,
  Notice,
  Incident,
  PackageDelivery,
  CondoSettings
} from '../types';

// Seed data para inicialização garantida e demonstração instantânea (com histórico completo de 2025 e 2026)
const INITIAL_TRANSACTIONS: Transaction[] = [
  // 2026 - Março
  { id: 1, date: '2026-03-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Março/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 2, date: '2026-03-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Março/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 3, date: '2026-03-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Março/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 4, date: '2026-03-02', type: 'income', desc: 'Fundo de Reserva - Rateio 03 Casas (Março/2026)', amount: 150.00, category: 'Fundo de Reserva', attachments: [] },
  { id: 5, date: '2026-03-05', type: 'expense', desc: 'Conta de Energia Elétrica (Áreas Comuns/Portão)', amount: 185.40, category: 'Contas Fixas', attachments: [] },
  { id: 6, date: '2026-03-08', type: 'expense', desc: 'Conta de Água e Esgoto (Corsan/Sabesp)', amount: 320.60, category: 'Contas Fixas', attachments: [] },
  { id: 7, date: '2026-03-12', type: 'expense', desc: 'Manutenção Preventiva Portão Eletrônico e Interfone', amount: 280.00, category: 'Manutenção', attachments: [] },
  { id: 8, date: '2026-03-15', type: 'expense', desc: 'Produtos de Limpeza e Jardinagem', amount: 95.50, category: 'Serviços', attachments: [] },

  // 2026 - Fevereiro
  { id: 9, date: '2026-02-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Fevereiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 10, date: '2026-02-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Fevereiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 11, date: '2026-02-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Fevereiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 12, date: '2026-02-02', type: 'income', desc: 'Fundo de Reserva - Rateio 03 Casas (Fevereiro/2026)', amount: 150.00, category: 'Fundo de Reserva', attachments: [] },
  { id: 13, date: '2026-02-05', type: 'expense', desc: 'Conta de Energia Elétrica', amount: 178.90, category: 'Contas Fixas', attachments: [] },
  { id: 14, date: '2026-02-08', type: 'expense', desc: 'Conta de Água e Saneamento', amount: 295.40, category: 'Contas Fixas', attachments: [] },
  { id: 15, date: '2026-02-10', type: 'expense', desc: 'Serviço de Roçagem e Paisagismo', amount: 200.00, category: 'Manutenção', attachments: [] },

  // 2026 - Janeiro
  { id: 16, date: '2026-01-02', type: 'income', desc: 'Cota Condominial - Casa 101 (Janeiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 17, date: '2026-01-02', type: 'income', desc: 'Cota Condominial - Casa 102 (Janeiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 18, date: '2026-01-02', type: 'income', desc: 'Cota Condominial - Casa 103 (Janeiro/2026)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 19, date: '2026-01-05', type: 'expense', desc: 'Conta de Energia Elétrica', amount: 190.20, category: 'Contas Fixas', attachments: [] },
  { id: 20, date: '2026-01-08', type: 'expense', desc: 'Conta de Água e Esgoto', amount: 310.00, category: 'Contas Fixas', attachments: [] },

  // --- HISTÓRICO ANO 2025 ---
  // Dezembro/2025
  { id: 101, date: '2025-12-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Dezembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 102, date: '2025-12-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Dezembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 103, date: '2025-12-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Dezembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 104, date: '2025-12-02', type: 'income', desc: 'Fundo de Reserva - Rateio 03 Casas', amount: 150.00, category: 'Fundo de Reserva', attachments: [] },
  { id: 105, date: '2025-12-05', type: 'expense', desc: 'Conta de Luz / Energia Áreas Comuns', amount: 172.50, category: 'Contas Fixas', attachments: [] },
  { id: 106, date: '2025-12-08', type: 'expense', desc: 'Conta de Água e Esgoto', amount: 285.00, category: 'Contas Fixas', attachments: [] },
  { id: 107, date: '2025-12-18', type: 'expense', desc: 'Revisão das Lâmpadas e Iluminação de Natal', amount: 120.00, category: 'Manutenção', attachments: [] },

  // Novembro/2025
  { id: 108, date: '2025-11-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Novembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 109, date: '2025-11-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Novembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 110, date: '2025-11-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Novembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 111, date: '2025-11-05', type: 'expense', desc: 'Conta de Energia Elétrica', amount: 168.30, category: 'Contas Fixas', attachments: [] },
  { id: 112, date: '2025-11-08', type: 'expense', desc: 'Conta de Água e Esgoto', amount: 290.40, category: 'Contas Fixas', attachments: [] },
  { id: 113, date: '2025-11-20', type: 'expense', desc: 'Corte de Grama e Limpeza Externa', amount: 180.00, category: 'Manutenção', attachments: [] },

  // Outubro/2025
  { id: 114, date: '2025-10-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Outubro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 115, date: '2025-10-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Outubro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 116, date: '2025-10-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Outubro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 117, date: '2025-10-05', type: 'expense', desc: 'Conta de Luz', amount: 160.00, category: 'Contas Fixas', attachments: [] },
  { id: 118, date: '2025-10-08', type: 'expense', desc: 'Conta de Água', amount: 275.50, category: 'Contas Fixas', attachments: [] },
  { id: 119, date: '2025-10-15', type: 'expense', desc: 'Troca de Sensor e Botoeira Portão', amount: 210.00, category: 'Manutenção', attachments: [] },

  // Setembro/2025
  { id: 120, date: '2025-09-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Setembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 121, date: '2025-09-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Setembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 122, date: '2025-09-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Setembro/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 123, date: '2025-09-05', type: 'expense', desc: 'Conta de Energia Elétrica', amount: 155.80, category: 'Contas Fixas', attachments: [] },
  { id: 124, date: '2025-09-08', type: 'expense', desc: 'Conta de Água', amount: 260.00, category: 'Contas Fixas', attachments: [] },

  // Agosto/2025
  { id: 125, date: '2025-08-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Agosto/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 126, date: '2025-08-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Agosto/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 127, date: '2025-08-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Agosto/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 128, date: '2025-08-05', type: 'expense', desc: 'Conta de Luz', amount: 165.20, category: 'Contas Fixas', attachments: [] },
  { id: 129, date: '2025-08-08', type: 'expense', desc: 'Conta de Água', amount: 270.30, category: 'Contas Fixas', attachments: [] },

  // Julho/2025
  { id: 130, date: '2025-07-01', type: 'income', desc: 'Cota Condominial - Casa 101 (Julho/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 131, date: '2025-07-01', type: 'income', desc: 'Cota Condominial - Casa 102 (Julho/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 132, date: '2025-07-01', type: 'income', desc: 'Cota Condominial - Casa 103 (Julho/2025)', amount: 450.00, category: 'Taxa Condominial', attachments: [] },
  { id: 133, date: '2025-07-05', type: 'expense', desc: 'Conta de Energia Elétrica', amount: 158.00, category: 'Contas Fixas', attachments: [] },
  { id: 134, date: '2025-07-08', type: 'expense', desc: 'Conta de Água', amount: 265.00, category: 'Contas Fixas', attachments: [] }
];

const INITIAL_RESIDENTS: Resident[] = [
  { id: 1, name: 'Anderson de Assis', unit: 'Casa 101', phone: '(51) 98765-4321', email: 'andersonde.assis@hotmail.com', status: 'active' },
  { id: 2, name: 'Beatriz Silva', unit: 'Casa 102', phone: '(51) 99123-4567', email: 'beatriz.silva@email.com', status: 'active' },
  { id: 3, name: 'Carlos Eduardo Santos', unit: 'Casa 103', phone: '(51) 99888-7766', email: 'carlos.santos@email.com', status: 'active' },
];

const INITIAL_VACATIONS: VacationNotice[] = [
  { id: 1, unit: 'Casa 102', startDate: '2026-04-10', endDate: '2026-04-20', notes: 'Viagem em família. Em caso de emergência ligar para a filha Maria.' },
];

const INITIAL_PROPOSALS: BudgetProposal[] = [
  { 
    id: 1, 
    title: 'Instalação de Câmeras de Segurança HD no Portão', 
    description: 'Instalação de 4 câmeras IP com gravação em nuvem e acesso via aplicativo para todos os moradores.',
    value: 1200.00, 
    provider: 'SecureTech Segurança Eletrônica', 
    status: 'open', 
    votesFor: 2, 
    votesAgainst: 0, 
    deadline: '2026-03-31' 
  },
  { 
    id: 2, 
    title: 'Pintura dos Portões de Acesso e Muros Frontais', 
    description: 'Lixamento, fundo antiferrugem e pintura com tinta esmalte sintético premium.',
    value: 850.00, 
    provider: 'Pinturas & Reformas Silva', 
    status: 'open', 
    votesFor: 1, 
    votesAgainst: 1, 
    deadline: '2026-04-15' 
  }
];

const INITIAL_IDEAS: ImprovementIdea[] = [
  {
    id: 1,
    title: 'Lâmpadas com Sensor de Presença nas Áreas Comuns',
    description: 'Substituir as lâmpadas fixas do corredor e portão por modelos com sensor para economizar cerca de 30% na conta de luz.',
    authorUnit: 'Casa 101',
    votes: { low: 0, medium: 2, high: 4 },
    createdAt: '2026-03-02'
  },
  {
    id: 2,
    title: 'Lixeira Seletiva Padronizada (Reciclável e Orgânico)',
    description: 'Organizar lixeiras identificadas para evitar que animais mexam no lixo e facilitar a coleta.',
    authorUnit: 'Casa 103',
    votes: { low: 1, medium: 3, high: 2 },
    createdAt: '2026-03-05'
  }
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 1,
    title: 'Manutenção Preventiva do Portão Eletrônico',
    content: 'No dia 15/03 (sábado), entre 09h e 12h, a empresa técnica fará a lubrificação e troca de rolamentos do portão. Favor redobrar o cuidado ao transitar.',
    priority: 'important',
    date: '2026-03-10',
    author: 'Síndico Geral'
  },
  {
    id: 2,
    title: 'Coleta Seletiva e Descarte de Entulho',
    content: 'Lembramos a todos que o caminhão de reciclagem passa às terças e quintas-feiras pela manhã.',
    priority: 'normal',
    date: '2026-03-01',
    author: 'Administração'
  }
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 1,
    unit: 'Casa 102',
    title: 'Interfone com chiado intermitente',
    description: 'O interfone da unidade 102 não está tocando com clareza quando acionado no portão da rua.',
    category: 'manutencao',
    status: 'in_progress',
    response: 'Técnico agendado para verificação nesta sexta-feira.',
    createdAt: '2026-03-08'
  }
];

const INITIAL_PACKAGES: PackageDelivery[] = [
  {
    id: 1,
    unit: 'Casa 103',
    recipient: 'Carlos Eduardo',
    carrier: 'Mercado Livre',
    trackingCode: 'ML-889921',
    receivedDate: '2026-03-12 14:30',
    status: 'waiting'
  }
];

const INITIAL_SETTINGS: CondoSettings = {
  name: 'Condomínio Residencial',
  pixKey: 'andersonde.assis@hotmail.com',
  pixType: 'email',
  monthlyQuota: 450.00,
  fundAmount: 50.00,
  quotaDueDay: 10,
  fundDueDay: 10
};

// Storage local seguro com fallback
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`condo_${key}`);
    if (!item) {
      localStorage.setItem(`condo_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`condo_${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn("Storage save error:", err);
  }
}

export const api = {
  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      const normalize = (items: Transaction[]) =>
        items.map(t => t.category === 'Utilidades' ? { ...t, category: 'Contas Fixas' } : t);

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          // Garante que os registros existentes e do Supabase contenham o histórico completo
          const normalizedData = normalize(data);
          const existingIds = new Set(normalizedData.map((t: any) => t.id));
          const merged = [...normalizedData, ...INITIAL_TRANSACTIONS.filter(t => !existingIds.has(t.id))];
          setLocal('transactions', merged);
          return merged;
        }
      } catch (e) {
        console.warn("Supabase offline/unreachable, using local cache:", e);
      }
      
      const local = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
      const normalizedLocal = normalize(local);
      const existingIds = new Set(normalizedLocal.map(t => t.id));
      const merged = [...normalizedLocal, ...INITIAL_TRANSACTIONS.filter(t => !existingIds.has(t.id))];
      setLocal('transactions', merged);
      return merged;
    },
    create: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
      const newTransaction: Transaction = {
        ...data,
        id: Date.now()
      };
      try {
        const { data: res, error } = await supabase
          .from('transactions')
          .insert([data])
          .select()
          .single();
        if (!error && res) {
          const current = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
          setLocal('transactions', [res, ...current.filter(t => t.id !== res.id)]);
          return res;
        }
      } catch (err) {
        console.warn("Supabase insert fallback:", err);
      }
      const current = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
      setLocal('transactions', [newTransaction, ...current]);
      return newTransaction;
    },
    update: async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
      try {
        const { data: res, error } = await supabase
          .from('transactions')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && res) {
          const current = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
          setLocal('transactions', current.map(t => t.id === id ? res : t));
          return res;
        }
      } catch (err) {
        console.warn("Supabase update fallback:", err);
      }
      const current = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
      const updated = current.map(t => t.id === id ? { ...t, ...data } : t);
      setLocal('transactions', updated);
      return updated.find(t => t.id === id) as Transaction;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.warn("Supabase delete fallback:", err);
      }
      const current = getLocal<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
      setLocal('transactions', current.filter(t => t.id !== id));
      return { success: true };
    },
  },

  residents: {
    getAll: async (): Promise<Resident[]> => {
      try {
        const { data, error } = await supabase.from('residents').select('*');
        if (!error && data && data.length > 0) {
          setLocal('residents', data);
          return data;
        }
      } catch (e) {
        console.warn("Residents fallback to local:", e);
      }
      return getLocal('residents', INITIAL_RESIDENTS);
    },
    create: async (data: Omit<Resident, 'id'>): Promise<Resident> => {
      const newRes: Resident = { ...data, id: Date.now() };
      try {
        const { data: res, error } = await supabase.from('residents').insert([data]).select().single();
        if (!error && res) {
          const current = getLocal<Resident[]>('residents', INITIAL_RESIDENTS);
          setLocal('residents', [...current, res]);
          return res;
        }
      } catch (err) {
        console.warn("Residents create fallback:", err);
      }
      const current = getLocal<Resident[]>('residents', INITIAL_RESIDENTS);
      setLocal('residents', [...current, newRes]);
      return newRes;
    },
    update: async (id: number, data: Partial<Resident>): Promise<Resident> => {
      try {
        const { data: res, error } = await supabase.from('residents').update(data).eq('id', id).select().single();
        if (!error && res) {
          const current = getLocal<Resident[]>('residents', INITIAL_RESIDENTS);
          setLocal('residents', current.map(r => r.id === id ? res : r));
          return res;
        }
      } catch (err) {
        console.warn("Residents update fallback:", err);
      }
      const current = getLocal<Resident[]>('residents', INITIAL_RESIDENTS);
      const updated = current.map(r => r.id === id ? { ...r, ...data } : r);
      setLocal('residents', updated);
      return updated.find(r => r.id === id) as Resident;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('residents').delete().eq('id', id);
      } catch (err) {
        console.warn("Residents delete fallback:", err);
      }
      const current = getLocal<Resident[]>('residents', INITIAL_RESIDENTS);
      setLocal('residents', current.filter(r => r.id !== id));
      return { success: true };
    },
  },

  vacations: {
    getAll: async (): Promise<VacationNotice[]> => {
      try {
        const { data, error } = await supabase.from('vacation_notices').select('*');
        if (!error && data && data.length > 0) {
          setLocal('vacations', data);
          return data;
        }
      } catch (err) {
        console.warn("Vacations fallback:", err);
      }
      return getLocal('vacations', INITIAL_VACATIONS);
    },
    create: async (data: Omit<VacationNotice, 'id'>): Promise<VacationNotice> => {
      const newVac: VacationNotice = { ...data, id: Date.now() };
      try {
        const { data: res, error } = await supabase.from('vacation_notices').insert([data]).select().single();
        if (!error && res) {
          const current = getLocal<VacationNotice[]>('vacations', INITIAL_VACATIONS);
          setLocal('vacations', [...current, res]);
          return res;
        }
      } catch (err) {
        console.warn("Vacations create fallback:", err);
      }
      const current = getLocal<VacationNotice[]>('vacations', INITIAL_VACATIONS);
      setLocal('vacations', [...current, newVac]);
      return newVac;
    },
    update: async (id: number, data: Partial<VacationNotice>): Promise<VacationNotice> => {
      try {
        const { data: res, error } = await supabase.from('vacation_notices').update(data).eq('id', id).select().single();
        if (!error && res) {
          const current = getLocal<VacationNotice[]>('vacations', INITIAL_VACATIONS);
          setLocal('vacations', current.map(v => v.id === id ? res : v));
          return res;
        }
      } catch (err) {
        console.warn("Vacations update fallback:", err);
      }
      const current = getLocal<VacationNotice[]>('vacations', INITIAL_VACATIONS);
      const updated = current.map(v => v.id === id ? { ...v, ...data } : v);
      setLocal('vacations', updated);
      return updated.find(v => v.id === id) as VacationNotice;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('vacation_notices').delete().eq('id', id);
      } catch (err) {
        console.warn("Vacations delete fallback:", err);
      }
      const current = getLocal<VacationNotice[]>('vacations', INITIAL_VACATIONS);
      setLocal('vacations', current.filter(v => v.id !== id));
      return { success: true };
    },
  },

  proposals: {
    getAll: async (): Promise<BudgetProposal[]> => {
      try {
        const { data, error } = await supabase.from('budget_proposals').select('*');
        if (!error && data && data.length > 0) {
          setLocal('proposals', data);
          return data;
        }
      } catch (err) {
        console.warn("Proposals fallback:", err);
      }
      return getLocal('proposals', INITIAL_PROPOSALS);
    },
    create: async (data: Omit<BudgetProposal, 'id'>): Promise<BudgetProposal> => {
      const newProp: BudgetProposal = { ...data, id: Date.now() };
      try {
        const { data: res, error } = await supabase.from('budget_proposals').insert([data]).select().single();
        if (!error && res) {
          const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
          setLocal('proposals', [...current, res]);
          return res;
        }
      } catch (err) {
        console.warn("Proposals create fallback:", err);
      }
      const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
      setLocal('proposals', [...current, newProp]);
      return newProp;
    },
    update: async (id: number, data: Partial<BudgetProposal>): Promise<BudgetProposal> => {
      const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
      const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
      setLocal('proposals', updated);
      try {
        await supabase.from('budget_proposals').update(data).eq('id', id);
      } catch (err) {
        console.warn("Supabase proposals update fallback:", err);
      }
      return updated.find(p => p.id === id) as BudgetProposal;
    },
    vote: async (id: number, type: 'for' | 'against'): Promise<BudgetProposal> => {
      const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
      const updated = current.map(p => {
        if (p.id === id) {
          return {
            ...p,
            votesFor: type === 'for' ? p.votesFor + 1 : p.votesFor,
            votesAgainst: type === 'against' ? p.votesAgainst + 1 : p.votesAgainst
          };
        }
        return p;
      });
      setLocal('proposals', updated);
      try {
        const item = updated.find(p => p.id === id);
        if (item) {
          await supabase.from('budget_proposals').update({ votesFor: item.votesFor, votesAgainst: item.votesAgainst }).eq('id', id);
        }
      } catch (err) {
        console.warn("Supabase vote fallback:", err);
      }
      return updated.find(p => p.id === id) as BudgetProposal;
    },
    updateStatus: async (id: number, status: 'approved' | 'rejected'): Promise<BudgetProposal> => {
      const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
      const updated = current.map(p => p.id === id ? { ...p, status } : p);
      setLocal('proposals', updated);
      try {
        await supabase.from('budget_proposals').update({ status }).eq('id', id);
      } catch (err) {
        console.warn("Supabase status fallback:", err);
      }
      return updated.find(p => p.id === id) as BudgetProposal;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('budget_proposals').delete().eq('id', id);
      } catch (err) {
        console.warn("Proposals delete fallback:", err);
      }
      const current = getLocal<BudgetProposal[]>('proposals', INITIAL_PROPOSALS);
      setLocal('proposals', current.filter(p => p.id !== id));
      return { success: true };
    }
  },

  ideas: {
    getAll: async (): Promise<ImprovementIdea[]> => {
      try {
        const { data, error } = await supabase.from('improvement_ideas').select('*');
        if (!error && data && data.length > 0) {
          setLocal('ideas', data);
          return data;
        }
      } catch (err) {
        console.warn("Ideas fallback:", err);
      }
      return getLocal('ideas', INITIAL_IDEAS);
    },
    create: async (data: Omit<ImprovementIdea, 'id' | 'votes'> & { votes?: ImprovementIdea['votes'] }): Promise<ImprovementIdea> => {
      const newIdea: ImprovementIdea = {
        votes: { low: 0, medium: 0, high: 0 },
        ...data,
        id: Date.now(),
      };
      try {
        const { data: res, error } = await supabase.from('improvement_ideas').insert([newIdea]).select().single();
        if (!error && res) {
          const current = getLocal<ImprovementIdea[]>('ideas', INITIAL_IDEAS);
          setLocal('ideas', [res, ...current]);
          return res;
        }
      } catch (err) {
        console.warn("Ideas create fallback:", err);
      }
      const current = getLocal<ImprovementIdea[]>('ideas', INITIAL_IDEAS);
      setLocal('ideas', [newIdea, ...current]);
      return newIdea;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('improvement_ideas').delete().eq('id', id);
      } catch (err) {
        console.warn("Ideas delete fallback:", err);
      }
      const current = getLocal<ImprovementIdea[]>('ideas', INITIAL_IDEAS);
      setLocal('ideas', current.filter(i => i.id !== id));
      return { success: true };
    },
    vote: async (id: number, priority: 'low' | 'medium' | 'high'): Promise<ImprovementIdea> => {
      const current = getLocal<ImprovementIdea[]>('ideas', INITIAL_IDEAS);
      const updated = current.map(i => {
        if (i.id === id) {
          const currentVotes = i.votes || { low: 0, medium: 0, high: 0 };
          return {
            ...i,
            votes: {
              ...currentVotes,
              [priority]: (currentVotes[priority] || 0) + 1
            }
          };
        }
        return i;
      });
      setLocal('ideas', updated);
      try {
        const item = updated.find(i => i.id === id);
        if (item) {
          await supabase.from('improvement_ideas').update({ votes: item.votes }).eq('id', id);
        }
      } catch (err) {
        console.warn("Ideas vote fallback:", err);
      }
      return updated.find(i => i.id === id) as ImprovementIdea;
    },
  },

  notices: {
    getAll: async (): Promise<Notice[]> => {
      try {
        const { data, error } = await supabase.from('notices').select('*').order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          setLocal('notices', data);
          return data;
        }
      } catch (err) {
        console.warn("Supabase notices fallback:", err);
      }
      return getLocal('notices', INITIAL_NOTICES);
    },
    create: async (data: Omit<Notice, 'id'>): Promise<Notice> => {
      const newNotice: Notice = { ...data, id: Date.now() };
      try {
        const { data: res, error } = await supabase.from('notices').insert([newNotice]).select().single();
        if (!error && res) {
          const current = getLocal<Notice[]>('notices', INITIAL_NOTICES);
          setLocal('notices', [res, ...current]);
          return res;
        }
      } catch (err) {
        console.warn("Notice create fallback:", err);
      }
      const current = getLocal<Notice[]>('notices', INITIAL_NOTICES);
      setLocal('notices', [newNotice, ...current]);
      return newNotice;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('notices').delete().eq('id', id);
      } catch (err) {
        console.warn("Notice delete fallback:", err);
      }
      const current = getLocal<Notice[]>('notices', INITIAL_NOTICES);
      setLocal('notices', current.filter(n => n.id !== id));
      return { success: true };
    }
  },

  incidents: {
    getAll: async (): Promise<Incident[]> => {
      return getLocal('incidents', INITIAL_INCIDENTS);
    },
    create: async (data: Omit<Incident, 'id'>): Promise<Incident> => {
      const newInc: Incident = { ...data, id: Date.now() };
      const current = getLocal<Incident[]>('incidents', INITIAL_INCIDENTS);
      setLocal('incidents', [newInc, ...current]);
      return newInc;
    },
    update: async (id: number, data: Partial<Incident>): Promise<Incident> => {
      const current = getLocal<Incident[]>('incidents', INITIAL_INCIDENTS);
      const updated = current.map(inc => inc.id === id ? { ...inc, ...data } : inc);
      setLocal('incidents', updated);
      return updated.find(inc => inc.id === id) as Incident;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      const current = getLocal<Incident[]>('incidents', INITIAL_INCIDENTS);
      setLocal('incidents', current.filter(inc => inc.id !== id));
      return { success: true };
    }
  },

  packages: {
    getAll: async (): Promise<PackageDelivery[]> => {
      try {
        const { data, error } = await supabase.from('package_deliveries').select('*').order('id', { ascending: false });
        if (!error && data && data.length > 0) {
          setLocal('packages', data);
          return data;
        }
      } catch (err) {
        console.warn("Supabase packages fallback:", err);
      }
      return getLocal('packages', INITIAL_PACKAGES);
    },
    create: async (data: Omit<PackageDelivery, 'id'>): Promise<PackageDelivery> => {
      const newPkg: PackageDelivery = { ...data, id: Date.now() };
      try {
        const { data: res, error } = await supabase.from('package_deliveries').insert([newPkg]).select().single();
        if (!error && res) {
          const current = getLocal<PackageDelivery[]>('packages', INITIAL_PACKAGES);
          setLocal('packages', [res, ...current]);
          return res;
        }
      } catch (err) {
        console.warn("Package create fallback:", err);
      }
      const current = getLocal<PackageDelivery[]>('packages', INITIAL_PACKAGES);
      setLocal('packages', [newPkg, ...current]);
      return newPkg;
    },
    markDelivered: async (id: number): Promise<PackageDelivery> => {
      const current = getLocal<PackageDelivery[]>('packages', INITIAL_PACKAGES);
      const pickedUp = new Date().toLocaleString('pt-BR');
      const updated = current.map(p => p.id === id ? { 
        ...p, 
        status: 'delivered' as const, 
        pickedUpDate: pickedUp 
      } : p);
      setLocal('packages', updated);
      try {
        await supabase.from('package_deliveries').update({ status: 'delivered', pickedUpDate: pickedUp }).eq('id', id);
      } catch (err) {
        console.warn("Package mark delivered fallback:", err);
      }
      return updated.find(p => p.id === id) as PackageDelivery;
    },
    delete: async (id: number): Promise<{ success: boolean }> => {
      try {
        await supabase.from('package_deliveries').delete().eq('id', id);
      } catch (err) {
        console.warn("Package delete fallback:", err);
      }
      const current = getLocal<PackageDelivery[]>('packages', INITIAL_PACKAGES);
      setLocal('packages', current.filter(p => p.id !== id));
      return { success: true };
    }
  },

  settings: {
    get: async (): Promise<CondoSettings> => {
      return getLocal('settings', INITIAL_SETTINGS);
    },
    update: async (data: Partial<CondoSettings>): Promise<CondoSettings> => {
      const current = getLocal('settings', INITIAL_SETTINGS);
      const updated = { ...current, ...data };
      setLocal('settings', updated);
      return updated;
    }
  }
};
