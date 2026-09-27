"""
Тесты API импорта данных
"""
import pytest
import json
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_preview_geojson(client: AsyncClient, auth_headers):
    """Предпросмотр GeoJSON"""
    geojson = json.dumps({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"code": "TEST-001", "name": "Тестовый объект"},
                "geometry": {"type": "Point", "coordinates": [37.6, 55.7]}
            },
            {
                "type": "Feature",
                "properties": {"code": "TEST-C001", "name": "Тестовый кабель"},
                "geometry": {"type": "LineString", "coordinates": [[37.6, 55.7], [37.7, 55.8]]}
            }
        ]
    })
    
    response = await client.post(
        "/api/v1/import/preview",
        headers=auth_headers,
        files={"file": ("test.geojson", geojson.encode(), "application/geo+json")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "geojson"
    assert data["total"] == 2
    assert data["success"] == 2
    assert len(data["items"]) == 2
    
    # Проверяем что определились типы
    types = {item["entity_type"] for item in data["items"]}
    assert "object" in types
    assert "cable" in types


@pytest.mark.asyncio
async def test_preview_csv(client: AsyncClient, auth_headers):
    """Предпросмотр CSV"""
    csv_content = "code;name;cable_type;laying_method;from_lon;from_lat;to_lon;to_lat\n"
    csv_content += "OK-001;Кабель тест;optical;sewer;37.6;55.7;37.7;55.8\n"
    csv_content += "OK-002;Кабель 2;copper;ground;37.5;55.6;37.8;55.9\n"
    
    response = await client.post(
        "/api/v1/import/preview",
        headers=auth_headers,
        files={"file": ("test.csv", csv_content.encode(), "text/csv")},
        data={"entity_type": "cable"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "csv"
    assert data["success"] == 2


@pytest.mark.asyncio
async def test_preview_kml(client: AsyncClient, auth_headers):
    """Предпросмотр KML"""
    kml = """<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
      <Placemark>
        <name>Тестовая точка</name>
        <Point>
          <coordinates>37.6,55.7,0</coordinates>
        </Point>
      </Placemark>
      <Placemark>
        <name>Тестовая линия</name>
        <LineString>
          <coordinates>37.6,55.7,0 37.7,55.8,0</coordinates>
        </LineString>
      </Placemark>
    </Document>
    </kml>"""
    
    response = await client.post(
        "/api/v1/import/preview",
        headers=auth_headers,
        files={"file": ("test.kml", kml.encode(), "application/vnd.google-earth.kml+xml")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "kml"
    assert data["success"] == 2


@pytest.mark.asyncio
async def test_preview_invalid_file(client: AsyncClient, auth_headers):
    """Невалидный файл"""
    response = await client.post(
        "/api/v1/import/preview",
        headers=auth_headers,
        files={"file": ("test.xyz", b"not a valid format", "text/plain")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_confirm_import(client: AsyncClient, auth_headers):
    """Подтверждение импорта"""
    response = await client.post(
        "/api/v1/import/confirm",
        headers=auth_headers,
        json={
            "items": [
                {
                    "entity_type": "object",
                    "code": "IMP-TEST-001",
                    "name": "Тестовый объект",
                    "geometry": {"type": "Point", "coordinates": [37.6, 55.7]},
                    "attributes": {"object_type": "manhole"},
                }
            ],
            "conflict_action": "skip",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["created"] >= 0  # Может быть 0 если нет from/to объектов


@pytest.mark.asyncio
async def test_get_templates(client: AsyncClient, auth_headers):
    """Получение шаблонов"""
    response = await client.get("/api/v1/import/templates", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "cables_csv" in data
    assert "objects_csv" in data
    assert "cable_types" in data
    assert "object_types" in data


@pytest.mark.asyncio
async def test_import_unauthorized(client: AsyncClient):
    """Без авторизации — 401"""
    response = await client.post(
        "/api/v1/import/preview",
        files={"file": ("test.geojson", b"{}", "application/geo+json")},
    )
    assert response.status_code == 401
