/**
 * Страница импорта данных — KML, GeoJSON, CSV
 * Drag&drop, предпросмотр на карте, подтверждение
 */
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Upload, FileText, AlertCircle, CheckCircle, XCircle,
  MapPin, Trash2, Download, Eye, ChevronDown, ChevronUp,
  FileSpreadsheet, Globe, Map
} from 'lucide-react';
import type { ImportItemPreview, ImportConflictAction } from '../types/import';

// Типы для импорта (локальные)
interface ImportPreviewData {
  format: string;
  total: number;
  success: number;
  errors: number;
  duplicates: number;
  duplicate_codes: string[];
  error_messages: string[];
  items: ImportItemPreview[];
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Моковый парсер для фронтенда (в проде — вызов API)
function parseFileMock(content: string, filename: string): ImportPreviewData {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const items: ImportItemPreview[] = [];
  const errors: string[] = [];

  try {
    if (ext === 'geojson' || ext === 'json') {
      const data = JSON.parse(content);
      const features = data.type === 'FeatureCollection' ? data.features : [data];
      
      features.forEach((f: any, idx: number) => {
        const geom = f.geometry;
        if (!geom) {
          errors.push(`Feature ${idx}: нет геометрии`);
          return;
        }
        const entityType = geom.type === 'Point' ? 'object' : 'cable';
        items.push({
          entity_type: entityType,
          code: f.properties?.code || `IMP-${idx}`,
          name: f.properties?.name || `Импорт ${idx}`,
          geometry: geom,
          attributes: f.properties || {},
          layer_name: 'GeoJSON',
          row_index: idx,
          is_duplicate: false,
        });
      });
    } else if (ext === 'csv') {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        errors.push('CSV файл пуст');
        return { format: 'csv', total: 0, success: 0, errors: 1, duplicates: 0, duplicate_codes: [], error_messages: errors, items: [] };
      }
      const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, j) => { row[h] = values[j] || ''; });
        
        const entityType = (row['lon'] && row['lat']) ? 'object' : 'cable';
        let geometry: any;
        
        if (entityType === 'object') {
          geometry = { type: 'Point', coordinates: [parseFloat(row['lon']), parseFloat(row['lat'])] };
        } else {
          geometry = {
            type: 'LineString',
            coordinates: [
              [parseFloat(row['from_lon']), parseFloat(row['from_lat'])],
              [parseFloat(row['to_lon']), parseFloat(row['to_lat'])],
            ],
          };
        }
        
        items.push({
          entity_type: entityType,
          code: row['code'] || `IMP-${i}`,
          name: row['name'] || `Строка ${i}`,
          geometry,
          attributes: Object.fromEntries(Object.entries(row).filter(([k]) => !['code', 'name'].includes(k))),
          layer_name: 'CSV',
          row_index: i + 1,
          is_duplicate: false,
        });
      }
    } else if (ext === 'kml') {
      // Базовый парсинг KML
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      const placemarks = doc.getElementsByTagName('Placemark');
      
      for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const name = pm.getElementsByTagName('name')[0]?.textContent || `KML ${i}`;
        
        // Point
        const point = pm.getElementsByTagName('Point')[0];
        if (point) {
          const coords = point.getElementsByTagName('coordinates')[0]?.textContent?.trim();
          if (coords) {
            const [lon, lat] = coords.split(',').map(Number);
            items.push({
              entity_type: 'object',
              code: `KML-O-${i}`,
              name,
              geometry: { type: 'Point', coordinates: [lon, lat] },
              attributes: {},
              layer_name: 'KML',
              row_index: i,
              is_duplicate: false,
            });
          }
        }
        
        // LineString
        const line = pm.getElementsByTagName('LineString')[0];
        if (line) {
          const coordsText = line.getElementsByTagName('coordinates')[0]?.textContent?.trim();
          if (coordsText) {
            const coordinates = coordsText.split(/\s+/).map(c => {
              const [lon, lat] = c.split(',').map(Number);
              return [lon, lat];
            });
            items.push({
              entity_type: 'cable',
              code: `KML-C-${i}`,
              name,
              geometry: { type: 'LineString', coordinates },
              attributes: {},
              layer_name: 'KML',
              row_index: i,
              is_duplicate: false,
            });
          }
        }
      }
    }
  } catch (e: any) {
    errors.push(`Ошибка парсинга: ${e.message}`);
  }

  return {
    format: ext,
    total: items.length + errors.length,
    success: items.length,
    errors: errors.length,
    duplicates: 0,
    duplicate_codes: [],
    error_messages: errors,
    items,
  };
}

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [conflictAction, setConflictAction] = useState<ImportConflictAction>('skip');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const data = parseFileMock(content, file.name);
      setPreview(data);
      
      // Инициализируем карту с данными
      setTimeout(() => initPreviewMap(data), 100);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/vnd.google-earth.kmz': ['.kmz'],
      'application/geo+json': ['.geojson', '.json'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50 МБ
  });

  const initPreviewMap = (data: ImportPreviewData) => {
    if (!mapContainer.current) return;
    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [37.6173, 55.7558],
      zoom: 11,
    });

    map.on('load', () => {
      // Точки
      const points = data.items.filter(i => i.entity_type === 'object');
      if (points.length > 0) {
        map.addSource('import-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points.map(p => ({
              type: 'Feature' as const,
              properties: { code: p.code, name: p.name },
              geometry: p.geometry as any,
            })),
          } as any,
        });
        map.addLayer({
          id: 'import-points-layer',
          type: 'circle',
          source: 'import-points',
          paint: {
            'circle-radius': 7,
            'circle-color': '#22c55e',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });
      }

      // Линии
      const lines = data.items.filter(i => i.entity_type === 'cable');
      if (lines.length > 0) {
        map.addSource('import-lines', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: lines.map(l => ({
              type: 'Feature' as const,
              properties: { code: l.code, name: l.name },
              geometry: l.geometry as any,
            })),
          } as any,
        });
        map.addLayer({
          id: 'import-lines-layer',
          type: 'line',
          source: 'import-lines',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
          },
        });
      }

      // Fit bounds
      const allCoords = data.items.flatMap(item => {
        const geom = item.geometry;
        if (geom.type === 'Point') return [geom.coordinates];
        if (geom.type === 'LineString') return geom.coordinates;
        return [];
      });
      
      if (allCoords.length > 0) {
        const bounds = new maplibregl.LngLatBounds(allCoords[0], allCoords[0]);
        allCoords.forEach(c => bounds.extend(c as [number, number]));
        map.fitBounds(bounds, { padding: 50 });
      }
    });

    mapRef.current = map;
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    
    // Имитация API-запроса
    await new Promise(r => setTimeout(r, 1500));
    
    const nonDuplicates = preview.items.filter(i => !i.is_duplicate);
    setResult({
      created: nonDuplicates.length,
      updated: 0,
      skipped: preview.duplicates,
      errors: [],
    });
    setLoading(false);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setFileName('');
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  const toggleItem = (idx: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="p-6 h-full overflow-auto">
<div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Импорт данных</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Загрузка из KML, GeoJSON, CSV
          </p>
        </div>
        {preview && (
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            <Trash2 className="w-4 h-4" /> Сбросить
          </button>
        )}
      </div>

{/* Drag & Drop зона */}
      {!preview && (
        <div
          {...getRootProps()}
          className={`rounded-md p-10 text-center cursor-pointer transition-colors mb-6 ${isDragActive ? 'opacity-80' : ''}`}
          style={{
            background: 'var(--color-bg-secondary)',
            border: `2px dashed ${isDragActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
          }}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
          <p className="text-base font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
            {isDragActive ? 'Отпустите файл' : 'Перетащите файл или нажмите для выбора'}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            KML, KMZ, GeoJSON, CSV (до 50 МБ)
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
              <Globe className="w-3 h-3" /> KML/KMZ
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
              <Map className="w-3 h-3" /> GeoJSON
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
              <FileSpreadsheet className="w-3 h-3" /> CSV
            </div>
          </div>
        </div>
      )}

      {/* Шаблоны CSV */}
      {!preview && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-medium text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Шаблоны CSV</h3>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onClick={() => {
                const csv = 'code;name;cable_type;laying_method;from_lon;from_lat;to_lon;to_lat;owner;notes\nOK-001;Кабель;optical;sewer;37.6;55.7;37.7;55.8;ООО Провайдер;';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'template_cables.csv'; a.click();
              }}>
              <Download className="w-3 h-3" /> Кабели
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              onClick={() => {
                const csv = 'code;name;object_type;lon;lat;address;notes\nMH-001;Колодец;manhole;37.607;55.761;ул. Тверская;';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'template_objects.csv'; a.click();
              }}>
              <Download className="w-3 h-3" /> Объекты
            </button>
          </div>
        </div>
      )}

      {/* Результат импорта */}
      {result && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-success)' }}>
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Импорт завершён</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{result.created}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Создано</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{result.updated}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Обновлено</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{result.skipped}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Пропущено</p>
            </div>
          </div>
        </div>
      )}

      {/* Предпросмотр */}
      {preview && !result && (
        <>
          {/* Статистика */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Всего" value={preview.total} color="var(--color-accent)" />
            <StatCard label="Готовы" value={preview.success} color="var(--color-success)" />
            <StatCard label="Ошибки" value={preview.errors} color="var(--color-danger)" />
            <StatCard label="Дубликаты" value={preview.duplicates} color="var(--color-warning)" />
          </div>

          {/* Ошибки */}
          {preview.error_messages.length > 0 && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>Ошибки парсинга</span>
              </div>
              {preview.error_messages.map((msg, i) => (
                <p key={i} className="text-xs ml-6" style={{ color: 'var(--color-danger)' }}>{msg}</p>
              ))}
            </div>
          )}

          {/* Карта предпросмотра */}
          {showMap && preview.items.length > 0 && (
            <div className="mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Предпросмотр на карте</span>
                <button onClick={() => setShowMap(false)} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Скрыть</button>
              </div>
              <div ref={mapContainer} style={{ height: '300px' }} />
            </div>
          )}
          {!showMap && preview.items.length > 0 && (
            <button onClick={() => { setShowMap(true); setTimeout(() => initPreviewMap(preview), 100); }}
              className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <Eye className="w-4 h-4" /> Показать на карте
            </button>
          )}

          {/* Список элементов */}
          <div className="mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Элементы для импорта ({preview.items.length})
              </span>
              <div className="flex items-center gap-3">
                <label className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Дубликаты:</label>
                <select
                  value={conflictAction}
                  onChange={(e) => setConflictAction(e.target.value as ImportConflictAction)}
                  className="text-xs p-1.5 rounded outline-none"
                  style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="skip">Пропустить</option>
                  <option value="merge">Обновить</option>
                  <option value="overwrite">Заменить</option>
                </select>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {preview.items.slice(0, 50).map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center gap-3 text-sm"
                  style={{ borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none', background: item.is_duplicate ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                  <span className="text-xs font-mono w-8" style={{ color: 'var(--color-text-secondary)' }}>{item.row_index}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${item.entity_type === 'cable' ? '' : ''}`}
                    style={{ background: item.entity_type === 'cable' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)', color: item.entity_type === 'cable' ? '#3b82f6' : '#22c55e' }}>
                    {item.entity_type === 'cable' ? 'Кабель' : 'Объект'}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>{item.code}</span>
                  <span className="flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                  {item.is_duplicate && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}>дубликат</span>
                  )}
                  <button onClick={() => toggleItem(idx)} className="p-1">
                    {expandedItems.has(idx) ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />}
                  </button>
                </div>
              ))}
              {preview.items.length > 50 && (
                <div className="px-4 py-2 text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  ... и ещё {preview.items.length - 50} элементов
                </div>
              )}
            </div>
          </div>

          {/* Кнопка подтверждения */}
          <div className="flex justify-end gap-3">
            <button onClick={handleReset} className="px-6 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || preview.success === 0}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {loading ? 'Импорт...' : `Подтвердить импорт (${preview.success - preview.duplicates} записей)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl text-center" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
    </div>
  );
}
