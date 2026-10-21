import { useEffect, useState, useCallback } from 'react';
import { Plus, Users2, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const roles = ['photographer', 'videographer', 'assistant', 'editor', 'designer', 'driver', 'other'];
const roleLabels: Record<string, string> = { photographer: 'Fotógrafo', videographer: 'Videomaker', assistant: 'Assistente', editor: 'Editor', designer: 'Designer', driver: 'Motorista', other: 'Outro' };

const emptyForm: Partial<TeamMember> = {
  name: '', role: 'photographer', specialty: '', phone: '', email: '',
  availability: '', rate_per_service: 0, commission_percentage: 0, notes: '', is_active: true,
};

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<Partial<TeamMember>>(emptyForm);

  const load = useCallback(async () => {
    const { data } = await supabase.from('team_members').select('*').order('name');
    setMembers((data as TeamMember[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setForm(m); setShowModal(true); };

  const save = async () => {
    if (!form.name?.trim()) { showToast('warning', 'Informe o nome'); return; }
    if (editing) { await supabase.from('team_members').update(form).eq('id', editing.id); showToast('success', 'Membro atualizado'); }
    else { await supabase.from('team_members').insert(form); showToast('success', 'Membro cadastrado'); }
    setShowModal(false); load();
  };

  const remove = async (m: TeamMember) => { await supabase.from('team_members').delete().eq('id', m.id); showToast('success', 'Membro excluído'); load(); };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Equipe" subtitle={`${members.length} membro(s)`} icon={Users2} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Membro</button>} />
      {loading ? <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-bg-elevated rounded-xl" />)}</div> : members.length === 0 ? <EmptyState icon={<Users2 className="w-8 h-8 text-text-muted" />} title="Nenhum membro" action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar</button>} /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="card card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border-hover flex items-center justify-center text-sm font-semibold text-gold">{m.name.charAt(0).toUpperCase()}</div>
                  <div><h3 className="text-sm font-semibold text-text-primary">{m.name}</h3><span className="badge bg-bg-hover text-text-secondary mt-1">{roleLabels[m.role] || m.role}</span></div>
                </div>
                <div className="flex gap-1"><button onClick={() => openEdit(m)} className="p-1.5 hover:bg-border-hover rounded-md"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button><button onClick={() => remove(m)} className="p-1.5 hover:bg-red-600/20 rounded-md"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button></div>
              </div>
              <div className="space-y-1 text-sm text-text-secondary">
                {m.specialty && <p className="text-xs text-text-muted">Especialidade: {m.specialty}</p>}
                {m.phone && <p>{m.phone}</p>}
                {m.email && <p className="text-xs">{m.email}</p>}
                <div className="flex justify-between pt-2"><span className="text-text-muted">Valor/serviço</span><span>{formatCurrency(m.rate_per_service)}</span></div>
                {m.commission_percentage > 0 && <div className="flex justify-between"><span className="text-text-muted">Comissão</span><span>{m.commission_percentage}%</span></div>}
              </div>
              <div className="mt-3"><span className={`badge ${m.is_active ? 'bg-green-600/20 text-green-400' : 'bg-bg-hover text-text-muted'}`}>{m.is_active ? 'Ativo' : 'Inativo'}</span></div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Membro' : 'Novo Membro'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label-field">Nome *</label><input className="input-field" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label-field">Função</label><select className="input-field" value={form.role || 'photographer'} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>{roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}</select></div>
          <div><label className="label-field">Especialidade</label><input className="input-field" value={form.specialty || ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
          <div><label className="label-field">Telefone</label><input className="input-field" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label-field">E-mail</label><input className="input-field" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label-field">Valor por serviço</label><input type="number" className="input-field" value={form.rate_per_service || 0} onChange={e => setForm(f => ({ ...f, rate_per_service: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label-field">Comissão (%)</label><input type="number" className="input-field" value={form.commission_percentage || 0} onChange={e => setForm(f => ({ ...f, commission_percentage: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Disponibilidade</label><input className="input-field" value={form.availability || ''} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="label-field">Observações</label><textarea className="input-field min-h-[60px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="md:col-span-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-gold" /><span className="text-sm text-text-secondary">Membro ativo</span></label></div>
        </div>
      </Modal>
    </div>
  );
}
