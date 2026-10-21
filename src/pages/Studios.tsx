import { useEffect, useState, useCallback } from 'react';
import { MapPin, Plus, Trash2, Edit2, Car, Accessibility } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { StudioLocation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyForm: Partial<StudioLocation> = {
  name: '', type: 'studio', address: '', contact_phone: '', rules: '',
  rental_value: 0, available_hours: '', restrictions: '', parking: false,
  accessibility: false, notes: '',
};

const typeLabels: Record<string, string> = {
  studio: 'Estúdio', location: 'Local Externo', office: 'Escritório', warehouse: 'Armazém',
};

export default function Studios() {
  const [studios, setStudios] = useState<StudioLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StudioLocation | null>(null);
  const [form, setForm] = useState<Partial<StudioLocation>>(emptyForm);

  const load = useCallback(async () => {
    const { data } = await supabase.from('studios_locations').select('*').order('name');
    setStudios((data as StudioLocation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: StudioLocation) => { setEditing(s); setForm(s); setShowModal(true); };

  const save = async () => {
    if (!form.name?.trim()) { showToast('warning', 'Informe o nome'); return; }
    if (editing) { await supabase.from('studios_locations').update(form).eq('id', editing.id); showToast('success', 'Local atualizado'); }
    else { await supabase.from('studios_locations').insert(form); showToast('success', 'Local cadastrado'); }
    setShowModal(false); load();
  };

  const remove = async (s: StudioLocation) => {
    await supabase.from('studios_locations').delete().eq('id', s.id);
    showToast('success', 'Local excluído'); load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Estúdios e Locais" subtitle={`${studios.length} local(is)`} icon={MapPin} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Local</button>} />
      {loading ? <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-bg-elevated rounded-xl" />)}</div> : studios.length === 0 ? (
        <EmptyState icon={<MapPin className="w-8 h-8 text-text-muted" />} title="Nenhum local" description="Cadastre estúdios, locais de ensaio e escritórios." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Cadastrar Local</button>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studios.map(s => (
            <div key={s.id} className="card card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{s.name}</h3>
                  <span className="badge bg-bg-hover text-text-secondary mt-1">{typeLabels[s.type] || s.type}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-border-hover rounded-md"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => remove(s)} className="p-1.5 hover:bg-red-600/20 rounded-md"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-text-secondary">
                {s.address && <p className="text-xs text-text-muted">{s.address}</p>}
                {s.contact_phone && <p className="text-xs">{s.contact_phone}</p>}
                {s.available_hours && <p className="text-xs text-text-muted">Horário: {s.available_hours}</p>}
                {s.rental_value != null && s.rental_value > 0 && (
                  <div className="flex justify-between pt-2"><span className="text-text-muted">Aluguel</span><span className="text-gold font-medium">{formatCurrency(s.rental_value)}</span></div>
                )}
                <div className="flex gap-3 pt-2">
                  {s.parking && <span className="flex items-center gap-1 text-xs text-green-400"><Car className="w-3 h-3" /> Estacionamento</span>}
                  {s.accessibility && <span className="flex items-center gap-1 text-xs text-green-400"><Accessibility className="w-3 h-3" /> Acessível</span>}
                </div>
                {s.rules && <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border-base">Regras: {s.rules}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Local' : 'Novo Local'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label-field">Nome *</label><input className="input-field" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label-field">Tipo</label><select className="input-field" value={form.type || 'studio'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="studio">Estúdio</option><option value="location">Local Externo</option><option value="office">Escritório</option><option value="warehouse">Armazém</option></select></div>
          <div><label className="label-field">Aluguel</label><input type="number" className="input-field" value={form.rental_value || 0} onChange={e => setForm(f => ({ ...f, rental_value: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Endereço</label><input className="input-field" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div><label className="label-field">Telefone</label><input className="input-field" value={form.contact_phone || ''} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} /></div>
          <div><label className="label-field">Horários</label><input className="input-field" value={form.available_hours || ''} onChange={e => setForm(f => ({ ...f, available_hours: e.target.value }))} placeholder="Ex: 8h às 22h" /></div>
          <div className="md:col-span-2"><label className="label-field">Regras</label><textarea className="input-field min-h-[50px]" value={form.rules || ''} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Restrições</label><input className="input-field" value={form.restrictions || ''} onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Observações</label><textarea className="input-field min-h-[50px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="md:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.parking ?? false} onChange={e => setForm(f => ({ ...f, parking: e.target.checked }))} className="accent-gold" /><span className="text-sm text-text-secondary">Estacionamento</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.accessibility ?? false} onChange={e => setForm(f => ({ ...f, accessibility: e.target.checked }))} className="accent-gold" /><span className="text-sm text-text-secondary">Acessibilidade</span></label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
