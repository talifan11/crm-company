/**
 * Типы доменной модели CRM
 */

// === Enums ===
export type UserRole = 'admin' | 'engineer' | 'viewer';
export type CableType = 'optical' | 'copper' | 'coaxial';
export type LayingMethod = 'ground' | 'sewer' | 'aerial' | 'wall';
export type ObjectType = 'house' | 'manhole' | 'coupling' | 'olt' | 'splitter' | 'cross_box' | 'substation';
export type EntityType = 'cable' | 'object';
export type DocCategory = 'passport' | 'scheme' | 'approval' | 'act' | 'photo' | 'other';

// === Models ===
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Cable {
  id: number;
  code: string;
  name: string;
  cable_type: CableType;
  laying_method: LayingMethod;
  length_m: number;
  from_object_id: number;
  to_object_id: number;
  geometry: string; // GeoJSON или WKT
  owner: string | null;
  install_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  attachments: Attachment[];
}

export interface InfraObject {
  id: number;
  code: string;
  name: string;
  object_type: ObjectType;
  address: string | null;
  geometry: string;
  parent_id: number | null;
  notes: string | null;
  created_at: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  entity_type: EntityType;
  entity_id: number;
  filename: string;
  mime_type: string;
  size: number;
  doc_category: DocCategory;
  uploaded_at: string;
  download_url?: string;
}

export interface AuditLogEntry {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  payload: string | null;
  timestamp: string;
}

// === Auth ===
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// === Map ===
export interface MapFilters {
  cableType: CableType | null;
  layingMethod: LayingMethod | null;
  objectType: ObjectType | null;
  owner: string | null;
}
