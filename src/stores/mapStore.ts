/**
 * Zustand store — состояние карты и фильтры
 */
import { create } from 'zustand';
import type { Cable, InfraObject, MapFilters, CableType, LayingMethod, ObjectType } from '../types';

interface MapStore {
  // Данные
  cables: Cable[];
  objects: InfraObject[];
  
  // Фильтры
  filters: MapFilters;
  
  // UI карты
  selectedFeature: { type: 'cable' | 'object'; id: number } | null;
  drawMode: 'none' | 'line' | 'point';
  drawerOpen: boolean;
  
  // Actions
  setFilters: (filters: Partial<MapFilters>) => void;
  setSelectedFeature: (feature: { type: 'cable' | 'object'; id: number } | null) => void;
  setDrawMode: (mode: 'none' | 'line' | 'point') => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  cables: [],
  objects: [],
  
  filters: {
    cableType: null,
    layingMethod: null,
    objectType: null,
    owner: null,
  },
  
  selectedFeature: null,
  drawMode: 'none',
  drawerOpen: false,
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  setSelectedFeature: (feature) => set({ 
    selectedFeature: feature,
    drawerOpen: feature !== null 
  }),
  
  setDrawMode: (mode) => set({ drawMode: mode }),
  setDrawerOpen: (open) => set({ drawerOpen: open, selectedFeature: open ? undefined : null } as any),
}));
