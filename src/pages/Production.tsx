import { useEffect, useState, useCallback } from 'react';
import { FolderKanban, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Event, ProductionStage, Client, EventType } from '@/lib/types';
import { formatCurrency, formatDate, todayISO } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

export default function Production() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [evRes, stRes, clRes, etRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('production_stages').select('*').order('sort_order'),
      supabase.from('clients').select('id, name'),
      supabase.from('event_types').select('id, name'),
    ]);
    setEvents((evRes.data as Event[]) || []);
    setStages((stRes.data as ProductionStage[]) || []);
    setClients((clRes.data as Client[]) || []);
    setEventTypes((etRes.data as EventType[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const clientName = (id: string | null) => clients.find(c => c.id === id)?.name || '-';
  const typeName = (id: string | null) => eventTypes.find(t => t.id === id)?.name || '-';

  const moveToStage = async (eventId: string, stageName: string) => {
    await supabase.from('events').update({ production_stage: stageName, updated_at: new Date().toISOString() }).eq('id', eventId);
    load();
  };

  const eventsByStage = (stageName: string) => events.filter(e => (e.production_stage || 'lead') === stageName);
  const isOverdue = (e: Event) => e.delivery_deadline && e.delivery_deadline < todayISO() && e.production_stage !== 'Entregue' && e.production_stage !== 'Arquivado';

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-bg-elevated rounded-xl" />)}</div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Produção" subtitle="Funil de projetos fotográficos" icon={FolderKanban} />
      {events.length === 0 ? (
        <EmptyState icon={<FolderKanban className="w-8 h-8 text-text-muted" />} title="Nenhum projeto" description="Crie eventos para visualizá-los no funil de produção." />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {stages.map(stage => {
              const stageEvents = eventsByStage(stage.name);
              return (
                <div key={stage.id} className="w-72 flex-shrink-0">
                  <div className="card p-3 mb-2 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="text-sm font-semibold text-text-primary">{stage.name}</h3>
                      </div>
                      <span className="badge bg-bg-hover text-text-secondary">{stageEvents.length}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stageEvents.map(evt => (
                      <div key={evt.id} className="card card-hover p-3 cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-text-primary flex-1 min-w-0 truncate">{evt.name}</h4>
                          {isOverdue(evt) && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />}
                        </div>
                        <div className="space-y-1 text-xs text-text-muted">
                          <p>{clientName(evt.client_id)}</p>
                          <p>{typeName(evt.event_type_id)}</p>
                          {evt.event_date && <p>Evento: {formatDate(evt.event_date)}</p>}
                          {evt.delivery_deadline && <p className={isOverdue(evt) ? 'text-red-400' : ''}>Entrega: {formatDate(evt.delivery_deadline)}</p>}
                          <p className="font-medium text-text-secondary">{formatCurrency(evt.contracted_value)}</p>
                        </div>
                        {stage.sort_order < stages.length - 1 && (
                          <button
                            onClick={() => moveToStage(evt.id, stages[stage.sort_order + 1].name)}
                            className="mt-2 w-full text-xs text-text-muted hover:text-gold flex items-center justify-center gap-1 py-1 border-t border-border-base pt-2 transition-colors"
                          >
                            Mover para {stages[stage.sort_order + 1].name} <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {stageEvents.length === 0 && <p className="text-xs text-text-faint text-center py-4">Vazio</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
