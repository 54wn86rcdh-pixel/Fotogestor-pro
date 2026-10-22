import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Clock, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useConfirm } from '@/components/ConfirmDialog';
import { showToast } from '@/components/Toast';

const categoryLabels: Record<string, string> = {
  geral: 'Geral', casamento: 'Casamento', retrato: 'Retrato',
  evento: 'Evento', comercial: 'Comercial', outros: 'Outros',
};
const categoryColors: Record<string, string> = {
  geral: '#6b7280', casamento: '#ec4899', retrato: '#3b82f6',
  evento: '#10b981', comercial: '#f59e0b', outros: '#8b5cf6',
};

const emptyForm: Partial<Service> = {
  name: '', category: 'geral', description: '', base_price: 0,
  estimated_duration_hours: 0, deliverables: '', includes: '', is_active: true, sort_order: 0,
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>(emptyForm);
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const { confirm, dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('services').select('*').order('sort_order').order('name');
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    if (categoryFilter) q = q.eq('category', categoryFilter);
    const { data } = await q;
    setServices((data as Service[]) || []);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, sort_order: services.length + 1 }); setShowModal(true); };
  const openEdit = (svc: Service) => { setEditing(svc); setForm(svc); setShowModal(true); };

  const save = async () => {
    if (!form.name?.trim()) { showToast('warning', 'Informe o nome do serviço'); return; }
    if (editing) {
      const { error } = await supabase.from('services').update(form).eq('id', editing.id);
      if (error) { showToast('error', 'Erro ao atualizar'); return; }
      showToast('success', 'Serviço atualizado');
    } else {
      const { error } = await supabase.from('services').insert(form);
      if (error) { showToast('error', 'Erro ao criar serviço'); return; }
      showToast('success', 'Serviço criado');
    }
    setShowModal(false);
    load();
  };

  const remove = async (svc: Service) => {
    const ok = await confirm({ title: 'Excluir Serviço', message: `Excluir "${svc.name}"?`, danger: true, confirmLabel: 'Excluir' });
    if (!ok) return;
    await supabase.from('services').delete().eq('id', svc.id);
    showToast('success', 'Serviço excluído');
    load();
  };

  const toggleActive = async (svc: Service) => {
    await supabase.from('services').update({ is_active: !svc.is_active }).eq('id', svc.id);
    load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {dialog}
      <PageHeader title="Serviços" subtitle={`${services.length} serviço(s) cadastrado(s)`} icon={Package} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Serviço</button>} />

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input placeholder="Buscar serviços..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field max-w-[180px]">
          <option value="">Todas as categorias</option>
          {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-bg-elevated rounded-xl" />)}</div>
      ) : services.length === 0 ? (
        <EmptyState icon={<Package className="w-8 h-8 text-text-muted" />} title="Nenhum serviço" description="Cadastre seus serviços e pacotes fotográficos." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Serviço</button>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc.id} className={`card p-5 ${!svc.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="badge" style={{ backgroundColor: `${categoryColors[svc.category] || '#6b7280'}20`, color: categoryColors[svc.category] || '#6b7280' }}>
                  {categoryLabels[svc.category] || svc.category}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewService(svc)} className="p-1.5 hover:bg-border-hover rounded-md" title="Visualizar"><Eye className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => openEdit(svc)} className="p-1.5 hover:bg-border-hover rounded-md"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => remove(svc)} className="p-1.5 hover:bg-red-600/20 rounded-md"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1">{svc.name}</h3>
              {svc.description && <p className="text-xs text-text-muted mb-3 line-clamp-2">{svc.description}</p>}
              <div className="space-y-1.5 text-sm text-text-secondary mb-3">
                <div className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-text-muted" /> {formatCurrency(svc.base_price)}</div>
                {svc.estimated_duration_hours && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-text-muted" /> {svc.estimated_duration_hours}h estimadas</div>}
                {svc.deliverables && <p className="text-xs text-text-muted line-clamp-2">{svc.deliverables}</p>}
              </div>
              <button onClick={() => toggleActive(svc)} className={`text-xs flex items-center gap-1.5 ${svc.is_active ? 'text-green-400' : 'text-text-muted'}`}>
                <CheckCircle className="w-3.5 h-3.5" /> {svc.is_active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'} size="lg" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label-field">Nome do serviço *</label><input className="input-field" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label-field">Categoria</label><select className="input-field" value={form.category || 'geral'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label-field">Preço base</label><input type="number" className="input-field" value={form.base_price || 0} onChange={e => setForm(f => ({ ...f, base_price: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Duração estimada (horas)</label><input type="number" step="0.5" className="input-field" value={form.estimated_duration_hours || 0} onChange={e => setForm(f => ({ ...f, estimated_duration_hours: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Ordem</label><input type="number" className="input-field" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Descrição</label><textarea className="input-field min-h-[60px]" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">O que inclui</label><textarea className="input-field min-h-[60px]" value={form.includes || ''} onChange={e => setForm(f => ({ ...f, includes: e.target.value }))} placeholder="Detalhe o que está incluso no serviço..." /></div>
          <div className="md:col-span-2"><label className="label-field">Entregáveis</label><textarea className="input-field min-h-[60px]" value={form.deliverables || ''} onChange={e => setForm(f => ({ ...f, deliverables: e.target.value }))} placeholder="O que o cliente recebe ao final..." /></div>
          <div><label className="label-field">Status</label><select className="input-field" value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}><option value="true">Ativo</option><option value="false">Inativo</option></select></div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewService} onClose={() => setPreviewService(null)} title={previewService?.name || ''} size="md" footer={<button onClick={() => { setPreviewService(null); if (previewService) openEdit(previewService); }} className="btn-primary"><Edit2 className="w-3.5 h-3.5" /> Editar</button>}>
        {previewService && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="badge" style={{ backgroundColor: `${categoryColors[previewService.category] || '#6b7280'}20`, color: categoryColors[previewService.category] || '#6b7280' }}>{categoryLabels[previewService.category] || previewService.category}</span>
              <span className="text-lg font-bold text-gold">{formatCurrency(previewService.base_price)}</span>
              {previewService.estimated_duration_hours ? <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {previewService.estimated_duration_hours}h</span> : null}
            </div>
            {previewService.description && <div><p className="text-xs font-semibold text-text-muted uppercase mb-1">Descrição</p><p className="text-sm text-text-secondary">{previewService.description}</p></div>}
            {previewService.includes && <div className="p-4 bg-bg-surface rounded-lg"><p className="text-xs font-semibold text-text-muted uppercase mb-2">O que inclui</p><p className="text-sm text-text-secondary whitespace-pre-wrap">{previewService.includes}</p></div>}
            {previewService.deliverables && <div className="p-4 bg-bg-surface rounded-lg"><p className="text-xs font-semibold text-text-muted uppercase mb-2">Entregáveis</p><p className="text-sm text-text-secondary whitespace-pre-wrap">{previewService.deliverables}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
