/**
 * Моковые данные для демонстрации (замена API в dev-режиме)
 */
import type { Cable, InfraObject, AuditLogEntry, Attachment } from '../types';

// Координаты Москвы (центр ~37.6173, 55.7558)
export const mockObjects: InfraObject[] = [
  {
    id: 1, code: 'OLT-001', name: 'OLT Центральный', object_type: 'olt',
    address: 'ул. Тверская, д. 1', geometry: '{"type":"Point","coordinates":[37.6065, 55.7602]}',
    parent_id: null, notes: 'Главный OLT провайдера', created_at: '2023-06-15T10:00:00Z',
    attachments: [
      { id: 1, entity_type: 'object', entity_id: 1, filename: 'паспорт_olt001.pdf', mime_type: 'application/pdf', size: 245000, doc_category: 'passport', uploaded_at: '2023-06-15T10:00:00Z' }
    ]
  },
  {
    id: 2, code: 'SPL-001', name: 'Сплиттер 1:8 Тверская', object_type: 'splitter',
    address: 'ул. Тверская, д. 5', geometry: '{"type":"Point","coordinates":[37.6080, 55.7620]}',
    parent_id: 1, notes: null, created_at: '2023-07-01T10:00:00Z', attachments: []
  },
  {
    id: 3, code: 'SPL-002', name: 'Сплиттер 1:16 Пушкинская', object_type: 'splitter',
    address: 'ул. Пушкинская, д. 10', geometry: '{"type":"Point","coordinates":[37.6120, 55.7650]}',
    parent_id: 1, notes: null, created_at: '2023-07-10T10:00:00Z', attachments: []
  },
  {
    id: 4, code: 'CB-001', name: 'Кросс-бокс Жилой дом', object_type: 'cross_box',
    address: 'ул. Тверская, д. 12', geometry: '{"type":"Point","coordinates":[37.6090, 55.7640]}',
    parent_id: 2, notes: 'Подъезд 1-4', created_at: '2023-08-01T10:00:00Z', attachments: []
  },
  {
    id: 5, code: 'HOUSE-001', name: 'Жилой дом Тверская 12', object_type: 'house',
    address: 'ул. Тверская, д. 12', geometry: '{"type":"Point","coordinates":[37.6095, 55.7645]}',
    parent_id: null, notes: '48 квартир', created_at: '2023-08-01T10:00:00Z', attachments: []
  },
  {
    id: 6, code: 'MH-001', name: 'Колодец К-15', object_type: 'manhole',
    address: 'ул. Тверская, между д.3 и д.5', geometry: '{"type":"Point","coordinates":[37.6070, 55.7610]}',
    parent_id: null, notes: 'Глубина 2.5м', created_at: '2023-06-20T10:00:00Z',
    attachments: [
      { id: 2, entity_type: 'object', entity_id: 6, filename: 'схема_колодца.dwg', mime_type: 'application/acad', size: 1200000, doc_category: 'scheme', uploaded_at: '2023-06-20T10:00:00Z' }
    ]
  },
  {
    id: 7, code: 'MH-002', name: 'Колодец К-16', object_type: 'manhole',
    address: 'ул. Пушкинская, у д.8', geometry: '{"type":"Point","coordinates":[37.6110, 55.7635]}',
    parent_id: null, notes: null, created_at: '2023-07-05T10:00:00Z', attachments: []
  },
  {
    id: 8, code: 'CPL-001', name: 'Муфта оптическая МО-1', object_type: 'coupling',
    address: 'ул. Тверская, колодец К-15', geometry: '{"type":"Point","coordinates":[37.6072, 55.7612]}',
    parent_id: 6, notes: '24 волокна', created_at: '2023-07-01T10:00:00Z', attachments: []
  },
  {
    id: 9, code: 'HOUSE-002', name: 'Жилой дом Пушкинская 10', object_type: 'house',
    address: 'ул. Пушкинская, д. 10', geometry: '{"type":"Point","coordinates":[37.6125, 55.7655]}',
    parent_id: null, notes: '72 квартиры', created_at: '2023-08-15T10:00:00Z', attachments: []
  },
  {
    id: 10, code: 'SUB-001', name: 'Подстанция ТС-45', object_type: 'substation',
    address: 'ул. Тверская, д. 7', geometry: '{"type":"Point","coordinates":[37.6075, 55.7625]}',
    parent_id: null, notes: '10/0.4 кВ', created_at: '2023-05-01T10:00:00Z', attachments: []
  },
];

export const mockCables: Cable[] = [
  {
    id: 1, code: 'OK-001', name: 'ОК ОLT-001 → SPL-001', cable_type: 'optical',
    laying_method: 'sewer', length_m: 250, from_object_id: 1, to_object_id: 2,
    geometry: '{"type":"LineString","coordinates":[[37.6065,55.7602],[37.6070,55.7610],[37.6080,55.7620]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-06-20', notes: '24 волокна, одномодовый',
    created_at: '2023-06-20T10:00:00Z', updated_at: '2023-06-20T10:00:00Z',
    attachments: [
      { id: 3, entity_type: 'cable', entity_id: 1, filename: 'паспорт_ок001.pdf', mime_type: 'application/pdf', size: 180000, doc_category: 'passport', uploaded_at: '2023-06-20T10:00:00Z' },
      { id: 4, entity_type: 'cable', entity_id: 1, filename: 'акт_прокладки.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 95000, doc_category: 'act', uploaded_at: '2023-06-21T10:00:00Z' },
    ]
  },
  {
    id: 2, code: 'OK-002', name: 'ОК SPL-001 → CB-001', cable_type: 'optical',
    laying_method: 'aerial', length_m: 180, from_object_id: 2, to_object_id: 4,
    geometry: '{"type":"LineString","coordinates":[[37.6080,55.7620],[37.6085,55.7630],[37.6090,55.7640]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-08-01', notes: '8 волокон, самонесущий',
    created_at: '2023-08-01T10:00:00Z', updated_at: '2023-08-01T10:00:00Z',
    attachments: []
  },
  {
    id: 3, code: 'OK-003', name: 'ОК SPL-002 → HOUSE-002', cable_type: 'optical',
    laying_method: 'sewer', length_m: 320, from_object_id: 3, to_object_id: 9,
    geometry: '{"type":"LineString","coordinates":[[37.6120,55.7650],[37.6122,55.7652],[37.6125,55.7655]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-08-15', notes: null,
    created_at: '2023-08-15T10:00:00Z', updated_at: '2023-08-15T10:00:00Z',
    attachments: []
  },
  {
    id: 4, code: 'MK-001', name: 'МК SPL-001 → MH-002', cable_type: 'copper',
    laying_method: 'ground', length_m: 450, from_object_id: 2, to_object_id: 7,
    geometry: '{"type":"LineString","coordinates":[[37.6080,55.7620],[37.6095,55.7628],[37.6110,55.7635]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-07-05', notes: 'Телефонный кабель ТПП 100x2',
    created_at: '2023-07-05T10:00:00Z', updated_at: '2023-07-05T10:00:00Z',
    attachments: [
      { id: 5, entity_type: 'cable', entity_id: 4, filename: 'согласование_прокладки.pdf', mime_type: 'application/pdf', size: 320000, doc_category: 'approval', uploaded_at: '2023-07-01T10:00:00Z' },
    ]
  },
  {
    id: 5, code: 'KX-001', name: 'КК OLT-001 → SUB-001', cable_type: 'coaxial',
    laying_method: 'wall', length_m: 120, from_object_id: 1, to_object_id: 10,
    geometry: '{"type":"LineString","coordinates":[[37.6065,55.7602],[37.6070,55.7615],[37.6075,55.7625]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-05-15', notes: 'Коаксиальный РК-75',
    created_at: '2023-05-15T10:00:00Z', updated_at: '2023-05-15T10:00:00Z',
    attachments: []
  },
  {
    id: 6, code: 'OK-004', name: 'ОК MH-001 → SPL-002', cable_type: 'optical',
    laying_method: 'sewer', length_m: 380, from_object_id: 6, to_object_id: 3,
    geometry: '{"type":"LineString","coordinates":[[37.6070,55.7610],[37.6085,55.7625],[37.6100,55.7640],[37.6120,55.7650]]}',
    owner: 'ООО "Провайдер"', install_date: '2023-07-10', notes: 'Магистральный, 48 волокон',
    created_at: '2023-07-10T10:00:00Z', updated_at: '2023-07-10T10:00:00Z',
    attachments: [
      { id: 6, entity_type: 'cable', entity_id: 6, filename: 'фото_прокладки.jpg', mime_type: 'image/jpeg', size: 2400000, doc_category: 'photo', uploaded_at: '2023-07-10T10:00:00Z' },
    ]
  },
];

export const mockAuditLogs: AuditLogEntry[] = [
  { id: 1, user_id: 1, user_name: 'Администратор Системы', action: 'create', entity_type: 'cable', entity_id: 1, payload: '{"code":"OK-001"}', timestamp: '2023-06-20T10:00:00Z' },
  { id: 2, user_id: 2, user_name: 'Иванов Пётр Сергеевич', action: 'create', entity_type: 'object', entity_id: 6, payload: '{"code":"MH-001"}', timestamp: '2023-06-20T11:00:00Z' },
  { id: 3, user_id: 2, user_name: 'Иванов Пётр Сергеевич', action: 'upload', entity_type: 'cable', entity_id: 1, payload: '{"filename":"паспорт_ок001.pdf"}', timestamp: '2023-06-20T12:00:00Z' },
  { id: 4, user_id: 1, user_name: 'Администратор Системы', action: 'update', entity_type: 'cable', entity_id: 1, payload: '{"notes":"24 волокна, одномодовый"}', timestamp: '2023-06-21T09:00:00Z' },
  { id: 5, user_id: 2, user_name: 'Иванов Пётр Сергеевич', action: 'create', entity_type: 'cable', entity_id: 4, payload: '{"code":"MK-001"}', timestamp: '2023-07-05T10:00:00Z' },
  { id: 6, user_id: 1, user_name: 'Администратор Системы', action: 'login', entity_type: null, entity_id: null, payload: null, timestamp: '2024-01-15T08:30:00Z' },
  { id: 7, user_id: 2, user_name: 'Иванов Пётр Сергеевич', action: 'create', entity_type: 'object', entity_id: 9, payload: '{"code":"HOUSE-002"}', timestamp: '2023-08-15T10:00:00Z' },
];

// Цвета для типов прокладки
export const LAYING_COLORS: Record<string, string> = {
  ground: '#22c55e',   // зелёный
  sewer: '#3b82f6',    // синий
  aerial: '#f59e0b',   // жёлтый
  wall: '#ef4444',     // красный
};

// Иконки для типов объектов (emoji)
export const OBJECT_ICONS: Record<string, string> = {
  house: '🏠',
  manhole: '🕳️',
  coupling: '🔗',
  olt: '📡',
  splitter: '🔀',
  cross_box: '📦',
  substation: '⚡',
};

// Русские названия
export const CABLE_TYPE_LABELS: Record<string, string> = {
  optical: 'Оптический',
  copper: 'Медный',
  coaxial: 'Коаксиальный',
};

export const LAYING_METHOD_LABELS: Record<string, string> = {
  ground: 'В земле',
  sewer: 'В канализации',
  aerial: 'Воздушная',
  wall: 'По стене',
};

export const OBJECT_TYPE_LABELS: Record<string, string> = {
  house: 'Дом',
  manhole: 'Колодец',
  coupling: 'Муфта',
  olt: 'OLT',
  splitter: 'Сплиттер',
  cross_box: 'Кросс-бокс',
  substation: 'Подстанция',
};

export const DOC_CATEGORY_LABELS: Record<string, string> = {
  passport: 'Паспорт',
  scheme: 'Схема',
  approval: 'Согласование',
  act: 'Акт',
  photo: 'Фото',
  other: 'Прочее',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  engineer: 'Инженер',
  viewer: 'Наблюдатель',
};
