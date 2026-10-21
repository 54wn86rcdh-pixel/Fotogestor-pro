import { supabase } from '@/lib/supabase';
import { todayISO, addDays } from '@/lib/utils';

interface NotifSeed {
  type: string;
  title: string;
  message: string;
  category: string;
  related_id: string | null;
  related_type: string | null;
  priority: string;
}

export async function generateNotifications(): Promise<void> {
  const today = todayISO();
  const soonDate = addDays(new Date(), 7).toISOString().split('T')[0];
  const seeds: NotifSeed[] = [];

  const [tasks, receivables, payables, events, equipment, clients] = await Promise.all([
    supabase.from('tasks').select('id, title, due_date, status').lt('due_date', today).neq('status', 'done'),
    supabase.from('accounts_receivable').select('id, description, due_date, amount, paid_amount, status').lt('due_date', today).eq('status', 'pending'),
    supabase.from('accounts_payable').select('id, description, due_date, amount, paid_amount, status').lt('due_date', today).eq('status', 'pending'),
    supabase.from('events').select('id, name, event_date, status').gte('event_date', today).lte('event_date', soonDate).order('event_date').limit(10),
    supabase.from('equipment').select('id, name, next_maintenance, warranty_expiry, status').or(`next_maintenance.lt.${today},warranty_expiry.lt.${today}`),
    supabase.from('clients').select('id, name, birth_date'),
  ]);

  (tasks.data || []).forEach((t: { id: string; title: string; due_date: string | null }) => {
    seeds.push({ type: 'task_overdue', title: 'Tarefa atrasada', message: t.title, category: 'Tarefas', related_id: t.id, related_type: 'task', priority: 'high' });
  });

  (receivables.data || []).forEach((r: { id: string; description: string; due_date: string; amount: number; paid_amount: number }) => {
    seeds.push({ type: 'receivable_overdue', title: 'Conta vencida a receber', message: `${r.description} - venceu ${r.due_date}`, category: 'Financeiro', related_id: r.id, related_type: 'receivable', priority: 'high' });
  });

  (payables.data || []).forEach((p: { id: string; description: string; due_date: string }) => {
    seeds.push({ type: 'payable_overdue', title: 'Conta vencida a pagar', message: p.description, category: 'Financeiro', related_id: p.id, related_type: 'payable', priority: 'normal' });
  });

  (events.data || []).forEach((e: { id: string; name: string; event_date: string | null; status: string }) => {
    seeds.push({ type: 'event_upcoming', title: 'Evento próximo', message: `${e.name} - ${e.event_date}`, category: 'Eventos', related_id: e.id, related_type: 'event', priority: 'normal' });
  });

  (equipment.data || []).forEach((eq: { id: string; name: string; next_maintenance: string | null; warranty_expiry: string | null; status: string }) => {
    if (eq.next_maintenance && eq.next_maintenance < today) {
      seeds.push({ type: 'maintenance_overdue', title: 'Manutenção atrasada', message: eq.name, category: 'Equipamentos', related_id: eq.id, related_type: 'equipment', priority: 'normal' });
    }
    if (eq.warranty_expiry && eq.warranty_expiry < today) {
      seeds.push({ type: 'warranty_expired', title: 'Garantia vencida', message: eq.name, category: 'Equipamentos', related_id: eq.id, related_type: 'equipment', priority: 'low' });
    }
  });

  const todayDate = new Date();
  (clients.data || []).forEach((c: { id: string; name: string; birth_date: string | null }) => {
    if (!c.birth_date) return;
    const bd = new Date(c.birth_date);
    const bdThisYear = new Date(todayDate.getFullYear(), bd.getMonth(), bd.getDate());
    const diff = Math.ceil((bdThisYear.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) {
      seeds.push({ type: 'birthday_today', title: 'Aniversário hoje!', message: c.name, category: 'Clientes', related_id: c.id, related_type: 'client', priority: 'normal' });
    } else if (diff > 0 && diff <= 7) {
      seeds.push({ type: 'birthday_upcoming', title: 'Aniversário próximo', message: `${c.name} - ${diff} dia(s)`, category: 'Clientes', related_id: c.id, related_type: 'client', priority: 'low' });
    }
  });

  if (seeds.length === 0) return;

  const todayPrefix = today;
  const { data: existing } = await supabase
    .from('notifications')
    .select('type, related_id, created_at')
    .gte('created_at', todayPrefix + 'T00:00:00')
    .eq('is_read', false);

  const existingKeys = new Set(
    (existing || []).map((n: { type: string; related_id: string | null; created_at: string }) => `${n.type}:${n.related_id || ''}`)
  );

  const toInsert = seeds.filter(s => !existingKeys.has(`${s.type}:${s.related_id || ''}`));
  if (toInsert.length === 0) return;

  await supabase.from('notifications').insert(toInsert);
}
