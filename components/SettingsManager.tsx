import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, QrCode, DollarSign, CheckCircle2, ShieldCheck, Loader2, Calendar } from 'lucide-react';
import { CondoSettings } from '../types';
import { api } from '../services/api';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<CondoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.settings.get();
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      await api.settings.update(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-600 mb-1">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-900">Configurações Gerais do Condomínio</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Configure dados cadastrais, valores de taxa condominial, fundo de reserva e chave PIX para pagamentos.
          </p>
        </div>
        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados Básicos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            Identificação do Condomínio
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome do Condomínio / Edifício</label>
            <input
              type="text"
              required
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Financeiro e PIX */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            Chave PIX para Arrecadação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Chave PIX</label>
              <select
                value={settings.pixType}
                onChange={(e: any) => setSettings({ ...settings, pixType: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Telefone / Celular</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Chave PIX</label>
              <input
                type="text"
                required
                value={settings.pixKey}
                onChange={(e) => setSettings({ ...settings, pixKey: e.target.value })}
                placeholder="Ex: andersonde.assis@hotmail.com"
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Valores e Prazos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Cotização Mensal & Vencimentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cota Condominial Padrão (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.monthlyQuota}
                onChange={(e) => setSettings({ ...settings, monthlyQuota: Number(e.target.value) })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dia de Vencimento da Cota</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={settings.quotaDueDay}
                  onChange={(e) => setSettings({ ...settings, quotaDueDay: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fundo de Reserva Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={settings.fundAmount}
                onChange={(e) => setSettings({ ...settings, fundAmount: Number(e.target.value) })}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dia de Vencimento do Fundo</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={settings.fundDueDay}
                  onChange={(e) => setSettings({ ...settings, fundDueDay: Number(e.target.value) })}
                  className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-indigo-200 transition-all text-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

