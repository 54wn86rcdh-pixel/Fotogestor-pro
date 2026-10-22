import { useEffect, useState, useCallback } from 'react';
import { Plus, Image, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/lib/types';
import { formatCurrency, formatDate, todayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyForm: Partial<Campaign> = {
  name: '', objective: '', target_audience: '', promo_start_date: '', promo_end_date: '',
  execution_start_date: '', execution_end_date: '', services: '', sale_price: 0,
  estimated_costs: 0, expected_margin: 0, revenue_goal: 0, profit_goal: 0,
  sales_goal: 0, available_slots: 0, channels: '', marketing_budget: 0,
  actual_revenue: 0, actual_costs: 0, actual_sales: 0, notes: '',
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>(emptyForm);

  const load = useCallback(async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, promo_start_date: todayISO() }); setShowModal(true); };
  const openEdit = (c: Campaign) => { setEditing(c); setForm(c); setShowModal(true); };

  const save = async () => {
    if (!form.name?.trim()) { showToast('warning', 'Informe o nome da campanha'); return; }
    if (editing) { await supabase.from('campaigns').update(form).eq('id', editing.id); showToast('success', 'Campanha atualizada'); }
    else { await supabase.from('campaigns').insert(form); showToast('success', 'Campanha criada'); }
    setShowModal(false); load();
  };

  const remove = async (c: Campaign) => { await supabase.from('campaigns').delete().eq('id', c.id); showToast('success', 'Campanha excluída'); load(); };

  const requiredSales = form.sale_price && form.sale_price > 0 ? Math.ceil((form.revenue_goal || 0) / form.sale_price) : 0;
  const feasible = requiredSales <= (form.available_slots || 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Campanhas" subtitle={`${campaigns.length} campanha(s)`} icon={Image} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nova Campanha</button>} />
      {loading ? <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-bg-elevated rounded-xl" />)}</div> : campaigns.length === 0 ? <EmptyState icon={<Image className="w-8 h-8 text-text-muted" />} title="Nenhuma campanha" description="Planeje campanhas sazonais e promocionais." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Criar Campanha</button>} /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map(c => {
            const reqSales = c.sale_price > 0 ? Math.ceil(c.revenue_goal / c.sale_price) : 0;
            const feasible = reqSales <= c.available_slots;
            return (
              <div key={c.id} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-text-primary">{c.name}</h3>
                  <div className="flex gap-1"><button onClick={() => openEdit(c)} className="p-1.5 hover:bg-border-hover rounded-md"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button><button onClick={() => remove(c)} className="p-1.5 hover:bg-red-600/20 rounded-md"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button></div>
                </div>
                {c.objective && <p className="text-xs text-text-muted mb-3">{c.objective}</p>}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-muted">Período</span><span className="text-text-secondary">{formatDate(c.promo_start_date)} - {formatDate(c.promo_end_date)}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Preço de venda</span><span className="text-text-secondary">{formatCurrency(c.sale_price)}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Meta de faturamento</span><span className="text-gold font-medium">{formatCurrency(c.revenue_goal)}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Vendas necessárias</span><span className={feasible ? 'text-green-400' : 'text-red-400'}>{reqSales} / {c.available_slots} vagas</span></div>
                  {c.actual_sales > 0 && <div className="flex justify-between"><span className="text-text-muted">Vendas reais</span><span className="text-green-400">{c.actual_sales}</span></div>}
                </div>
                {!feasible && reqSales > 0 && <div className="mt-3 p-2 bg-amber-600/10 border border-amber-600/20 rounded-lg"><p className="text-xs text-amber-400">Meta exige mais sessões que a capacidade. Ajuste o preço ou amplie o período.</p></div>}
              </div>
            );
          })}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Campanha' : 'Nova Campanha'} size="lg" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label-field">Nome *</label><input className="input-field" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Objetivo</label><input className="input-field" value={form.objective || ''} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} /></div>
          <div><label className="label-field">Público-alvo</label><input className="input-field" value={form.target_audience || ''} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} /></div>
          <div><label className="label-field">Serviços</label><input className="input-field" value={form.services || ''} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} /></div>
          <div><label className="label-field">Início divulgação</label><input type="date" className="input-field" value={form.promo_start_date || ''} onChange={e => setForm(f => ({ ...f, promo_start_date: e.target.value || null }))} /></div>
          <div><label className="label-field">Fim divulgação</label><input type="date" className="input-field" value={form.promo_end_date || ''} onChange={e => setForm(f => ({ ...f, promo_end_date: e.target.value || null }))} /></div>
          <div><label className="label-field">Preço de venda</label><input type="number" className="input-field" value={form.sale_price || 0} onChange={e => setForm(f => ({ ...f, sale_price: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Custos estimados</label><input type="number" className="input-field" value={form.estimated_costs || 0} onChange={e => setForm(f => ({ ...f, estimated_costs: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Meta faturamento</label><input type="number" className="input-field" value={form.revenue_goal || 0} onChange={e => setForm(f => ({ ...f, revenue_goal: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Meta lucro</label><input type="number" className="input-field" value={form.profit_goal || 0} onChange={e => setForm(f => ({ ...f, profit_goal: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Vagas disponíveis</label><input type="number" className="input-field" value={form.available_slots || 0} onChange={e => setForm(f => ({ ...f, available_slots: parseInt(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Orçamento marketing</label><input type="number" className="input-field" value={form.marketing_budget || 0} onChange={e => setForm(f => ({ ...f, marketing_budget: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Canais de divulgação</label><input className="input-field" value={form.channels || ''} onChange={e => setForm(f => ({ ...f, channels: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Observações</label><textarea className="input-field min-h-[60px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          {requiredSales > 0 && (
            <div className="md:col-span-2 p-4 bg-bg-surface rounded-lg">
              <p className="text-sm text-text-secondary">Vendas necessárias para meta: <span className={feasible ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{requiredSales}</span> sessões</p>
              <p className="text-xs text-text-muted mt-1">Capacidade: {form.available_slots} vagas {feasible ? '(viável)' : '(insuficiente)'}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
