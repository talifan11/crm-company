/**
 * Моковые данные для бригад
 */
import type { Brigade, OnlineBrigade } from '../types/brigade';

export const mockBrigades: Brigade[] = [
  {
    id: 1,
    name: 'Бригада №1 (Тверская)',
    lead_user_id: 2,
    member_ids: [2, 3],
    zone_id: null,
    phone: '+7 (495) 123-45-67',
    vehicle: 'ГАЗель А 123 БВ 77',
    status: 'active',
    notes: 'Основная бригада по Тверскому району',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Бригада №2 (Пушкинская)',
    lead_user_id: 4,
    member_ids: [4, 5],
    zone_id: null,
    phone: '+7 (495) 234-56-78',
    vehicle: 'УАЗ В 456 ГД 77',
    status: 'on_ticket',
    notes: 'Заявка TK-0042 — подключение',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
  {
    id: 3,
    name: 'Бригада №3 (Аварийная)',
    lead_user_id: 6,
    member_ids: [6, 7, 8],
    zone_id: null,
    phone: '+7 (495) 345-67-89',
    vehicle: 'КАМАЗ Е 789 ЖЗ 77',
    status: 'en_route',
    notes: 'Выезд на аварию — обрыв кабеля',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T16:00:00Z',
  },
  {
    id: 4,
    name: 'Бригада №4 (Монтажная)',
    lead_user_id: 9,
    member_ids: [9, 10],
    zone_id: null,
    phone: '+7 (495) 456-78-90',
    vehicle: 'ГАЗель К 012 ИК 77',
    status: 'day_off',
    notes: null,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-14T18:00:00Z',
  },
];

export const mockOnlineBrigades: OnlineBrigade[] = [
  {
    brigade_id: 1,
    brigade_name: 'Бригада №1 (Тверская)',
    status: 'active',
    lead_user_id: 2,
    phone: '+7 (495) 123-45-67',
    geometry: '{"type":"Point","coordinates":[37.6075, 55.7615]}',
    recorded_at: '2024-01-15T10:30:00Z',
  },
  {
    brigade_id: 2,
    brigade_name: 'Бригада №2 (Пушкинская)',
    status: 'on_ticket',
    lead_user_id: 4,
    phone: '+7 (495) 234-56-78',
    geometry: '{"type":"Point","coordinates":[37.6110, 55.7635]}',
    recorded_at: '2024-01-15T14:35:00Z',
  },
  {
    brigade_id: 3,
    brigade_name: 'Бригада №3 (Аварийная)',
    status: 'en_route',
    lead_user_id: 6,
    phone: '+7 (495) 345-67-89',
    geometry: '{"type":"Point","coordinates":[37.6090, 55.7625]}',
    recorded_at: '2024-01-15T16:05:00Z',
  },
];
