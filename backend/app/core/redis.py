from app.core.config import settings

_redis_client = None


async def get_redis():
    global _redis_client
    if _redis_client is None:
        if settings.REDIS_URL.startswith("memory://"):
            import fakeredis.aioredis as fakeredis
            _redis_client = fakeredis.FakeRedis(decode_responses=True)
        else:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
    return _redis_client


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
