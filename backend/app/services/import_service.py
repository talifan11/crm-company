"""
Сервис импорта данных из KML, GeoJSON, CSV
"""
import xml.etree.ElementTree as ET
import json
import csv
import io
import zipfile
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum


class ImportFormat(str, Enum):
    kml = "kml"
    kmz = "kmz"
    geojson = "geojson"
    csv = "csv"


class ConflictAction(str, Enum):
    skip = "skip"
    merge = "merge"
    overwrite = "overwrite"


@dataclass
class ImportItem:
    """Элемент для импорта"""
    entity_type: str  # 'cable' или 'object'
    code: str
    name: str
    geometry: str  # GeoJSON
    attributes: Dict[str, Any] = field(default_factory=dict)
    layer_name: str = ""
    row_index: int = 0


@dataclass
class ImportResult:
    """Результат импорта"""
    total: int = 0
    success: int = 0
    errors: int = 0
    duplicates: int = 0
    items: List[ImportItem] = field(default_factory=list)
    error_messages: List[str] = field(default_factory=list)
    duplicate_codes: List[str] = field(default_factory=list)


class ImportService:
    """Сервис парсинга файлов импорта"""
    
    def parse_kml(self, content: bytes) -> ImportResult:
        """Парсинг KML файла"""
        result = ImportResult()
        
        try:
            # KML — это XML
            root = ET.fromstring(content)
            ns = {'kml': 'http://www.opengis.net/kml/2.2'}
            
            # Обходим все Placemark
            for idx, placemark in enumerate(root.iter('{http://www.opengis.net/kml/2.2}Placemark')):
                result.total += 1
                
                # Имя
                name_el = placemark.find('{http://www.opengis.net/kml/2.2}name')
                name = name_el.text if name_el is not None else f"Import_{idx}"
                
                # Описание (может содержать код)
                desc_el = placemark.find('{http://www.opengis.net/kml/2.2}description')
                description = desc_el.text if desc_el is not None else ""
                
                # Определяем тип геометрии
                point = placemark.find('{http://www.opengis.net/kml/2.2}Point')
                line = placemark.find('{http://www.opengis.net/kml/2.2}LineString')
                
                geometry = None
                entity_type = None
                
                if point is not None:
                    coords_el = point.find('{http://www.opengis.net/kml/2.2}coordinates')
                    if coords_el is not None and coords_el.text:
                        coords = self._parse_kml_coordinates(coords_el.text.strip())
                        if coords:
                            geometry = json.dumps({"type": "Point", "coordinates": coords[0]})
                            entity_type = "object"
                
                elif line is not None:
                    coords_el = line.find('{http://www.opengis.net/kml/2.2}coordinates')
                    if coords_el is not None and coords_el.text:
                        coords = self._parse_kml_coordinates(coords_el.text.strip())
                        if coords:
                            geometry = json.dumps({"type": "LineString", "coordinates": coords})
                            entity_type = "cable"
                
                if geometry and entity_type:
                    # Генерируем код из имени
                    code = self._generate_code(name, entity_type, idx)
                    
                    # ExtendedData (дополнительные атрибуты)
                    attributes = self._parse_extended_data(placemark)
                    
                    item = ImportItem(
                        entity_type=entity_type,
                        code=code,
                        name=name,
                        geometry=geometry,
                        attributes=attributes,
                        layer_name="KML Import",
                        row_index=idx,
                    )
                    result.items.append(item)
                    result.success += 1
                else:
                    result.errors += 1
                    result.error_messages.append(f"Строка {idx}: не удалось определить геометрию")
        
        except ET.ParseError as e:
            result.errors += 1
            result.error_messages.append(f"Ошибка парсинга XML: {str(e)}")
        except Exception as e:
            result.errors += 1
            result.error_messages.append(f"Неизвестная ошибка: {str(e)}")
        
        return result
    
    def parse_kmz(self, content: bytes) -> ImportResult:
        """Парсинг KMZ (zip-архив с KML внутри)"""
        result = ImportResult()
        
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                # Ищем .kml файл в архиве
                kml_files = [f for f in zf.namelist() if f.endswith('.kml')]
                if not kml_files:
                    result.error_messages.append("KMZ архив не содержит .kml файл")
                    return result
                
                # Берём первый KML
                kml_content = zf.read(kml_files[0])
                return self.parse_kml(kml_content)
        
        except zipfile.BadZipFile:
            result.error_messages.append("Файл не является валидным ZIP/KMZ архивом")
        except Exception as e:
            result.error_messages.append(f"Ошибка чтения KMZ: {str(e)}")
        
        return result
    
    def parse_geojson(self, content: bytes) -> ImportResult:
        """Парсинг GeoJSON"""
        result = ImportResult()
        
        try:
            data = json.loads(content.decode('utf-8'))
            
            features = []
            if data.get('type') == 'FeatureCollection':
                features = data.get('features', [])
            elif data.get('type') == 'Feature':
                features = [data]
            else:
                result.error_messages.append("Ожидается FeatureCollection или Feature")
                return result
            
            for idx, feature in enumerate(features):
                result.total += 1
                
                props = feature.get('properties', {})
                geometry = feature.get('geometry')
                
                if not geometry:
                    result.errors += 1
                    result.error_messages.append(f"Feature {idx}: нет геометрии")
                    continue
                
                geom_type = geometry.get('type', '')
                
                if geom_type == 'Point':
                    entity_type = 'object'
                elif geom_type == 'LineString':
                    entity_type = 'cable'
                else:
                    result.errors += 1
                    result.error_messages.append(f"Feature {idx}: неподдерживаемый тип {geom_type}")
                    continue
                
                # Код и имя из properties
                code = props.get('code') or props.get('CODE') or self._generate_code(
                    props.get('name', props.get('NAME', f'Import_{idx}')),
                    entity_type, idx
                )
                name = props.get('name') or props.get('NAME') or code
                
                item = ImportItem(
                    entity_type=entity_type,
                    code=str(code),
                    name=str(name),
                    geometry=json.dumps(geometry),
                    attributes={k: v for k, v in props.items() if k not in ('code', 'name', 'CODE', 'NAME')},
                    layer_name=data.get('name', 'GeoJSON Import'),
                    row_index=idx,
                )
                result.items.append(item)
                result.success += 1
        
        except json.JSONDecodeError as e:
            result.error_messages.append(f"Ошибка парсинга JSON: {str(e)}")
        except Exception as e:
            result.error_messages.append(f"Неизвестная ошибка: {str(e)}")
        
        return result
    
    def parse_csv(self, content: bytes, entity_type: str = 'cable') -> ImportResult:
        """Парсинг CSV (кабели или объекты)"""
        result = ImportResult()
        
        try:
            text = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(text), delimiter=';')
            
            # Определяем обязательные колонки
            if entity_type == 'cable':
                required = ['code', 'name', 'cable_type', 'laying_method', 'from_lon', 'from_lat', 'to_lon', 'to_lat']
            else:
                required = ['code', 'name', 'object_type', 'lon', 'lat']
            
            if not reader.fieldnames:
                result.error_messages.append("CSV файл пуст или не имеет заголовков")
                return result
            
            # Проверяем наличие колонок (case-insensitive)
            fieldnames_lower = {f.lower().strip(): f for f in reader.fieldnames}
            missing = [r for r in required if r not in fieldnames_lower]
            if missing:
                result.error_messages.append(f"Отсутствуют колонки: {', '.join(missing)}")
                return result
            
            for idx, row in enumerate(reader):
                result.total += 1
                
                # Нормализуем ключи
                row_norm = {k.lower().strip(): v.strip() if v else '' for k, v in row.items()}
                
                code = row_norm.get('code', '')
                name = row_norm.get('name', '')
                
                if not code or not name:
                    result.errors += 1
                    result.error_messages.append(f"Строка {idx + 2}: code и name обязательны")
                    continue
                
                try:
                    if entity_type == 'cable':
                        from_lon = float(row_norm['from_lon'])
                        from_lat = float(row_norm['from_lat'])
                        to_lon = float(row_norm['to_lon'])
                        to_lat = float(row_norm['to_lat'])
                        geometry = json.dumps({
                            "type": "LineString",
                            "coordinates": [[from_lon, from_lat], [to_lon, to_lat]]
                        })
                    else:
                        lon = float(row_norm['lon'])
                        lat = float(row_norm['lat'])
                        geometry = json.dumps({
                            "type": "Point",
                            "coordinates": [lon, lat]
                        })
                except (ValueError, KeyError) as e:
                    result.errors += 1
                    result.error_messages.append(f"Строка {idx + 2}: ошибка координат — {str(e)}")
                    continue
                
                # Собираем атрибуты
                attributes = {k: v for k, v in row_norm.items() if k not in required}
                
                item = ImportItem(
                    entity_type=entity_type,
                    code=code,
                    name=name,
                    geometry=geometry,
                    attributes=attributes,
                    layer_name="CSV Import",
                    row_index=idx + 2,  # +2 т.к. заголовок + 1-indexed
                )
                result.items.append(item)
                result.success += 1
        
        except UnicodeDecodeError:
            result.error_messages.append("Файл не в кодировке UTF-8")
        except Exception as e:
            result.error_messages.append(f"Ошибка парсинга CSV: {str(e)}")
        
        return result
    
    def detect_format(self, filename: str, content: bytes) -> Optional[ImportFormat]:
        """Определение формата файла по расширению и содержимому"""
        ext = filename.lower().rsplit('.', 1)[-1] if '.' in filename else ''
        
        if ext == 'kml':
            return ImportFormat.kml
        elif ext == 'kmz':
            return ImportFormat.kmz
        elif ext == 'geojson' or ext == 'json':
            return ImportFormat.geojson
        elif ext == 'csv':
            return ImportFormat.csv
        
        # Пробуем по содержимому
        if content[:5] == b'PK\x03\x04':  # ZIP signature
            return ImportFormat.kmz
        if content[:1] == b'<' and b'<kml' in content[:500]:
            return ImportFormat.kml
        if content[:1] == b'{' or content[:1] == b'[':
            try:
                data = json.loads(content)
                if isinstance(data, dict) and data.get('type') in ('FeatureCollection', 'Feature'):
                    return ImportFormat.geojson
            except:
                pass
        
        return None
    
    def _parse_kml_coordinates(self, text: str) -> List[List[float]]:
        """Парсинг координат KML (lon,lat,alt ...)"""
        coords = []
        for pair in text.split():
            parts = pair.split(',')
            if len(parts) >= 2:
                try:
                    lon = float(parts[0])
                    lat = float(parts[1])
                    coords.append([lon, lat])
                except ValueError:
                    continue
        return coords
    
    def _generate_code(self, name: str, entity_type: str, idx: int) -> str:
        """Генерация кода из имени"""
        prefix = "IMP-C" if entity_type == "cable" else "IMP-O"
        # Берём первые буквы имени
        clean = ''.join(c for c in name.upper() if c.isalnum())[:6]
        return f"{prefix}-{clean}-{idx:04d}"
    
    def _parse_extended_data(self, placemark) -> Dict[str, Any]:
        """Парсинг ExtendedData из KML"""
        attrs = {}
        ext_data = placemark.find('{http://www.opengis.net/kml/2.2}ExtendedData')
        if ext_data is not None:
            for data in ext_data.findall('{http://www.opengis.net/kml/2.2}Data'):
                name = data.get('name', '')
                value_el = data.find('{http://www.opengis.net/kml/2.2}value')
                if name and value_el is not None and value_el.text:
                    attrs[name] = value_el.text
        return attrs


# Singleton
import_service = ImportService()
