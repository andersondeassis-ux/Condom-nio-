import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle2, Clock, Wrench, ShieldAlert, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { Incident } from '../types';
import { api } from '../services/api';

export const IncidentManager: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'manutencao' | 'barulho' | 'limpeza' | 'seguranca' | 'outro'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Incident['category']>('manutencao');
  const [unit, setUnit] = useState('Casa 101');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.incidents.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await api.incidents.create({
        title,
        description,
        category,
        status: 'open',
        unit,
        createdAt: new Date().toISOString().split('T')[0]
      });

      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      await loadIncidents();
    } catch (err) {
      console.error('Erro ao registrar ocorrência:', err);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: Incident['status']) => {
    try {
      await api.incidents.update(id, { 
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : undefined
      });
      await loadIncidents();
    } catch (err) {
      console.error('Erro ao atualizar status da ocorrência:', err);
    }
  };

  const filteredIncidents = incidents.filter(i => 
    filterCategory === 'all' ? true : i.category === filterCategory
  );

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolvido</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Em Andamento</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Em Aberto</span>;
    }
  };

  const getCategoryIcon = (c: Incident['category']) => {
    switch (c) {
      case 'manutencao':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'seguranca':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'barulho':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-600 mb-1">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">Livro de Ocorrências & Manutenções</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Acompanhe reclamações de barulho, solicitações de reparos, e chamados abertos pelos moradores.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Ocorrência
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Todas ({incidents.length})
        </button>
        <button
          onClick={() => setFilterCategory('manutencao')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === 'manutencao' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Manutenção ({incidents.filter(i => i.category === 'manutencao').length})
        </button>
        <button
          onClick={() => setFilterCategory('barulho')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === 'barulho' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Barulho / Convivência ({incidents.filter(i => i.category === 'barulho').length})
        </button>
        <button
          onClick={() => setFilterCategory('seguranca')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterCategory === 'seguranca' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Segurança ({incidents.filter(i => i.category === 'seguranca').length})
        </button>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
          <p className="text-base font-medium text-slate-600">Nenhuma ocorrência registrada nesta categoria.</p>
          <p className="text-xs text-slate-400 mt-1">O condomínio está sem pendências ativas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 rounded-lg">{getCategoryIcon(inc.category)}</span>
                  <h3 className="font-bold text-slate-900 text-base">{inc.title}</h3>
                  {getStatusBadge(inc.status)}
                </div>
                <p className="text-sm text-slate-600">{inc.description}</p>
                {inc.response && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 text-xs text-indigo-900">
                    <span className="font-semibold">Resposta do Síndico:</span> {inc.response}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-600">{inc.unit}</span>
                  <span>•</span>
                  <span>Registrado em {new Date(inc.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Status Action Buttons for Síndico */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {inc.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(inc.id, 'resolved')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolver
                  </button>
                )}
                {inc.status === 'open' && (
                  <button
                    onClick={() => handleUpdateStatus(inc.id, 'in_progress')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Iniciar Atendimento
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Registrar Ocorrência / Chamado
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="manutencao">Manutenção / Reparo Físico</option>
                  <option value="barulho">Barulho / Conflito de Convivência</option>
                  <option value="limpeza">Limpeza / Conservação</option>
                  <option value="seguranca">Segurança / Portaria</option>
                  <option value="outro">Outro Assunto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unidade / Local</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Casa 101">Casa 101</option>
                  <option value="Casa 102">Casa 102</option>
                  <option value="Casa 103">Casa 103</option>
                  <option value="Casa 104">Casa 104</option>
                  <option value="Área Comum">Área Comum / Salão / Portaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Título Resumido</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lâmpada do corredor queimada"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição Detalhada</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que aconteceu, horários, local exato..."
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

