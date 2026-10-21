import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, Briefcase, CheckSquare,
  DollarSign, FileText, Camera, Package, Users2, Store,
  Settings as SettingsIcon, Bell, Calculator,
  FolderKanban, TrendingUp, Image, X, Menu,
  MapPin, Wallet, HardDrive,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Settings, Notification } from '@/lib/types';
import { generateNotifications } from '@/lib/notifications';
import GlobalSearch from '@/components/GlobalSearch';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Clients from '@/pages/Clients';
import Events from '@/pages/Events';
import Tasks from '@/pages/Tasks';
import Finance from '@/pages/Finance';
import Quotes from '@/pages/Quotes';
import Contracts from '@/pages/Contracts';
import PriceCalculator from '@/pages/PriceCalculator';
import Equipment from '@/pages/Equipment';
import Team from '@/pages/Team';
import Suppliers from '@/pages/Suppliers';
import Reports from '@/pages/Reports';
import SettingsPage from '@/pages/Settings';
import FirstRunWizard from '@/pages/FirstRunWizard';
import Production from '@/pages/Production';
import Campaigns from '@/pages/Campaigns';
import SalesFunnel from '@/pages/SalesFunnel';
import Studios from '@/pages/Studios';
import Documents from '@/pages/Documents';
import CashRegister from '@/pages/CashRegister';
import BackupVerify from '@/pages/BackupVerify';
import Services from '@/pages/Services';

export type PageId =
  | 'dashboard' | 'agenda' | 'clients' | 'events' | 'tasks'
  | 'finance' | 'quotes' | 'contracts' | 'calculator'
  | 'equipment' | 'team' | 'suppliers' | 'reports'
  | 'settings' | 'production' | 'campaigns' | 'funnel'
  | 'studios' | 'documents' | 'cashregister' | 'backup'
  | 'services';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Principal' },
  { id: 'agenda', label: 'Agenda', icon: Calendar, group: 'Principal' },
  { id: 'clients', label: 'Clientes', icon: Users, group: 'Principal' },
  { id: 'events', label: 'Eventos', icon: Briefcase, group: 'Principal' },
  { id: 'services', label: 'Serviços', icon: Package, group: 'Principal' },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare, group: 'Principal' },
  { id: 'production', label: 'Produção', icon: FolderKanban, group: 'Principal' },
  { id: 'funnel', label: 'Funil de Vendas', icon: TrendingUp, group: 'Comercial' },
  { id: 'quotes', label: 'Orçamentos', icon: FileText, group: 'Comercial' },
  { id: 'contracts', label: 'Contratos', icon: FileText, group: 'Comercial' },
  { id: 'campaigns', label: 'Campanhas', icon: Image, group: 'Comercial' },
  { id: 'calculator', label: 'Calculadora de Preço', icon: Calculator, group: 'Comercial' },
  { id: 'finance', label: 'Financeiro', icon: DollarSign, group: 'Financeiro' },
  { id: 'cashregister', label: 'Caixa Diário', icon: Wallet, group: 'Financeiro' },
  { id: 'reports', label: 'Relatórios', icon: FileText, group: 'Financeiro' },
  { id: 'equipment', label: 'Equipamentos', icon: Camera, group: 'Operacional' },
  { id: 'team', label: 'Equipe', icon: Users2, group: 'Operacional' },
  { id: 'suppliers', label: 'Fornecedores', icon: Store, group: 'Operacional' },
  { id: 'studios', label: 'Estúdios e Locais', icon: MapPin, group: 'Operacional' },
  { id: 'documents', label: 'Documentos', icon: FileText, group: 'Sistema' },
  { id: 'backup', label: 'Backup e Verificação', icon: HardDrive, group: 'Sistema' },
  { id: 'settings', label: 'Configurações', icon: SettingsIcon, group: 'Sistema' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadSettings();
    generateNotifications().then(() => loadNotifications());
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    if (data) {
      setSettings(data as Settings);
    } else {
      const { data: newSettings } = await supabase
        .from('settings')
        .insert({ company_name: 'Minha Empresa' })
        .select()
        .single();
      setSettings(newSettings as Settings);
    }
    setLoading(false);
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) || []);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Carregando FOTOGESTOR PRO...</p>
        </div>
      </div>
    );
  }

  if (settings && !settings.first_run_completed) {
    return <FirstRunWizard settings={settings} onComplete={loadSettings} />;
  }

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'agenda': return <Agenda />;
      case 'clients': return <Clients />;
      case 'events': return <Events />;
      case 'services': return <Services />;
      case 'tasks': return <Tasks />;
      case 'production': return <Production />;
      case 'funnel': return <SalesFunnel />;
      case 'quotes': return <Quotes />;
      case 'contracts': return <Contracts />;
      case 'campaigns': return <Campaigns />;
      case 'calculator': return <PriceCalculator />;
      case 'finance': return <Finance />;
      case 'reports': return <Reports />;
      case 'equipment': return <Equipment />;
      case 'team': return <Team />;
      case 'suppliers': return <Suppliers />;
      case 'studios': return <Studios />;
      case 'documents': return <Documents />;
      case 'cashregister': return <CashRegister />;
      case 'backup': return <BackupVerify />;
      case 'settings': return <SettingsPage settings={settings} onSave={loadSettings} />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className={`min-h-screen bg-bg-base flex ${settings?.theme === 'light' ? 'theme-light' : ''}`}>
      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed lg:relative w-64 h-screen bg-bg-surface border-r border-border-base z-40 flex flex-col">
            <div className="px-5 py-5 border-b border-border-base">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-on-gold" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-text-primary truncate">FOTOGESTOR</h1>
                  <p className="text-xs text-gold font-medium">PRO</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {Object.entries(groupedNav).map(([group, items]) => (
                <div key={group} className="mb-3">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider px-3.5 mb-1.5">
                    {group}
                  </p>
                  {items.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`nav-item w-full ${currentPage === item.id ? 'nav-item-active' : ''}`}
                      >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="px-3 py-3 border-t border-border-base">
              <div className="flex items-center gap-3 px-3.5 py-2">
                <div className="w-8 h-8 rounded-full bg-border-hover flex items-center justify-center text-xs font-semibold text-gold">
                  {settings?.company_name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{settings?.company_name}</p>
                  <p className="text-xs text-text-muted">Administrador</p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-bg-surface border-b border-border-base flex items-center justify-between px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-text-secondary" /> : <Menu className="w-5 h-5 text-text-secondary" />}
            </button>

            <GlobalSearch onNavigate={setCurrentPage} />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-bg-hover rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-on-gold text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-bg-elevated border border-border-hover rounded-xl shadow-2xl z-50 fade-in max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-border-hover">
                      <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-text-faint mx-auto mb-2" />
                        <p className="text-sm text-text-muted">Nenhuma notificação nova</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border-base">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            className="px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors"
                            onClick={() => markNotificationRead(n.id)}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                n.priority === 'high' ? 'bg-red-500' :
                                n.priority === 'normal' ? 'bg-gold' : 'bg-border-hover'
                              }`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-text-primary">{n.title}</p>
                                {n.message && <p className="text-xs text-text-muted mt-0.5">{n.message}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-bg-base">
          <div className="slide-up">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
