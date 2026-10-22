import { useEffect, useState, useCallback } from 'react';
import { Plus, CheckSquare, X, Calendar, Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskList } from '@/lib/types';
import { formatDate, todayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';

const emptyForm: Partial<Task> = {
  title: '', description: '', list_id: '', priority: 'medium', status: 'todo',
  due_date: '', notes: '',
};

const priorityColors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };
const priorityLabels: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const statusLabels: Record<string, string> = { todo: 'A Fazer', in_progress: 'Em Andamento', done: 'Concluída' };

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filterList, setFilterList] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>(emptyForm);

  const load = useCallback(async () => {
    const [tRes, lRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('task_lists').select('*'),
    ]);
    setTasks((tRes.data as Task[]) || []);
    setLists((lRes.data as TaskList[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const listName = (id: string | null) => lists.find(l => l.id === id)?.name || 'Sem lista';
  const listColor = (id: string | null) => lists.find(l => l.id === id)?.color || '#6b7280';

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, due_date: todayISO() }); setShowModal(true); };
  const openEdit = (task: Task) => { setEditing(task); setForm(task); setShowModal(true); };

  const save = async () => {
    if (!form.title?.trim()) { showToast('warning', 'Informe o título'); return; }
    if (editing) {
      await supabase.from('tasks').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
      showToast('success', 'Tarefa atualizada');
    } else {
      await supabase.from('tasks').insert(form);
      showToast('success', 'Tarefa criada');
    }
    setShowModal(false);
    load();
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    showToast('success', 'Tarefa excluída');
    load();
  };

  const filtered = filterList ? tasks.filter(t => t.list_id === filterList) : tasks;
  const kanbanColumns = ['todo', 'in_progress', 'done'];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Tarefas" subtitle={`${tasks.length} tarefa(s)`} icon={CheckSquare} actions={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nova Tarefa</button>} />

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <select value={filterList} onChange={e => setFilterList(e.target.value)} className="input-field max-w-[200px]">
          <option value="">Todas as listas</option>
          {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-bg-elevated border border-border-hover rounded-lg p-1">
          {(['list', 'kanban'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === v ? 'bg-gold text-on-gold' : 'text-text-secondary'}`}>{v === 'list' ? 'Lista' : 'Kanban'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CheckSquare className="w-8 h-8 text-text-muted" />} title="Nenhuma tarefa" description="Crie sua primeira tarefa para se organizar." action={<button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nova Tarefa</button>} />
      ) : view === 'list' ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-base text-left">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase w-10"></th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Tarefa</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase hidden md:table-cell">Lista</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase hidden md:table-cell">Prazo</th>
                <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase">Prioridade</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {filtered.map(task => {
                const isOverdue = task.due_date && task.due_date < todayISO() && task.status !== 'done';
                return (
                  <tr key={task.id} className="table-row-hover cursor-pointer" onClick={() => openEdit(task)}>
                    <td className="px-4 py-3"><button onClick={e => { e.stopPropagation(); toggleStatus(task); }} className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'done' ? 'bg-gold border-gold' : 'border-border-hover hover:border-gold'}`}>{task.status === 'done' && <CheckSquare className="w-3 h-3 text-on-gold" />}</button></td>
                    <td className="px-4 py-3"><span className={`text-sm font-medium ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="badge" style={{ backgroundColor: `${listColor(task.list_id)}20`, color: listColor(task.list_id) }}>{listName(task.list_id)}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm"><span className={isOverdue ? 'text-red-400' : 'text-text-secondary'}>{formatDate(task.due_date)}</span></td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-xs" style={{ color: priorityColors[task.priority] }}><Flag className="w-3 h-3" /> {priorityLabels[task.priority]}</span></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}><button onClick={() => remove(task.id)} className="text-xs text-text-muted hover:text-red-400">Excluir</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">{statusLabels[col]}</h3>
                  <span className="badge bg-bg-hover text-text-secondary">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => {
                    const isOverdue = task.due_date && task.due_date < todayISO() && task.status !== 'done';
                    return (
                      <div key={task.id} className="p-3 bg-bg-surface rounded-lg cursor-pointer hover:bg-bg-hover transition-colors" onClick={() => openEdit(task)}>
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</p>
                          <button onClick={e => { e.stopPropagation(); remove(task.id); }} className="text-text-faint hover:text-red-400 ml-2"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                          <span className="text-xs text-text-muted">{listName(task.list_id)}</span>
                          {task.due_date && <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-text-muted'}`}><Calendar className="w-3 h-3 inline mr-1" />{formatDate(task.due_date)}</span>}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <p className="text-xs text-text-faint text-center py-4">Vazio</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Tarefa' : 'Nova Tarefa'} size="md" footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button onClick={save} className="btn-primary">Salvar</button></>}>
        <div className="space-y-4">
          <div><label className="label-field">Título *</label><input className="input-field" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label-field">Descrição</label><textarea className="input-field min-h-[60px]" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label-field">Lista</label><select className="input-field" value={form.list_id || ''} onChange={e => setForm(f => ({ ...f, list_id: e.target.value || null }))}><option value="">Sem lista</option>{lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label className="label-field">Status</label><select className="input-field" value={form.status || 'todo'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="todo">A Fazer</option><option value="in_progress">Em Andamento</option><option value="done">Concluída</option></select></div>
            <div><label className="label-field">Prioridade</label><select className="input-field" value={form.priority || 'medium'} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></div>
            <div><label className="label-field">Prazo</label><input type="date" className="input-field" value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value || null }))} /></div>
          </div>
          <div><label className="label-field">Notas</label><textarea className="input-field min-h-[60px]" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  );
}
