import io
import os
from app.core.config import settings

_minio_client = None
_minio_available = None


def get_minio_client():
    global _minio_client, _minio_available
    if _minio_available is False:
        return None
    if _minio_client is None:
        try:
            from minio import Minio
            client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE,
            )
            bucket = settings.MINIO_BUCKET
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
            _minio_client = client
            _minio_available = True
        except Exception:
            _minio_available = False
            return None
    return _minio_client


# Local fallback directory for dev
_LOCAL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


async def upload_file(
    file_data: bytes,
    object_name: str,
    content_type: str = "application/octet-stream",
) -> str:
    client = get_minio_client()
    if client:
        from minio import Minio
        client.put_object(
            settings.MINIO_BUCKET,
            object_name,
            io.BytesIO(file_data),
            len(file_data),
            content_type=content_type,
        )
    else:
        # Save to local filesystem in dev mode
        local_path = os.path.join(_LOCAL_DIR, object_name.replace("/", os.sep))
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(file_data)
    return f"/{settings.MINIO_BUCKET}/{object_name}"


def get_presigned_url(object_name: str, expires_hours: int = 24) -> str:
    client = get_minio_client()
    if client:
        from datetime import timedelta
        return client.presigned_get_object(
            settings.MINIO_BUCKET,
            object_name,
            expires=timedelta(hours=expires_hours),
        )
    # Return local path for dev
    return f"/uploads/{object_name}"


def delete_file(object_name: str) -> None:
    client = get_minio_client()
    if client:
        try:
            client.remove_object(settings.MINIO_BUCKET, object_name)
        except Exception:
            pass
