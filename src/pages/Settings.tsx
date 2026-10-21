import { useState } from 'react';
import { Settings as SettingsIcon, Save, Building2, Bell, Palette, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { showToast } from '@/components/Toast';

interface SettingsPageProps {
  settings: Settings | null;
  onSave: () => void;
}

export default function SettingsPage({ settings, onSave }: SettingsPageProps) {
  const [form, setForm] = useState<Partial<Settings>>(settings || {});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', settings?.id);
    setSaving(false);
    if (error) { showToast('error', 'Erro ao salvar configurações'); return; }
    showToast('success', 'Configurações salvas');
    onSave();
  };

  if (!settings) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader title="Configurações" subtitle="Dados da empresa e preferências" icon={SettingsIcon} actions={<button onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> Salvar</button>} />

      <div className="space-y-6">
        {/* Company */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><Building2 className="w-5 h-5 text-gold" /><h3 className="text-base font-semibold text-text-primary">Dados da Empresa</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label-field">Nome fantasia</label><input className="input-field" value={form.company_name || ''} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
            <div><label className="label-field">Razão social</label><input className="input-field" value={form.legal_name || ''} onChange={e => setForm(f => ({ ...f, legal_name: e.target.value }))} /></div>
            <div><label className="label-field">CNPJ/CPF</label><input className="input-field" value={form.cnpj_cpf || ''} onChange={e => setForm(f => ({ ...f, cnpj_cpf: e.target.value }))} /></div>
            <div><label className="label-field">Telefone</label><input className="input-field" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="md:col-span-2"><label className="label-field">E-mail</label><input className="input-field" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="md:col-span-2"><label className="label-field">Endereço</label><input className="input-field" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><label className="label-field">Cidade</label><input className="input-field" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><label className="label-field">Estado</label><input className="input-field" value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></div>
            <div className="md:col-span-2"><label className="label-field">URL do logotipo</label><input className="input-field" value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." /></div>
          </div>
        </div>

        {/* Regional */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5 text-gold" /><h3 className="text-base font-semibold text-text-primary">Regional</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label-field">Moeda</label><select className="input-field" value={form.currency || 'BRL'} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}><option value="BRL">Real (R$)</option><option value="USD">Dólar ($)</option><option value="EUR">Euro (€)</option></select></div>
            <div><label className="label-field">Fuso horário</label><select className="input-field" value={form.timezone || 'America/Sao_Paulo'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}><option value="America/Sao_Paulo">São Paulo (UTC-3)</option><option value="America/Manaus">Manaus (UTC-4)</option><option value="America/Recife">Recife (UTC-3)</option></select></div>
            <div><label className="label-field">Início do expediente</label><input type="time" className="input-field" value={form.work_start_time || '08:00'} onChange={e => setForm(f => ({ ...f, work_start_time: e.target.value }))} /></div>
            <div><label className="label-field">Fim do expediente</label><input type="time" className="input-field" value={form.work_end_time || '18:00'} onChange={e => setForm(f => ({ ...f, work_end_time: e.target.value }))} /></div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-gold" /><h3 className="text-base font-semibold text-text-primary">Aparência</h3></div>
          <div><label className="label-field">Tema</label><select className="input-field max-w-[200px]" value={form.theme || 'dark'} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}><option value="dark">Escuro</option><option value="light">Claro</option></select></div>
        </div>

        {/* WhatsApp */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-gold" /><h3 className="text-base font-semibold text-text-primary">Lembretes WhatsApp</h3></div>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.whatsapp_reminder_enabled ?? false} onChange={e => setForm(f => ({ ...f, whatsapp_reminder_enabled: e.target.checked }))} className="accent-gold" /><span className="text-sm text-text-secondary">Ativar lembretes</span></label>
            <div><label className="label-field">Modo</label><select className="input-field max-w-[300px]" value={form.whatsapp_reminder_mode || 'assisted'} onChange={e => setForm(f => ({ ...f, whatsapp_reminder_mode: e.target.value }))}><option value="assisted">Assistido (abrir WhatsApp com mensagem pronta)</option><option value="automatic">Automático (API WhatsApp Business)</option></select></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label-field">Antecedência padrão (dias)</label><input type="number" className="input-field" value={form.default_reminder_days || 3} onChange={e => setForm(f => ({ ...f, default_reminder_days: parseInt(e.target.value) || 3 }))} /></div>
              <div><label className="label-field">Início silêncio</label><input type="time" className="input-field" value={form.whatsapp_silence_start || '22:00'} onChange={e => setForm(f => ({ ...f, whatsapp_silence_start: e.target.value }))} /></div>
              <div><label className="label-field">Fim silêncio</label><input type="time" className="input-field" value={form.whatsapp_silence_end || '08:00'} onChange={e => setForm(f => ({ ...f, whatsapp_silence_end: e.target.value }))} /></div>
            </div>
            {form.whatsapp_reminder_mode === 'automatic' && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-bg-surface rounded-lg">
                <div><label className="label-field">Phone ID</label><input className="input-field" value={form.whatsapp_phone_id || ''} onChange={e => setForm(f => ({ ...f, whatsapp_phone_id: e.target.value }))} /></div>
                <div><label className="label-field">Business Account</label><input className="input-field" value={form.whatsapp_business_account || ''} onChange={e => setForm(f => ({ ...f, whatsapp_business_account: e.target.value }))} /></div>
                <div className="md:col-span-2"><label className="label-field">API Token</label><input type="password" className="input-field" value={form.whatsapp_api_token || ''} onChange={e => setForm(f => ({ ...f, whatsapp_api_token: e.target.value }))} placeholder="••••••••••••" /></div>
                <p className="md:col-span-2 text-xs text-text-muted">O envio automático depende de configuração externa, conta empresarial do WhatsApp Business e requisitos do Meta. Mensagens iniciadas pela empresa podem exigir modelos aprovados e podem ter custos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
