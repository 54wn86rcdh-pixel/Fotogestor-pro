import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Document, Client, Event } from '@/lib/types';
import { formatDate, todayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyForm: Partial<Document> = {
  title: '', type: 'contract', client_id: '', event_id: '', file_url: '',
  file_path: '', description: '', generated_at: todayISO(),
};

const typeLabels: Record<string, string> = {
  contract: 'Contrato', quote: 'Orçamento', invoice: 'Nota Fiscal', receipt: 'Recibo', model_release: 'Cessão de Imagem', brief: 'Briefing', other: 'Outro',
};

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState<Partial<Document>>(emptyForm);
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    const [dRes, cRes, eRes] = await Promise.all([
      supabase.from('documents').select('*').order('generated_at', { ascending: false }),
      supabase.from('clients').select('id, name'),
      supabase.from('events').select('id, name'),
    ]);
    setDocs((dRes.data as Document[]) || []);
    setClients((cRes.data as Client[]) || []);
    setEvents((eRes.data as Event[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const clientName = (id: string | null) => clients.find(c => c.id === id)?.name || '-';
  const eventName = (id: string | null) => events.find(e => e.id === id)?.name || '-';

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, generated_at: todayISO() }); setShowModal(true); };
  const openEdit = (d: Document) => { setEditing(d); setForm(d); setShowModal(true); };

  const save = async () => {
    if (!form.title?.trim()) { showToast('warning', 'Informe o título'); return; }
    if (editing) { await supabase.from('documents').update(form).eq('id', editing.id); showToast('success', 'Documento atualizado'); }
    else { await supabase.from('documents').insert(form); showToast('success', 'Documento registrado'); }
    setShowModal(false); load();
  };

  const remove = async (d: Document) => {
    await supabase.from('documents').delete().eq('id', d.id);
    showToast('success', 'Documento excluída'); load();
  };

  const filtered = filterType ? docs.filter(d => d.type === filterType) : docs;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Documentos" subtitle={`${docs.length} documento(s)`} icon={FileText} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Novo Documento</button>} />
      {loading ? <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-xl" />)}</div> : docs.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8 text-text-muted" />} title="Nenhum documento" description="Registre contratos, notas fiscais, recibos e cessões de imagem." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Registrar Documento</button>} />
      ) : (
        <>
          <div className="flex items-center gap-1 bg-bg-elevated border border-border-hover rounded-lg p-1 mb-5 w-fit overflow-x-auto">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${!filterType ? 'bg-gold text-on-gold' : 'text-text-secondary hover:text-text-primary'}`}>Todos</button>
            {Object.entries(typeLabels).map(([k, label]) => (
              <button key={k} onClick={() => setFilterType(k)} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${filterType === k ? 'bg-gold text-on-gold' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border-base text-left">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Título</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase hidden lg:table-cell">Evento</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Data</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border-base">
                {filtered.map(d => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{d.title}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="badge bg-bg-hover text-text-secondary">{typeLabels[d.type] || d.type}</span></td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden md:table-cell">{clientName(d.client_id)}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary hidden lg:table-cell">{eventName(d.event_id)}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{formatDate(d.generated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {d.file_url && <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-hover"><ExternalLink className="w-3.5 h-3.5" /></a>}
                        <button onClick={() => openEdit(d)} className="p-1 hover:bg-border-hover rounded"><Edit2 className="w-3.5 h-3.5 text-text-muted" /></button>
                        <button onClick={() => remove(d)} className="p-1 hover:bg-red-600/20 rounded"><Trash2 className="w-3.5 h-3.5 text-text-muted" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Documento' : 'Novo Documento'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="space-y-4">
          <div><label className="label-field">Título *</label><input className="input-field" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label-field">Tipo</label><select className="input-field" value={form.type || 'other'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{Object.entries(typeLabels).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></div>
          <div><label className="label-field">Cliente</label><select className="input-field" value={form.client_id || ''} onChange={e => setForm(f => ({ ...f, client_id: e.target.value || null }))}><option value="">Nenhum</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label-field">Evento</label><select className="input-field" value={form.event_id || ''} onChange={e => setForm(f => ({ ...f, event_id: e.target.value || null }))}><option value="">Nenhum</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></div>
          <div><label className="label-field">URL do arquivo</label><input className="input-field" value={form.file_url || ''} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." /></div>
          <div><label className="label-field">Caminho do arquivo</label><input className="input-field" value={form.file_path || ''} onChange={e => setForm(f => ({ ...f, file_path: e.target.value }))} placeholder="Ex: /documentos/contrato-001.pdf" /></div>
          <div><label className="label-field">Descrição</label><textarea className="input-field min-h-[60px]" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label-field">Data de geração</label><input type="date" className="input-field" value={form.generated_at?.split('T')[0] || ''} onChange={e => setForm(f => ({ ...f, generated_at: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
