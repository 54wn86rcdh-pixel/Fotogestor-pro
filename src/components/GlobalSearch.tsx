import { useState, useRef, useEffect } from 'react';
import { Search, Users, Briefcase, FileText, Calendar, CheckSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PageId } from '@/App';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  page: PageId;
  icon: typeof Search;
  category: string;
}

interface GlobalSearchProps {
  onNavigate: (page: PageId) => void;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const term = query.trim();
      const [clients, events, quotes, contracts, appts, tasks] = await Promise.all([
        supabase.from('clients').select('id, name, phone, email, code').ilike('name', `%${term}%`).limit(5),
        supabase.from('events').select('id, name, event_date, status').ilike('name', `%${term}%`).limit(5),
        supabase.from('quotes').select('id, number, description, status, total').ilike('description', `%${term}%`).limit(4),
        supabase.from('contracts').select('id, number, title, status').ilike('title', `%${term}%`).limit(4),
        supabase.from('appointments').select('id, title, start_date, start_time').ilike('title', `%${term}%`).limit(4),
        supabase.from('tasks').select('id, title, status, due_date').ilike('title', `%${term}%`).limit(4),
      ]);

      const items: SearchResult[] = [];
      (clients.data || []).forEach((c: { id: string; name: string; phone: string | null; email: string | null; code: string | null }) => {
        items.push({ id: c.id, label: c.name, sublabel: c.code || c.phone || c.email || 'Cliente', page: 'clients', icon: Users, category: 'Clientes' });
      });
      (events.data || []).forEach((e: { id: string; name: string; event_date: string | null; status: string }) => {
        items.push({ id: e.id, label: e.name, sublabel: e.status, page: 'events', icon: Briefcase, category: 'Eventos' });
      });
      (quotes.data || []).forEach((q: { id: string; number: string | null; description: string | null; status: string; total: number }) => {
        items.push({ id: q.id, label: q.number || 'Orçamento', sublabel: q.description || q.status, page: 'quotes', icon: FileText, category: 'Orçamentos' });
      });
      (contracts.data || []).forEach((c: { id: string; number: string | null; title: string; status: string }) => {
        items.push({ id: c.id, label: c.number || c.title, sublabel: c.title, page: 'contracts', icon: FileText, category: 'Contratos' });
      });
      (appts.data || []).forEach((a: { id: string; title: string; start_date: string; start_time: string | null }) => {
        items.push({ id: a.id, label: a.title, sublabel: a.start_date, page: 'agenda', icon: Calendar, category: 'Agenda' });
      });
      (tasks.data || []).forEach((t: { id: string; title: string; status: string; due_date: string | null }) => {
        items.push({ id: t.id, label: t.title, sublabel: t.status, page: 'tasks', icon: CheckSquare, category: 'Tarefas' });
      });

      setResults(items);
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const select = (r: SearchResult) => {
    onNavigate(r.page);
    setShow(false);
    setQuery('');
  };

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        placeholder="Pesquisar clientes, eventos, orçamentos..."
        value={query}
        onChange={e => { setQuery(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        className="w-full bg-bg-base border border-border-base rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
      />
      {show && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-bg-elevated border border-border-hover rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto fade-in">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-text-muted">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-text-muted">Nenhum resultado para "{query}"</div>
          ) : (
            <div className="divide-y divide-border-base">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-bg-surface">{cat}</p>
                  {items.map(r => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={`${r.page}-${r.id}`}
                        onClick={() => select(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary truncate">{r.label}</p>
                          <p className="text-xs text-text-muted truncate">{r.sublabel}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-text-faint flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
