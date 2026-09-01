import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Receipt, Sparkles, LogOut, Building2, Menu, X, 
  Users, FileDown, Palmtree, CheckSquare, Megaphone, Package, 
  AlertCircle, Settings
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/TransactionManager';
import { AIAssistant } from './components/AIAssistant';
import { ResidentManager } from './components/ResidentManager';
import { ExportReports } from './components/ExportReports';
import { VacationManager } from './components/VacationManager';
import { ApprovalsManager } from './components/ApprovalsManager';
import { NoticeManager } from './components/NoticeManager';
import { PackageDeliveryManager } from './components/PackageDeliveryManager';
import { IncidentManager } from './components/IncidentManager';
import { SettingsManager } from './components/SettingsManager';
import { Auth } from './components/Auth';
import { Transaction, User } from './types';
import { api } from './services/api';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

type Tab = 
  | 'dashboard' 
  | 'transactions' 
  | 'notices' 
  | 'packages' 
  | 'incidents' 
  | 'approvals' 
  | 'residents' 
  | 'vacation' 
  | 'exports' 
  | 'ai' 
  | 'settings';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Gerenciar Sessão do Supabase e Sessão Local Resiliente
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('condo_active_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.warn("Error parsing saved session", e);
        }
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          const userObj: User = {
            name: session.user.user_metadata?.full_name || session.user.email || 'Síndico Gestor',
            role: 'admin',
            unit: 'Admin'
          };
          setUser(userObj);
          localStorage.setItem('condo_active_user', JSON.stringify(userObj));
        }
        setAuthLoading(false);
      }).catch(() => {
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          const userObj: User = {
            name: session.user.user_metadata?.full_name || session.user.email || 'Síndico Gestor',
            role: 'admin',
            unit: 'Admin'
          };
          setUser(userObj);
          localStorage.setItem('condo_active_user', JSON.stringify(userObj));
        }
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      console.warn("Supabase auth check bypassed:", e);
      setAuthLoading(false);
    }
  }, []);

  // Carregar transações ao autenticar ou entrar no modo demo
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      api.transactions.getAll()
        .then(data => {
          const formatted = data.map((t: any) => ({
            ...t,
            amount: Number(t.amount),
            attachments: t.attachments || [] 
          }));
          setTransactions(formatted);
        })
        .catch(err => console.error("Erro ao carregar dados:", err))
        .finally(() => setLoadingData(false));
    }
  }, [user]);

  const handleDirectLogin = (userData: { name: string; role: 'admin' | 'resident'; unit: string; email: string }) => {
    const userObj: User = {
      name: userData.name,
      role: userData.role,
      unit: userData.unit
    };
    setUser(userObj);
    try {
      localStorage.setItem('condo_active_user', JSON.stringify(userObj));
    } catch (e) {
      console.warn("Could not save session to localStorage:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out fallback:", e);
    }
    try {
      localStorage.removeItem('condo_active_user');
    } catch (e) {
      console.warn("Could not clear local session:", e);
    }
    setSession(null);
    setUser(null);
    setTransactions([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <Building2 className="w-10 h-10 text-indigo-500 mb-4" />
          <div className="text-indigo-900 font-medium">Iniciando CondoManager Pro...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onDirectLogin={handleDirectLogin} />;
  }

  const userEmail = session?.user?.email || (user.role === 'admin' ? 'andersonde.assis@hotmail.com' : 'morador@condominio.com');

  const NavItem = ({ id, label, icon: Icon, badge }: { id: Tab; label: string; icon: any; badge?: string }) => (
    <button 
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${activeTab === id ? 'text-indigo-100' : 'text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5 font-bold text-slate-900">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span>CondoManager Pro</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-5 h-full flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-200">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight text-base">CondoManager</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">PRO GESTOR</span>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                  Financeiro & Painel
                </div>
                <nav className="space-y-1">
                  <NavItem id="dashboard" label="Visão Geral" icon={LayoutDashboard} />
                  <NavItem id="transactions" label="Fluxo de Caixa" icon={Receipt} />
                  <NavItem id="exports" label="Relatórios & PDF" icon={FileDown} />
                </nav>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                  Operacional & Portaria
                </div>
                <nav className="space-y-1">
                  <NavItem id="notices" label="Mural de Avisos" icon={Megaphone} badge="IA" />
                  <NavItem id="packages" label="Portaria & Encomendas" icon={Package} />
                  <NavItem id="incidents" label="Livro de Ocorrências" icon={AlertCircle} />
                </nav>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                  Comunidade & Regras
                </div>
                <nav className="space-y-1">
                  <NavItem id="residents" label="Moradores & Casas" icon={Users} />
                  <NavItem id="approvals" label="Votações & Ideias" icon={CheckSquare} />
                  <NavItem id="vacation" label="Aviso de Férias" icon={Palmtree} />
                </nav>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                  Inteligência & Config
                </div>
                <nav className="space-y-1">
                  <NavItem id="ai" label="Consultor IA Síndico" icon={Sparkles} badge="Gemini" />
                  <NavItem id="settings" label="Configurações" icon={Settings} />
                </nav>
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate" title={user.name}>{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl">
        <header className="mb-6 hidden lg:block">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'dashboard' && 'Painel Financeiro e Indicadores'}
            {activeTab === 'transactions' && 'Controle de Entradas e Saídas'}
            {activeTab === 'notices' && 'Mural de Avisos e Comunicados aos Moradores'}
            {activeTab === 'packages' && 'Controle de Encomendas da Portaria'}
            {activeTab === 'incidents' && 'Livro de Ocorrências e Chamados de Manutenção'}
            {activeTab === 'approvals' && 'Assembleia Virtual & Votação de Ideias'}
            {activeTab === 'residents' && 'Cadastro de Moradores e Unidades'}
            {activeTab === 'vacation' && 'Registro de Ausências e Férias'}
            {activeTab === 'exports' && 'Exportação de Balancetes e Relatórios'}
            {activeTab === 'ai' && 'Consultor Síndico Inteligente (Gemini AI)'}
            {activeTab === 'settings' && 'Configurações e Dados do Condomínio'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Gestão completa, transparente e automatizada para o seu condomínio.</p>
        </header>

        <div>
          {loadingData && transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-slate-600">Sincronizando dados do condomínio...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard transactions={transactions} userEmail={userEmail} />}
              {activeTab === 'transactions' && <TransactionManager transactions={transactions} setTransactions={setTransactions} userEmail={userEmail} />}
              {activeTab === 'notices' && <NoticeManager userEmail={userEmail} />}
              {activeTab === 'packages' && <PackageDeliveryManager />}
              {activeTab === 'incidents' && <IncidentManager />}
              {activeTab === 'approvals' && <ApprovalsManager />}
              {activeTab === 'residents' && <ResidentManager />}
              {activeTab === 'vacation' && <VacationManager />}
              {activeTab === 'exports' && <ExportReports transactions={transactions} />}
              {activeTab === 'ai' && <AIAssistant transactions={transactions} />}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
