"""
Сервис для работы с MinIO (S3-совместимое хранилище)
"""
from minio import Minio
from minio.error import S3Error
from datetime import timedelta
import uuid
from app.config import settings


class MinIOService:
    """Клиент для работы с MinIO"""
    
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()
    
    def _ensure_bucket(self):
        """Создать бакет если не существует"""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except S3Error as e:
            print(f"MinIO error: {e}")
    
    def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        """
        Загрузить файл в MinIO.
        Возвращает file_key (путь в бакете).
        """
        # Генерируем уникальный ключ
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        file_key = f"documents/{uuid.uuid4()}.{ext}"
        
        from io import BytesIO
        data = BytesIO(file_content)
        
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=file_key,
            data=data,
            length=len(file_content),
            content_type=content_type,
        )
        
        return file_key
    
    def get_presigned_url(self, file_key: str, expires: int = 3600) -> str:
        """
        Получить presigned URL для скачивания.
        expires — время жизни ссылки в секундах (по умолчанию 1 час).
        """
        url = self.client.presigned_get_object(
            bucket_name=self.bucket,
            object_name=file_key,
            expires=timedelta(seconds=expires),
        )
        return url
    
    def delete_file(self, file_key: str) -> bool:
        """Удалить файл из MinIO"""
        try:
            self.client.remove_object(
                bucket_name=self.bucket,
                object_name=file_key,
            )
            return True
        except S3Error:
            return False


# Singleton
minio_service = MinIOService()
