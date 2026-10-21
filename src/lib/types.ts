export interface Client {
  id: string;
  code: string | null;
  name: string;
  responsible_name: string | null;
  document_type: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  birth_date: string | null;
  how_met: string | null;
  first_contact_date: string | null;
  preferences: string | null;
  notes: string | null;
  consent_communication: boolean;
  whatsapp_reminders_enabled: boolean;
  is_recurring: boolean;
  referred_by: string | null;
  tags: string[] | null;
  image_authorization_status: string;
  image_authorization_date: string | null;
  image_authorization_notes: string | null;
  photo_folder_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInteraction {
  id: string;
  client_id: string | null;
  type: string;
  subject: string | null;
  description: string | null;
  interaction_date: string;
  follow_up_date: string | null;
  created_at: string;
}

export interface AppointmentCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  category_id: string | null;
  client_id: string | null;
  event_id: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  address: string | null;
  team: string | null;
  notes: string | null;
  status: string;
  reminder_enabled: boolean;
  reminder_days: number;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_blocked: boolean;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  name: string;
  default_duration_hours: number;
  default_price: number | null;
  color: string;
  checklist_template: unknown;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  event_type_id: string | null;
  client_id: string | null;
  contract_id: string | null;
  quote_id: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  address: string | null;
  location_name: string | null;
  contacts: string | null;
  contracted_value: number;
  team_assigned: string | null;
  equipment_needed: string | null;
  briefing: string | null;
  shot_list: string | null;
  reference_links: string | null;
  timeline: string | null;
  suppliers: string | null;
  notes: string | null;
  status: string;
  production_stage: string;
  editing_deadline: string | null;
  delivery_deadline: string | null;
  gallery_link: string | null;
  download_link: string | null;
  photo_count: number | null;
  video_count: number | null;
  delivery_format: string | null;
  link_expiry: string | null;
  folder_path_original: string | null;
  folder_path_selection: string | null;
  folder_path_editing: string | null;
  folder_path_export: string | null;
  folder_path_backup: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventChecklistItem {
  id: string;
  event_id: string;
  description: string;
  is_completed: boolean;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  list_id: string | null;
  event_id: string | null;
  client_id: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  estimated_time: number | null;
  actual_time: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  number: string | null;
  client_id: string | null;
  event_type: string | null;
  event_date: string | null;
  description: string | null;
  subtotal: number;
  discount: number;
  additional_costs: number;
  total: number;
  payment_method: string | null;
  payment_terms: string | null;
  valid_until: string | null;
  notes: string | null;
  status: string;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

export interface Contract {
  id: string;
  number: string | null;
  client_id: string | null;
  event_id: string | null;
  quote_id: string | null;
  title: string;
  service_description: string | null;
  event_date: string | null;
  event_location: string | null;
  start_time: string | null;
  end_time: string | null;
  team_size: number;
  deliverables: string | null;
  delivery_deadline: string | null;
  total_value: number;
  installments: number;
  cancellation_terms: string | null;
  reschedule_terms: string | null;
  image_rights: string | null;
  data_protection: string | null;
  obligations: string | null;
  template_name: string | null;
  status: string;
  signed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCategory {
  id: string;
  name: string;
  type: string;
  color: string;
  is_recurring: boolean;
  created_at: string;
}

export interface AccountReceivable {
  id: string;
  client_id: string | null;
  event_id: string | null;
  contract_id: string | null;
  description: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  category_id: string | null;
  interest: number;
  discount_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface AccountPayable {
  id: string;
  supplier_id: string | null;
  event_id: string | null;
  description: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  category_id: string | null;
  is_recurring: boolean;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  asset_tag: string | null;
  category: string;
  purchase_date: string | null;
  purchase_value: number;
  condition: string;
  location: string | null;
  warranty_expiry: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  availability: string | null;
  rate_per_service: number;
  commission_percentage: number;
  notes: string | null;
  documents: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  service_type: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  typical_prices: string | null;
  typical_deadlines: string | null;
  internal_rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface StudioLocation {
  id: string;
  name: string;
  type: string;
  address: string | null;
  contact_phone: string | null;
  rules: string | null;
  rental_value: number | null;
  available_hours: string | null;
  restrictions: string | null;
  parking: boolean;
  accessibility: boolean;
  notes: string | null;
  created_at: string;
}

export interface Settings {
  id: string;
  company_name: string;
  legal_name: string | null;
  cnpj_cpf: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  logo_url: string | null;
  currency: string;
  currency_symbol: string;
  date_format: string;
  timezone: string;
  theme: string;
  work_start_time: string;
  work_end_time: string;
  work_days: number[];
  default_reminder_days: number;
  whatsapp_reminder_enabled: boolean;
  whatsapp_reminder_mode: string;
  whatsapp_api_token: string | null;
  whatsapp_phone_id: string | null;
  whatsapp_business_account: string | null;
  whatsapp_silence_start: string;
  whatsapp_silence_end: string;
  first_run_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  category: string;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  is_snoozed: boolean;
  snooze_until: string | null;
  priority: string;
  created_at: string;
}

export interface PriceCalculatorPreset {
  id: string;
  name: string;
  service_type: string | null;
  hours_shooting: number;
  hours_prep: number;
  hours_travel: number;
  hours_selection: number;
  hours_editing: number;
  hours_review: number;
  hours_delivery: number;
  hourly_rate: number;
  equipment_depreciation: number;
  assistant_cost: number;
  travel_cost: number;
  materials_cost: number;
  monthly_fixed_costs: number;
  monthly_services_count: number;
  software_cost: number;
  payment_fee_percent: number;
  tax_percent: number;
  desired_margin_percent: number;
  current_price: number;
  notes: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string | null;
  target_audience: string | null;
  promo_start_date: string | null;
  promo_end_date: string | null;
  execution_start_date: string | null;
  execution_end_date: string | null;
  services: string | null;
  sale_price: number;
  estimated_costs: number;
  expected_margin: number;
  revenue_goal: number;
  profit_goal: number;
  sales_goal: number;
  available_slots: number;
  channels: string | null;
  marketing_budget: number;
  actual_revenue: number;
  actual_costs: number;
  actual_sales: number;
  notes: string | null;
  created_at: string;
}

export interface CashSession {
  id: string;
  session_date: string;
  responsible: string | null;
  account_name: string;
  opening_balance: number;
  expected_closing_balance: number;
  counted_closing_balance: number;
  difference: number;
  difference_reason: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface CashMovement {
  id: string;
  session_id: string;
  type: string;
  payment_method: string;
  amount: number;
  description: string;
  client_id: string | null;
  event_id: string | null;
  related_id: string | null;
  related_type: string | null;
  justification: string | null;
  created_at: string;
}

export interface ProductionStage {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export interface FilePath {
  id: string;
  related_type: string;
  related_id: string;
  label: string;
  path: string;
  path_type: string;
  last_verified: string | null;
  status: string;
  file_count: number | null;
  total_size: string | null;
  notes: string | null;
  created_at: string;
}

export interface BackupRecord {
  id: string;
  related_type: string | null;
  related_id: string | null;
  destination: string;
  backup_type: string;
  verified_at: string | null;
  status: string;
  file_count: number | null;
  total_size: string | null;
  hash_value: string | null;
  notes: string | null;
  created_at: string;
}

export interface WhatsappReminder {
  id: string;
  appointment_id: string;
  client_id: string | null;
  phone: string;
  message: string;
  reminder_days: number;
  scheduled_for: string | null;
  sent_at: string | null;
  mode: string;
  status: string;
  provider_response: string | null;
  error_reason: string | null;
  created_at: string;
}

export interface SalesFunnelStage {
  id: string;
  name: string;
  sort_order: number;
  color: string;
  created_at: string;
}

export interface SalesLead {
  id: string;
  client_id: string | null;
  stage_id: string | null;
  source: string | null;
  description: string | null;
  estimated_value: number;
  last_contact_date: string | null;
  next_contact_date: string | null;
  loss_reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface EquipmentLoan {
  id: string;
  equipment_id: string | null;
  event_id: string | null;
  team_member_id: string | null;
  loan_date: string;
  return_date: string | null;
  expected_return_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  client_id: string | null;
  event_id: string | null;
  contract_id: string | null;
  file_url: string | null;
  file_path: string | null;
  description: string | null;
  generated_at: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  base_price: number;
  estimated_duration_hours: number | null;
  deliverables: string | null;
  includes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuoteService {
  id: string;
  quote_id: string;
  service_id: string | null;
  custom_price: number | null;
  created_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  body: string | null;
  cancellation_terms: string | null;
  reschedule_terms: string | null;
  image_rights: string | null;
  data_protection: string | null;
  obligations: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ImageReleaseTemplate {
  id: string;
  name: string;
  scope: string;
  body: string | null;
  is_default: boolean;
  created_at: string;
}
