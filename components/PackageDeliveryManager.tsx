import React, { useState, useEffect } from 'react';
import { Package, Plus, CheckCircle, Clock, Search, Truck, Loader2, UserCheck, AlertCircle, Trash2 } from 'lucide-react';
import { PackageDelivery, Resident } from '../types';
import { api } from '../services/api';

export const PackageDeliveryManager: React.FC = () => {
  const [deliveries, setDeliveries] = useState<PackageDelivery[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'delivered'>('all');

  // Form State
  const [unit, setUnit] = useState('');
  const [recipient, setRecipient] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [delData, resData] = await Promise.all([
        api.packages.getAll(),
        api.residents.getAll()
      ]);
      setDeliveries(delData);
      setResidents(resData);
    } catch (err) {
      console.error('Erro ao carregar dados de encomendas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (selectedUnit: string) => {
    setUnit(selectedUnit);
    const resident = residents.find(r => r.unit === selectedUnit);
    if (resident) {
      setRecipient(resident.name);
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !recipient) return;

    try {
      const created = await api.packages.create({
        unit,
        recipient,
        carrier: carrier || 'Correios / Transportadora',
        trackingCode: trackingCode || undefined,
        receivedDate: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        status: 'waiting'
      });

      setDeliveries(prev => [created, ...prev]);
      setUnit('');
      setRecipient('');
      setCarrier('');
      setTrackingCode('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao registrar encomenda:', err);
    }
  };

  const handleMarkDelivered = async (id: number) => {
    try {
      const updated = await api.packages.markDelivered(id);
      setDeliveries(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Erro ao dar baixa na encomenda:', err);
    }
  };

  const confirmDeletePackage = async () => {
    if (!deletePackageId) return;
    const idToDelete = deletePackageId;
    setDeletePackageId(null);
    try {
      await api.packages.delete(idToDelete);
      setDeliveries(prev => prev.filter(p => p.id !== idToDelete));
    } catch (err) {
      console.error('Erro ao excluir encomenda:', err);
    }
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch =
      d.unit.toLowerCase().includes(search.toLowerCase()) ||
      d.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (d.trackingCode && d.trackingCode.toLowerCase().includes(search.toLowerCase())) ||
      (d.carrier && d.carrier.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' ? true : d.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const waitingCount = deliveries.filter(d => d.status === 'waiting').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-600 mb-1">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">Portaria & Encomendas</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Registre encomendas recebidas na portaria e notifique/dê baixa aos moradores na retirada.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {waitingCount > 0 && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {waitingCount} aguardando retirada
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Pacote
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por unidade, morador, código ou transportadora..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({deliveries.length})
          </button>
          <button
            onClick={() => setFilterStatus('waiting')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'waiting'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aguardando ({waitingCount})
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'delivered'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Entregues ({deliveries.length - waitingCount})
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
          <p className="text-base font-medium text-slate-600">Nenhuma encomenda encontrada.</p>
          <p className="text-xs text-slate-400 mt-1">Cadastre novas encomendas recebidas pela portaria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                pkg.status === 'waiting'
                  ? 'border-amber-200 shadow-sm bg-gradient-to-b from-white to-amber-50/20'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                    {pkg.unit}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {pkg.status === 'waiting' ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Na Portaria
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Retirado
                      </span>
                    )}
                    <button
                      onClick={() => setDeletePackageId(pkg.id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{pkg.recipient}</h3>
                
                <div className="space-y-1 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pkg.carrier || 'Entrega geral'}</span>
                  </div>
                  {pkg.trackingCode && (
                    <p className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                      Rastreio: {pkg.trackingCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Recebido: {pkg.receivedDate}
                  {pkg.pickedUpDate && ` • Retirado: ${pkg.pickedUpDate}`}
                </span>
                {pkg.status === 'waiting' && (
                  <button
                    onClick={() => handleMarkDelivered(pkg.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Dar Baixa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletePackageId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Encomenda</h3>
                <p className="text-xs text-slate-500">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja remover este registro de encomenda da portaria?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletePackageId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeletePackage}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Registrar Nova Encomenda
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDelivery} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unidade / Casa</label>
                <select
                  required
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>Selecione a unidade...</option>
                  <option value="Casa 101">Casa 101</option>
                  <option value="Casa 102">Casa 102</option>
                  <option value="Casa 103">Casa 103</option>
                  <option value="Casa 104">Casa 104</option>
                  <option value="Casa 105">Casa 105</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Destinatário</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ex: Anderson de Assis"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Transportadora / Origem</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Ex: Mercado Livre, Amazon, Correios, Shopee..."
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Código de Rastreio (Opcional)</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: BR123456789"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                  Salvar Encomenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

