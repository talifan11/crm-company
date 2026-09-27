/**
 * Типы для бригад и персонала
 */

export type BrigadeStatus = 'active' | 'on_ticket' | 'en_route' | 'day_off' | 'inactive';

export interface Brigade {
  id: number;
  name: string;
  lead_user_id: number;
  member_ids: number[];
  zone_id: number | null;
  phone: string | null;
  vehicle: string | null;
  status: BrigadeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnlineBrigade {
  brigade_id: number;
  brigade_name: string;
  status: BrigadeStatus;
  lead_user_id: number;
  phone: string | null;
  geometry: string; // GeoJSON Point
  recorded_at: string;
}

export const BRIGADE_STATUS_LABELS: Record<BrigadeStatus, string> = {
  active: 'Свободна',
  on_ticket: 'На заявке',
  en_route: 'На выезде',
  day_off: 'Выходной',
  inactive: 'Неактивна',
};

export const BRIGADE_STATUS_COLORS: Record<BrigadeStatus, string> = {
  active: '#22c55e',      // зелёный
  on_ticket: '#f59e0b',   // жёлтый
  en_route: '#3b82f6',    // синий
  day_off: '#6b7280',     // серый
  inactive: '#ef4444',    // красный
};
