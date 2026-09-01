import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { generateFinancialReport, askCondoAdvisor } from '../services/geminiService';
import { Sparkles, Loader2, Calendar, Layers, FileText, MessageSquare, Send, BookOpen, Scale, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  transactions: Transaction[];
}

type FilterType = 'month' | 'all';
type AITab = 'advisor' | 'financial';

export const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const [activeAITab, setActiveAITab] = useState<AITab>('advisor');
  
  // Financial Audit State
  const [report, setReport] = useState<string>("");
  const [financialLoading, setFinancialLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Condo Advisor Chat State
  const [question, setQuestion] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `👋 **Olá, Síndico! Sou seu Consultor Condominial Inteligente.**\n\nPosso te orientar com base no **Código Civil Brasileiro (Arts. 1.331 a 1.358)**, **Lei do Condomínio (4.591/64)**, quóruns de assembleia, regras de barulho, inadimplência e gestão de conflitos.\n\nComo posso ajudar hoje?`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickQuestions = [
    "Qual o quórum legal para aprovar reformas no condomínio?",
    "Como proceder legalmente com moradores inadimplentes?",
    "Quais as regras para barulho excessivo e advertências?",
    "Obras urgentes na estrutura precisam de assembleia prévia?",
    "Animais de estimação podem ser proibidos na convenção?"
  ];

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, filterType, selectedMonth]);

  const handleGenerateFinancialReport = async () => {
    setFinancialLoading(true);
    let contextLabel = '';
    if (filterType === 'all') {
      contextLabel = 'Todo o Histórico Cadastrado';
    } else {
      const [y, m] = selectedMonth.split('-');
      contextLabel = `Mês de Referência: ${m}/${y}`;
    }

    const result = await generateFinancialReport(filteredTransactions, contextLabel);
    setReport(result);
    setFinancialLoading(false);
  };

  const handleAskAdvisor = async (promptText?: string) => {
    const query = promptText || question;
    if (!query.trim()) return;

    const userMessage = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setConversation(prev => [...prev, userMessage]);
    setQuestion('');
    setAdvisorLoading(true);

    try {
      const response = await askCondoAdvisor(query);
      setConversation(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: response,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setConversation(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: "Ocorreu uma instabilidade na consulta. Por favor, tente novamente.",
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAdvisorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-fit gap-1">
        <button
          onClick={() => setActiveAITab('advisor')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeAITab === 'advisor'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          Consultor Síndico & Legislação
        </button>
        <button
          onClick={() => setActiveAITab('financial')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeAITab === 'financial'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Auditoria Financeira & Parecer
        </button>
      </div>

      {activeAITab === 'advisor' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Consultoria Condominial Especializada</h3>
                <p className="text-[11px] text-slate-500">Grounded no Código Civil Brasileiro & Boas Práticas de Gestão</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Gemini AI Ativo
            </span>
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-indigo-50/50 border-b border-indigo-100/50 flex gap-2 overflow-x-auto text-xs py-2">
            <span className="text-indigo-900 font-semibold flex items-center gap-1 whitespace-nowrap pl-1">
              <HelpCircle className="w-3.5 h-3.5" /> Dúvidas frequentes:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAdvisor(q)}
                className="bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg whitespace-nowrap text-xs transition-colors font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                    IA
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none prose prose-sm prose-headings:text-indigo-900'
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  <span className={`block text-[10px] mt-2 ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {advisorLoading && (
              <div className="flex gap-3 justify-start items-center text-slate-500 text-sm pl-11">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Consultando normas e redigindo parecer...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAdvisor();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Como conduzir uma assembleia de prestação de contas?"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={advisorLoading || !question.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Perguntar
              </button>
            </form>
          </div>
        </div>
      )}

      {activeAITab === 'financial' && (
        <div className="space-y-6">
          {/* Header com Filtros */}
          <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Auditoria Financeira & Parecer Automático
              </h2>
              <p className="text-indigo-200 mt-2 max-w-xl text-sm">
                Selecione o período para a IA analisar todas as receitas, despesas e sugerir economias e otimizações financeiras.
              </p>

              {/* Área de Filtros */}
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex bg-indigo-950 p-1 rounded-lg w-full md:w-auto">
                    <button
                      onClick={() => setFilterType('month')}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        filterType === 'month' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-300 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Mês Específico
                    </button>
                    <button
                      onClick={() => setFilterType('all')}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-300 hover:text-white'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Todo Histórico
                    </button>
                  </div>

                  {filterType === 'month' && (
                    <div className="w-full md:w-auto">
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-indigo-800 border border-indigo-700 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      />
                    </div>
                  )}

                  <div className="text-xs text-indigo-200 ml-auto hidden md:block">
                    {filteredTransactions.length} registros prontos para análise
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-indigo-300 md:hidden">
                    {filteredTransactions.length} transações
                  </span>
                  <button
                    onClick={handleGenerateFinancialReport}
                    disabled={financialLoading || filteredTransactions.length === 0}
                    className="w-full md:w-auto bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold shadow hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {financialLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {financialLoading ? "Auditando contas..." : "Gerar Parecer Financeiro"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-700 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-600 rounded-full opacity-30 blur-3xl"></div>
          </div>

          {report && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Parecer e Auditoria de Gestão</h3>
                  <p className="text-xs text-slate-500">
                    Análise fundamentada em {filteredTransactions.length} lançamentos ({filterType === 'all' ? 'Histórico Completo' : selectedMonth}).
                  </p>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none prose-headings:text-indigo-900 prose-strong:text-indigo-800">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

