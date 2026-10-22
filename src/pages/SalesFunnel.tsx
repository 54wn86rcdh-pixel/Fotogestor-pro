import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Plus, Trash2, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SalesFunnelStage, SalesLead, Client } from '@/lib/types';
import { formatCurrency, formatDate, todayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyLead: Partial<SalesLead> = {
  client_id: '', source: '', description: '', estimated_value: 0,
  last_contact_date: '', next_contact_date: '', notes: '',
};

export default function SalesFunnel() {
  const [stages, setStages] = useState<SalesFunnelStage[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SalesLead | null>(null);
  const [form, setForm] = useState<Partial<SalesLead>>(emptyLead);
  const [formStageId, setFormStageId] = useState<string>('');

  const load = useCallback(async () => {
    const [stRes, leadRes, clRes] = await Promise.all([
      supabase.from('sales_funnel_stages').select('*').order('sort_order'),
      supabase.from('sales_leads').select('*'),
      supabase.from('clients').select('id, name'),
    ]);
    setStages((stRes.data as SalesFunnelStage[]) || []);
    setLeads((leadRes.data as SalesLead[]) || []);
    setClients((clRes.data as Client[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const clientName = (id: string | null) => clients.find(c => c.id === id)?.name || 'Lead sem cliente';

  const openNew = (stageId: string) => {
    setEditing(null);
    setForm({ ...emptyLead, last_contact_date: todayISO() });
    setFormStageId(stageId);
    setShowModal(true);
  };

  const openEdit = (lead: SalesLead) => {
    setEditing(lead);
    setForm(lead);
    setFormStageId(lead.stage_id || '');
    setShowModal(true);
  };

  const save = async () => {
    if (editing) {
      await supabase.from('sales_leads').update({ ...form, stage_id: formStageId || null }).eq('id', editing.id);
      showToast('success', 'Lead atualizado');
    } else {
      await supabase.from('sales_leads').insert({ ...form, stage_id: formStageId || null });
      showToast('success', 'Lead criado');
    }
    setShowModal(false);
    load();
  };

  const moveLead = async (lead: SalesLead, newStageId: string) => {
    await supabase.from('sales_leads').update({ stage_id: newStageId }).eq('id', lead.id);
    load();
  };

  const remove = async (lead: SalesLead) => {
    await supabase.from('sales_leads').delete().eq('id', lead.id);
    showToast('success', 'Lead excluído');
    load();
  };

  const totalValue = leads.reduce((s, l) => s + (l.estimated_value || 0), 0);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-bg-elevated rounded-xl" />)}</div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Funil de Vendas" subtitle={`${leads.length} leads · ${formatCurrency(totalValue)} em pipeline`} icon={TrendingUp} />
      {leads.length === 0 && stages.length === 0 ? (
        <EmptyState icon={<TrendingUp className="w-8 h-8 text-text-muted" />} title="Nenhum lead" description="Adicione leads ao funil de vendas para acompanhar negociações." />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {stages.map(stage => {
              const stageLeads = leads.filter(l => l.stage_id === stage.id);
              const stageValue = stageLeads.reduce((s, l) => s + (l.estimated_value || 0), 0);
              return (
                <div key={stage.id} className="w-72 flex-shrink-0">
                  <div className="card p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="text-sm font-semibold text-text-primary">{stage.name}</h3>
                      </div>
                      <span className="badge bg-bg-hover text-text-secondary">{stageLeads.length}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">{formatCurrency(stageValue)}</p>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map(lead => (
                      <div key={lead.id} className="card card-hover p-3 cursor-pointer" onClick={() => openEdit(lead)}>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-text-primary flex-1 min-w-0 truncate">{clientName(lead.client_id)}</h4>
                          <button onClick={e => { e.stopPropagation(); remove(lead); }} className="text-text-faint hover:text-red-400 ml-1"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        {lead.description && <p className="text-xs text-text-muted mb-1">{lead.description}</p>}
                        <p className="text-xs text-gold font-medium">{formatCurrency(lead.estimated_value)}</p>
                        {lead.source && <p className="text-xs text-text-muted mt-1">Origem: {lead.source}</p>}
                        {lead.next_contact_date && <p className="text-xs text-amber-400 mt-1">Próx. contato: {formatDate(lead.next_contact_date)}</p>}
                        {stage.sort_order < stages.length - 1 && (
                          <button onClick={e => { e.stopPropagation(); moveLead(lead, stages[stage.sort_order + 1].id); }} className="mt-2 w-full text-xs text-text-muted hover:text-gold flex items-center justify-center gap-1 py-1 border-t border-border-base pt-2 transition-colors">
                            Mover para {stages[stage.sort_order + 1].name} <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => openNew(stage.id)} className="w-full text-xs text-text-muted hover:text-gold py-2 border border-dashed border-border-hover rounded-lg transition-colors">
                      <Plus className="w-3 h-3 inline mr-1" /> Adicionar lead
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Lead' : 'Novo Lead'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="space-y-4">
          <div><label className="label-field">Cliente</label><select className="input-field" value={form.client_id || ''} onChange={e => setForm(f => ({ ...f, client_id: e.target.value || null }))}><option value="">Sem cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label-field">Estágio</label><select className="input-field" value={formStageId} onChange={e => setFormStageId(e.target.value)}>{stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label-field">Descrição</label><input className="input-field" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label-field">Origem</label><input className="input-field" value={form.source || ''} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Instagram, indicação, Google..." /></div>
          <div><label className="label-field">Valor estimado</label><input type="number" className="input-field" value={form.estimated_value || 0} onChange={e => setForm(f => ({ ...f, estimated_value: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label-field">Último contato</label><input type="date" className="input-field" value={form.last_contact_date || ''} onChange={e => setForm(f => ({ ...f, last_contact_date: e.target.value || null }))} /></div>
            <div><label className="label-field">Próximo contato</label><input type="date" className="input-field" value={form.next_contact_date || ''} onChange={e => setForm(f => ({ ...f, next_contact_date: e.target.value || null }))} /></div>
          </div>
          <div><label className="label-field">Observações</label><textarea className="input-field min-h-[60px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
