import { useState } from 'react';
import { Camera, ArrowRight, Check, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/lib/types';
import { showToast } from '@/components/Toast';

interface FirstRunWizardProps {
  settings: Settings;
  onComplete: () => void;
}

export default function FirstRunWizard({ settings, onComplete }: FirstRunWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<Settings>>({
    company_name: '', phone: '', email: '', city: '', state: '',
    work_start_time: '08:00', work_end_time: '18:00',
    default_reminder_days: 3,
  });

  const steps = ['Bem-vindo', 'Dados da empresa', 'Preferências', 'Concluído'];

  const next = () => { setStep(s => Math.min(s + 1, steps.length - 1)); };
  const prev = () => { setStep(s => Math.max(s - 1, 0)); };

  const finish = async () => {
    const { error } = await supabase.from('settings').update({
      ...form,
      first_run_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', settings.id);
    if (error) { showToast('error', 'Erro ao salvar configuração inicial'); return; }
    showToast('success', 'Configuração concluída! Bem-vindo ao FOTOGESTOR PRO');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center">
            <Camera className="w-8 h-8 text-on-gold" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-text-primary mb-2">FOTOGESTOR PRO</h1>
        <p className="text-center text-text-muted mb-8">Sistema completo de gestão para fotógrafos e profissionais de eventos</p>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-gold text-on-gold' : 'bg-bg-elevated text-text-muted'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-gold' : 'bg-bg-elevated'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {step === 0 && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-3">Bem-vindo!</h2>
              <p className="text-sm text-text-secondary mb-6">Vamos configurar o sistema em poucos passos. Você poderá alterar tudo depois nas Configurações.</p>
              <button onClick={next} className="btn-primary mx-auto">Começar <ArrowRight className="w-4 h-4" /></button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-5"><Building2 className="w-5 h-5 text-gold" /><h2 className="text-lg font-semibold text-text-primary">Dados da Empresa</h2></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="label-field">Nome da empresa ou profissional *</label><input className="input-field" value={form.company_name || ''} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Ex: Maria Silva Fotografia" /></div>
                <div><label className="label-field">Telefone</label><input className="input-field" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><label className="label-field">E-mail</label><input className="input-field" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label className="label-field">Cidade</label><input className="input-field" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div><label className="label-field">Estado</label><input className="input-field" value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={prev} className="btn-secondary">Voltar</button>
                <button onClick={next} className="btn-primary">Continuar <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-5">Preferências de Trabalho</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="label-field">Início do expediente</label><input type="time" className="input-field" value={form.work_start_time || '08:00'} onChange={e => setForm(f => ({ ...f, work_start_time: e.target.value }))} /></div>
                <div><label className="label-field">Fim do expediente</label><input type="time" className="input-field" value={form.work_end_time || '18:00'} onChange={e => setForm(f => ({ ...f, work_end_time: e.target.value }))} /></div>
                <div><label className="label-field">Antecedência de lembretes (dias)</label><input type="number" className="input-field" value={form.default_reminder_days || 3} onChange={e => setForm(f => ({ ...f, default_reminder_days: parseInt(e.target.value) || 3 }))} /></div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={prev} className="btn-secondary">Voltar</button>
                <button onClick={next} className="btn-primary">Continuar <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-400" /></div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Tudo pronto!</h2>
              <p className="text-sm text-text-secondary mb-6">O FOTOGESTOR PRO está configurado e pronto para uso. Você pode ajustar as configurações a qualquer momento.</p>
              <button onClick={finish} className="btn-primary mx-auto">Entrar no sistema <ArrowRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
