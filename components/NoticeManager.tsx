import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Sparkles, AlertTriangle, Info, Bell, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Notice } from '../types';
import { api } from '../services/api';
import { generateNoticeDraft } from '../services/geminiService';

interface NoticeManagerProps {
  userEmail?: string;
}

export const NoticeManager: React.FC<NoticeManagerProps> = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState<number | null>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<'cordial' | 'firme' | 'urgente' | 'informativo'>('cordial');
  const [aiDetails, setAiDetails] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Notice['priority']>('normal');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await api.notices.getAll();
      setNotices(data);
    } catch (err) {
      console.error('Erro ao buscar comunicados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setGeneratingAi(true);
    try {
      const draft = await generateNoticeDraft(aiTopic, aiTone, aiDetails);
      setTitle(aiTopic);
      setContent(draft);
      if (aiTone === 'urgente') {
        setPriority('urgent');
      } else if (aiTone === 'firme') {
        setPriority('important');
      } else {
        setPriority('normal');
      }
    } catch (err) {
      console.error('Erro ao gerar com IA:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const created = await api.notices.create({
        title,
        content,
        priority,
        author: 'Síndico Geral',
        date: new Date().toISOString().split('T')[0]
      });

      setTitle('');
      setContent('');
      setPriority('normal');
      setAiTopic('');
      setAiDetails('');
      setIsModalOpen(false);
      setNotices(prev => [created, ...prev]);
    } catch (err) {
      console.error('Erro ao criar comunicado:', err);
    }
  };

  const confirmDeleteNotice = async () => {
    if (!deleteNoticeId) return;
    const idToDelete = deleteNoticeId;
    setDeleteNoticeId(null);
    try {
      await api.notices.delete(idToDelete);
      setNotices(prev => prev.filter(n => n.id !== idToDelete));
    } catch (err) {
      console.error('Erro ao excluir comunicado:', err);
    }
  };

  const getPriorityBadge = (p: Notice['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Urgente</span>;
      case 'important':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1"><Info className="w-3 h-3" /> Importante</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1"><Bell className="w-3 h-3" /> Informativo</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-600 mb-1">
            <Megaphone className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">Mural de Avisos e Comunicados</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Mantenha os moradores informados sobre manutenções, assembleias e comunicados oficiais com auxílio de IA.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Comunicado
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
          <p className="text-base font-medium text-slate-600">Nenhum comunicado publicado no momento.</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Novo Comunicado" para enviar um informe aos moradores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                notice.priority === 'urgent'
                  ? 'border-rose-300 shadow-md ring-1 ring-rose-100'
                  : notice.priority === 'important'
                  ? 'border-amber-300 shadow-sm ring-1 ring-amber-100'
                  : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(notice.priority)}
                  </div>
                  <button
                    onClick={() => setDeleteNoticeId(notice.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors p-1.5 cursor-pointer"
                    title="Excluir comunicado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{notice.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4">
                  {notice.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Por: {notice.author}</span>
                <span>{new Date(notice.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteNoticeId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Comunicado</h3>
                <p className="text-xs text-slate-500">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja remover este aviso do mural de comunicados?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteNoticeId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteNotice}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                Criar Comunicado Oficial
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Gerador com Inteligência Artificial */}
            <div className="mb-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Redigir com Inteligência Artificial Gemini</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Descreva rapidamente o tema e detalhes:
              </p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Manutenção na caixa d'água com suspensão temporária"
                  className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={aiDetails}
                  onChange={(e) => setAiDetails(e.target.value)}
                  placeholder="Detalhes extras: Terça-feira das 09h às 13h, economizem água"
                  className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Tom:</span>
                    <select
                      value={aiTone}
                      onChange={(e: any) => setAiTone(e.target.value)}
                      className="bg-white border border-indigo-200 text-xs rounded px-2 py-1 outline-none"
                    >
                      <option value="cordial">Cordial & Educado</option>
                      <option value="informativo">Informativo</option>
                      <option value="firme">Firme / Regras</option>
                      <option value="urgente">Urgente / Alerta</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAi || !aiTopic.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {generatingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {generatingAi ? 'Gerando...' : 'Gerar Redação'}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Título do Comunicado</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Manutenção Preventiva no Portão Principal"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="normal">Normal / Informativo</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente / Atenção</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Texto do Comunicado</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite aqui os detalhes completos para os moradores..."
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
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

