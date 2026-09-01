import React, { useState, useEffect } from 'react';
import { BudgetProposal, ImprovementIdea } from '../types';
import { api } from '../services/api';
import { ThumbsUp, ThumbsDown, Plus, FileCheck, Lightbulb, Trophy, Clock, User, CheckCircle2, XCircle, Trash2, Lock, Ban, AlertTriangle, Siren, Hourglass, CalendarRange, Edit2, Loader2 } from 'lucide-react';

type Tab = 'budgets' | 'ideas';
type PriorityType = 'low' | 'medium' | 'high';

export const ApprovalsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('budgets');
  const [loading, setLoading] = useState(true);
  
  // Budgets State
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', description: '', provider: '', value: '', deadline: '' });
  const [editingProposalId, setEditingProposalId] = useState<number | null>(null);
  const [deleteProposalId, setDeleteProposalId] = useState<number | null>(null);

  // Ideas State
  const [ideas, setIdeas] = useState<ImprovementIdea[]>([]);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [deleteIdeaId, setDeleteIdeaId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [proposalsData, ideasData] = await Promise.all([
        api.proposals.getAll(),
        api.ideas.getAll()
      ]);
      setProposals(proposalsData);
      setIdeas(ideasData);
    } catch (err) {
      console.error('Erro ao carregar dados de votações e orçamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // --- Logic for Proposals ---
  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newProposal.value);
    if (!newProposal.title || isNaN(val)) return;

    try {
      if (editingProposalId) {
        // Editar Existente
        const updated = await api.proposals.update(editingProposalId, {
          title: newProposal.title,
          description: newProposal.description,
          provider: newProposal.provider,
          value: val,
          deadline: newProposal.deadline
        });
        setProposals(prev => prev.map(p => p.id === editingProposalId ? updated : p));
      } else {
        // Criar Novo
        const created = await api.proposals.create({
          title: newProposal.title,
          description: newProposal.description,
          provider: newProposal.provider,
          value: val,
          deadline: newProposal.deadline,
          status: 'open',
          votesFor: 0,
          votesAgainst: 0
        });
        setProposals(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err);
    }
    
    resetProposalForm();
  };

  const openEditProposal = (p: BudgetProposal) => {
    setNewProposal({
      title: p.title,
      description: p.description,
      provider: p.provider,
      value: String(p.value),
      deadline: p.deadline
    });
    setEditingProposalId(p.id);
    setShowProposalModal(true);
  };

  const resetProposalForm = () => {
    setShowProposalModal(false);
    setNewProposal({ title: '', description: '', provider: '', value: '', deadline: '' });
    setEditingProposalId(null);
  };

  const confirmDeleteProposal = async () => {
    if (deleteProposalId) {
      const idToDelete = deleteProposalId;
      setDeleteProposalId(null);
      try {
        await api.proposals.delete(idToDelete);
        setProposals(prev => prev.filter(p => p.id !== idToDelete));
      } catch (err) {
        console.error('Erro ao excluir orçamento:', err);
      }
    }
  };

  const voteProposal = async (id: number, type: 'for' | 'against') => {
    try {
      await api.proposals.vote(id, type);
      setProposals(prev => prev.map(p => {
        if (p.id !== id || p.status !== 'open') return p;
        return {
          ...p,
          votesFor: type === 'for' ? p.votesFor + 1 : p.votesFor,
          votesAgainst: type === 'against' ? p.votesAgainst + 1 : p.votesAgainst
        };
      }));
    } catch (err) {
      console.error('Erro ao votar:', err);
    }
  };

  const closeVoting = async (id: number, decision: 'approved' | 'rejected') => {
    try {
      await api.proposals.updateStatus(id, decision);
      setProposals(prev => prev.map(p => 
        p.id === id ? { ...p, status: decision } : p
      ));
    } catch (err) {
      console.error('Erro ao atualizar status do orçamento:', err);
    }
  };

  // --- Logic for Ideas (Priority System) ---
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim() || !newIdeaDesc.trim()) return;

    try {
      const created = await api.ideas.create({
        title: newIdeaTitle.trim(),
        description: newIdeaDesc.trim(),
        authorUnit: 'Minha Unidade',
        createdAt: new Date().toISOString().split('T')[0]
      });
      setIdeas(prev => [created, ...prev]);
      setNewIdeaTitle('');
      setNewIdeaDesc('');
    } catch (err) {
      console.error('Erro ao sugerir ideia:', err);
    }
  };

  const voteIdeaPriority = async (id: number, priority: PriorityType) => {
    try {
      await api.ideas.vote(id, priority);
      setIdeas(prev => prev.map(idea => 
        idea.id === id ? { 
          ...idea, 
          votes: {
            ...idea.votes,
            [priority]: (idea.votes[priority] || 0) + 1
          }
        } : idea
      ));
    } catch (err) {
      console.error('Erro ao votar na prioridade:', err);
    }
  };

  const requestDeleteIdea = (id: number) => {
    setDeleteIdeaId(id);
  };

  const confirmDeleteIdea = async () => {
    if (deleteIdeaId) {
      const idToDelete = deleteIdeaId;
      setDeleteIdeaId(null);
      try {
        await api.ideas.delete(idToDelete);
        setIdeas(prev => prev.filter(i => i.id !== idToDelete));
      } catch (err) {
        console.error('Erro ao excluir ideia:', err);
      }
    }
  };

  // Calculation Logic for Ranking
  const getIdeaScore = (votes: ImprovementIdea['votes']) => {
    return (votes.high * 3) + (votes.medium * 2) + (votes.low * 1);
  };

  const getTotalVotes = (votes: ImprovementIdea['votes']) => {
    return votes.high + votes.medium + votes.low;
  };

  const getDominantPriority = (votes: ImprovementIdea['votes']) => {
    const total = getTotalVotes(votes);
    if (total === 0) return null;
    
    if (votes.high >= votes.medium && votes.high >= votes.low) return 'high';
    if (votes.medium >= votes.high && votes.medium >= votes.low) return 'medium';
    return 'low';
  };

  // Sort ideas by Weighted Score
  const rankedIdeas = [...ideas].sort((a, b) => getIdeaScore(b.votes) - getIdeaScore(a.votes));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'budgets' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Orçamentos & Votação
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ideas' 
              ? 'bg-amber-500 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Banco de Ideias
          </button>
        </div>
      </div>

      {/* CONTENT: ORÇAMENTOS */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold">Votação de Serviços</h2>
              <p className="text-indigo-200 text-sm mt-1">Aprove orçamentos e decida o futuro do condomínio.</p>
            </div>
            <button 
              onClick={() => { resetProposalForm(); setShowProposalModal(true); }}
              className="relative z-10 bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Orçamento
            </button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-indigo-600 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-medium text-slate-600">Carregando orçamentos...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-14 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhum orçamento cadastrado</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Não há propostas ou orçamentos em votação no momento.
              </p>
              <button
                onClick={() => { resetProposalForm(); setShowProposalModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Orçamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map(proposal => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const percentFor = totalVotes === 0 ? 0 : Math.round((proposal.votesFor / totalVotes) * 100);
                const isOpen = proposal.status === 'open';
                const isRejected = proposal.status === 'rejected';

                return (
                  <div key={proposal.id} className={`bg-white rounded-xl shadow-sm border ${
                      isOpen ? 'border-slate-200' : 
                      isRejected ? 'border-red-200 bg-red-50/30' : 'border-emerald-200 bg-emerald-50/30' 
                    } p-6 relative overflow-hidden group`}>
                    
                    {/* Status Badge & Actions */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      {isOpen ? (
                         <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                           <Clock className="w-3 h-3" /> Aberto
                         </span>
                      ) : isRejected ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                          <Ban className="w-3 h-3" /> Reprovado
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprovado
                        </span>
                      )}

                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md shadow-sm backdrop-blur-sm">
                        <button 
                          onClick={() => openEditProposal(proposal)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteProposalId(proposal.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 mb-1 pr-24">{proposal.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 pr-16">{proposal.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                      <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <span className="block text-xs text-slate-400">Fornecedor</span>
                        <span className="font-medium text-slate-700">{proposal.provider}</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <span className="block text-xs text-slate-400">Valor</span>
                        <span className="font-bold text-slate-800">{formatBRL(proposal.value)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-emerald-600">{percentFor}% Aprovam</span>
                        <span className="text-slate-400">{totalVotes} votos totais</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${percentFor}%` }} className="h-full bg-emerald-500 transition-all duration-500"></div>
                        <div style={{ width: `${100 - percentFor}%` }} className="h-full bg-red-400 transition-all duration-500"></div>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => voteProposal(proposal.id, 'for')}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" /> Votar Sim
                          </button>
                          <button 
                            onClick={() => voteProposal(proposal.id, 'against')}
                            className="flex-1 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                          >
                            <ThumbsDown className="w-4 h-4" /> Votar Não
                          </button>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-400 uppercase">Área do Síndico</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => closeVoting(proposal.id, 'approved')}
                              className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-medium"
                            >
                              Encerrar e Aprovar
                            </button>
                            <button 
                              onClick={() => closeVoting(proposal.id, 'rejected')}
                              className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 font-medium"
                            >
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" /> Votação Encerrada
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: IDEIAS (RANKING DE PRIORIDADE) */}
      {activeTab === 'ideas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Ranking e Lista */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Ranking de Prioridades</h2>
                <p className="text-xs text-slate-500">Ordenado por urgência e pontuação</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-amber-600 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-600" />
                <p className="text-sm font-medium text-slate-600">Carregando ideias...</p>
              </div>
            ) : rankedIdeas.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Lightbulb className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhuma ideia sugerida ainda</h3>
                <p className="text-sm text-slate-500">Seja o primeiro a enviar uma sugestão de melhoria ao lado!</p>
              </div>
            ) : (
              rankedIdeas.map((idea, index) => {
                const total = getTotalVotes(idea.votes);
                const dominant = getDominantPriority(idea.votes);
                const score = getIdeaScore(idea.votes);

                // Determine card border/bg based on dominance
                let borderColor = "border-slate-200";
                let badgeColor = "bg-slate-100 text-slate-600";
                let badgeText = "Sem votos";
                let badgeIcon = <Hourglass className="w-3 h-3" />;

                if (dominant === 'high') {
                  borderColor = "border-red-200 hover:border-red-300";
                  badgeColor = "bg-red-100 text-red-700";
                  badgeText = "Alta Prioridade";
                  badgeIcon = <Siren className="w-3 h-3" />;
                } else if (dominant === 'medium') {
                  borderColor = "border-orange-200 hover:border-orange-300";
                  badgeColor = "bg-orange-100 text-orange-700";
                  badgeText = "Momento Atual";
                  badgeIcon = <Clock className="w-3 h-3" />;
                } else if (dominant === 'low') {
                  borderColor = "border-blue-200 hover:border-blue-300";
                  badgeColor = "bg-blue-100 text-blue-700";
                  badgeText = "Futuro";
                  badgeIcon = <CalendarRange className="w-3 h-3" />;
                }

                return (
                  <div key={idea.id} className={`bg-white p-5 rounded-xl shadow-sm border ${borderColor} transition-colors group relative`}>
                    <button 
                      onClick={() => requestDeleteIdea(idea.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      title="Excluir ideia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center pt-1 min-w-[2.5rem]">
                        {index === 0 && <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">1º</div>}
                        {index === 1 && <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">2º</div>}
                        {index === 2 && <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">3º</div>}
                        {index > 2 && <div className="text-slate-400 font-bold text-lg">#{index+1}</div>}
                        <div className="mt-2 text-xs font-mono text-slate-400 text-center">
                           {score}pts
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between pr-8">
                          <h3 className="font-bold text-slate-800 text-lg">{idea.title}</h3>
                        </div>
                        <p className="text-slate-600 text-sm mt-1 mb-3">{idea.description}</p>
                        
                        {/* Status Bar / Badge */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1 ${badgeColor}`}>
                            {badgeIcon} {badgeText}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> {idea.authorUnit}
                          </span>
                        </div>

                        {/* Voting Buttons */}
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide text-center sm:text-left">Qual a prioridade desta melhoria?</p>
                          <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            <button 
                              onClick={() => voteIdeaPriority(idea.id, 'low')}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors text-xs font-medium flex flex-col items-center gap-1"
                            >
                              <span className="font-bold">Futura</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 rounded-full text-[10px]">{idea.votes.low}</span>
                            </button>
                            
                            <button 
                              onClick={() => voteIdeaPriority(idea.id, 'medium')}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-colors text-xs font-medium flex flex-col items-center gap-1"
                            >
                              <span className="font-bold">Momento</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 rounded-full text-[10px]">{idea.votes.medium}</span>
                            </button>

                            <button 
                              onClick={() => voteIdeaPriority(idea.id, 'high')}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-xs font-medium flex flex-col items-center gap-1"
                            >
                              <span className="font-bold">Urgente</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 rounded-full text-[10px]">{idea.votes.high}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coluna da Direita: Nova Ideia */}
          <div className="lg:col-span-1">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4 text-amber-800 font-bold">
                <Lightbulb className="w-5 h-5" />
                Sugerir Melhoria
              </div>
              <form onSubmit={handleAddIdea} className="space-y-4">
                <input 
                  className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-sm"
                  placeholder="Título da melhoria..."
                  value={newIdeaTitle}
                  onChange={e => setNewIdeaTitle(e.target.value)}
                />
                <textarea 
                  className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none text-sm resize-none"
                  rows={4}
                  placeholder="Descreva a necessidade e como isso ajuda o condomínio..."
                  value={newIdeaDesc}
                  onChange={e => setNewIdeaDesc(e.target.value)}
                />
                <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm transition-colors">
                  Enviar Sugestão
                </button>
              </form>
              <div className="mt-4 text-xs text-amber-800/70 bg-amber-100/50 p-3 rounded-lg">
                <p className="font-bold mb-1">Como funciona o ranking?</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Urgente = 3 pontos</li>
                  <li>Momento = 2 pontos</li>
                  <li>Futura = 1 ponto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo/Editar Orçamento */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">{editingProposalId ? 'Editar Orçamento' : 'Cadastrar Orçamento'}</h3>
              <button onClick={resetProposalForm}><XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleAddProposal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" required 
                  value={newProposal.title} onChange={e => setNewProposal({...newProposal, title: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-2 text-sm" required rows={2}
                  value={newProposal.description} onChange={e => setNewProposal({...newProposal, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Fornecedor</label>
                   <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" required 
                    value={newProposal.provider} onChange={e => setNewProposal({...newProposal, provider: e.target.value})} />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                   <input type="number" className="w-full border border-slate-200 rounded-lg p-2 text-sm" required 
                    value={newProposal.value} onChange={e => setNewProposal({...newProposal, value: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Data Limite Votação</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg p-2 text-sm" required 
                  value={newProposal.deadline} onChange={e => setNewProposal({...newProposal, deadline: e.target.value})} />
              </div>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                {editingProposalId ? 'Salvar Alterações' : 'Lançar para Votação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação Exclusão Orçamento */}
      {deleteProposalId && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir Orçamento?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Tem certeza que deseja remover esta proposta de votação?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteProposalId(null)}
                  className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteProposal}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Exclusão Ideia */}
      {deleteIdeaId && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir Ideia?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Tem certeza que deseja remover esta sugestão do mural?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteIdeaId(null)}
                  className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteIdea}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};