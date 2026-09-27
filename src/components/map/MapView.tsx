/**
 * Компонент карты MapLibre GL JS
 * Отображает кабели (линии) и объекты (точки) с интерактивностью
 */
import { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../stores/mapStore';
import { mockCables, mockObjects, LAYING_COLORS, OBJECT_ICONS } from '../../data/mockData';
import type { Cable, InfraObject } from '../../types';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { filters, setSelectedFeature } = useMapStore();

  // Фильтрация данных
  const filteredCables = mockCables.filter((c) => {
    if (filters.cableType && c.cable_type !== filters.cableType) return false;
    if (filters.layingMethod && c.laying_method !== filters.layingMethod) return false;
    if (filters.owner && !c.owner?.toLowerCase().includes(filters.owner.toLowerCase())) return false;
    return true;
  });

  const filteredObjects = mockObjects.filter((o) => {
    if (filters.objectType && o.object_type !== filters.objectType) return false;
    return true;
  });

  // Конвертация в GeoJSON
  const cablesGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredCables.map((c) => ({
      type: 'Feature',
      properties: { id: c.id, code: c.code, name: c.name, cable_type: c.cable_type, laying_method: c.laying_method, length_m: c.length_m },
      geometry: typeof c.geometry === 'string' ? JSON.parse(c.geometry) : c.geometry,
    })),
  };

  const objectsGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredObjects.map((o) => ({
      type: 'Feature',
      properties: { id: o.id, code: o.code, name: o.name, object_type: o.object_type },
      geometry: typeof o.geometry === 'string' ? JSON.parse(o.geometry) : o.geometry,
    })),
  };

  const initMap = useCallback(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [37.609, 55.762], // Москва, Тверская
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      // Источник кабелей
      map.addSource('cables', { type: 'geojson', data: cablesGeoJSON });
      
      // Слой кабелей — линии с цветом по типу прокладки
      map.addLayer({
        id: 'cables-line',
        type: 'line',
        source: 'cables',
        paint: {
          'line-color': [
            'match',
            ['get', 'laying_method'],
            'ground', LAYING_COLORS.ground,
            'sewer', LAYING_COLORS.sewer,
            'aerial', LAYING_COLORS.aerial,
            'wall', LAYING_COLORS.wall,
            '#888888',
          ],
          'line-width': 4,
          'line-opacity': 0.8,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Слой кабелей — hover
      map.addLayer({
        id: 'cables-line-hover',
        type: 'line',
        source: 'cables',
        paint: {
          'line-color': '#ffffff',
          'line-width': 6,
          'line-opacity': 0,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Источник объектов
      map.addSource('objects', { type: 'geojson', data: objectsGeoJSON });

      // Слой объектов — круги
      map.addLayer({
        id: 'objects-circle',
        type: 'circle',
        source: 'objects',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'object_type'],
            'olt', '#ef4444',
            'splitter', '#f59e0b',
            'cross_box', '#8b5cf6',
            'house', '#22c55e',
            'manhole', '#6b7280',
            'coupling', '#06b6d4',
            'substation', '#ec4899',
            '#3b82f6',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Слой объектов — метки
      map.addLayer({
        id: 'objects-labels',
        type: 'symbol',
        source: 'objects',
        layout: {
          'text-field': ['get', 'code'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });

      // Клик по кабелю
      map.on('click', 'cables-line', (e: maplibregl.MapMouseEvent) => {
        const features = (e as any).features;
        if (features && features.length > 0) {
          const props = features[0].properties;
          setSelectedFeature({ type: 'cable', id: props.id });
        }
      });

      // Клик по объекту
      map.on('click', 'objects-circle', (e: maplibregl.MapMouseEvent) => {
        const features = (e as any).features;
        if (features && features.length > 0) {
          const props = features[0].properties;
          setSelectedFeature({ type: 'object', id: props.id });
        }
      });

      // Курсор при наведении
      map.on('mouseenter', 'cables-line', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'cables-line', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'objects-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'objects-circle', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Обновление данных при изменении фильтров
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    const cablesSource = map.getSource('cables') as maplibregl.GeoJSONSource;
    const objectsSource = map.getSource('objects') as maplibregl.GeoJSONSource;
    
    if (cablesSource) cablesSource.setData(cablesGeoJSON);
    if (objectsSource) objectsSource.setData(objectsGeoJSON);
  }, [filters.cableType, filters.layingMethod, filters.objectType, filters.owner]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
