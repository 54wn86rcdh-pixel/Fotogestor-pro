import { useEffect, useState, useCallback } from 'react';
import { Plus, Store, Trash2, Edit2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Supplier } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyForm: Partial<Supplier> = {
  name: '', service_type: '', contact_person: '', phone: '', email: '',
  address: '', typical_prices: '', typical_deadlines: '', internal_rating: 3, notes: '',
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>(emptyForm);

  const load = useCallback(async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    setSuppliers((data as Supplier[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setShowModal(true); };

  const save = async () => {
    if (!form.name?.trim()) { showToast('warning', 'Informe o nome'); return; }
    if (editing) { await supabase.from('suppliers').update(form).eq('id', editing.id); showToast('success', 'Fornecedor atualizado'); }
    else { await supabase.from('suppliers').insert(form); showToast('success', 'Fornecedor cadastrado'); }
    setShowModal(false); load();
  };

  const remove = async (s: Supplier) => { await supabase.from('suppliers').delete().eq('id', s.id); showToast('success', 'Fornecedor excluído'); load(); };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Fornecedores" subtitle={`${suppliers.length} fornecedor(es)`} icon={Store} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Fornecedor</button>} />
      {loading ? <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-bg-elevated rounded-xl" />)}</div> : suppliers.length === 0 ? <EmptyState icon={<Store className="w-8 h-8 text-text-muted" />} title="Nenhum fornecedor" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar</button>} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="card card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{s.name}</h3>
                  {s.service_type && <p className="text-xs text-text-muted mt-0.5">{s.service_type}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-border-hover rounded-md"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => remove(s)} className="p-1.5 hover:bg-red-600/20 rounded-md"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-text-secondary">
                {s.contact_person && <p className="text-xs">{s.contact_person}</p>}
                {s.phone && <p>{s.phone}</p>}
                {s.email && <p className="text-xs">{s.email}</p>}
                {s.typical_prices && <p className="text-xs text-text-muted mt-2">Preços: {s.typical_prices}</p>}
                {s.typical_deadlines && <p className="text-xs text-text-muted">Prazos: {s.typical_deadlines}</p>}
              </div>
              {s.internal_rating != null && (
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${n <= (s.internal_rating || 0) ? 'text-gold fill-[#c9a961]' : 'text-text-faint'}`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Fornecedor' : 'Novo Fornecedor'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label-field">Nome *</label><input className="input-field" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label-field">Tipo de serviço</label><input className="input-field" value={form.service_type || ''} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} /></div>
          <div><label className="label-field">Pessoa de contato</label><input className="input-field" value={form.contact_person || ''} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
          <div><label className="label-field">Telefone</label><input className="input-field" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label-field">E-mail</label><input className="input-field" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Endereço</label><input className="input-field" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div><label className="label-field">Preços típicos</label><input className="input-field" value={form.typical_prices || ''} onChange={e => setForm(f => ({ ...f, typical_prices: e.target.value }))} /></div>
          <div><label className="label-field">Prazos típicos</label><input className="input-field" value={form.typical_deadlines || ''} onChange={e => setForm(f => ({ ...f, typical_deadlines: e.target.value }))} /></div>
          <div><label className="label-field">Avaliação interna (1-5)</label><input type="number" min={1} max={5} className="input-field" value={form.internal_rating || 3} onChange={e => setForm(f => ({ ...f, internal_rating: parseInt(e.target.value) || 3 }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Observações</label><textarea className="input-field min-h-[60px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
