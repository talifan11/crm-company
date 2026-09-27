/**
 * Типы для импорта данных
 */

export type ImportConflictAction = 'skip' | 'merge' | 'overwrite';

export interface ImportItemPreview {
  entity_type: 'cable' | 'object';
  code: string;
  name: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  attributes: Record<string, any>;
  layer_name: string;
  row_index: number;
  is_duplicate: boolean;
}

export interface ImportPreviewResponse {
  format: string;
  total: number;
  success: number;
  errors: number;
  duplicates: number;
  duplicate_codes: string[];
  error_messages: string[];
  items: ImportItemPreview[];
}

export interface ImportConfirmResponse {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}
