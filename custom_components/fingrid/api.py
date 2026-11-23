"""Fingrid's open data API, asked no more often than its limit of one request every two seconds per key."""

from __future__ import annotations

import asyncio
from collections.abc import Iterable
from datetime import datetime
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util.json import json_loads

from .const import API_URL, DOMAIN

TIMEOUT = aiohttp.ClientTimeout(total=30)
# Fingrid allows one request every two seconds per key, and a little more keeps clear of its clock.
SPACING = 2.2
# The largest page Fingrid serves. An hour of every real-time dataset or three days of the forecasts is far less.
PAGE_SIZE = 20000
TIME_FORMAT = "%Y-%m-%dT%H:%M:%SZ"
# Fingrid answers 429 to a request that breaks its limit, as one from another client on the same key can make ours do.
# Such a request is asked again once, after this many seconds.
RETRY_WAIT = 5
# A dataset that is always published, for checking a key.
CHECK_DATASET = 181


class FingridError(Exception):
    """Fingrid couldn't be reached or sent something unexpected."""


class FingridAuthError(FingridError):
    """Fingrid refused the API key."""


class _Spacing:
    """When each key last asked, shared by the config flow and the coordinators."""

    def __init__(self) -> None:
        self.lock = asyncio.Lock()
        self.last: dict[str, float] = {}


class Client:
    def __init__(self, hass: HomeAssistant, api_key: str) -> None:
        self._session = async_get_clientsession(hass)
        self._api_key = api_key
        self._spacing: _Spacing = hass.data.setdefault(f"{DOMAIN}_spacing", _Spacing())

    async def check(self) -> None:
        """Raise FingridAuthError for a key Fingrid refuses."""
        await self._get(f"/datasets/{CHECK_DATASET}/data/latest", {})

    async def data(self, datasets: Iterable[int], start: datetime, end: datetime) -> list[dict[str, Any]]:
        """The rows of the datasets between start and end, oldest first."""
        params = {
            "datasets": ",".join(str(dataset) for dataset in sorted(datasets)),
            "startTime": start.strftime(TIME_FORMAT),
            "endTime": end.strftime(TIME_FORMAT),
            "pageSize": str(PAGE_SIZE),
            "sortBy": "startTime",
            "sortOrder": "asc",
        }
        body = await self._get("/data", params)
        rows = body.get("data") if isinstance(body, dict) else None
        if not isinstance(rows, list):
            raise FingridError("Fingrid's answer has no rows")
        return rows

    async def _get(self, path: str, params: dict[str, str]) -> Any:
        status, raw = await self._request(path, params)
        if status == 429:
            await asyncio.sleep(RETRY_WAIT)
            status, raw = await self._request(path, params)
        # A missing or wrong key gets 401.
        if status == 401:
            raise FingridAuthError("Fingrid refused the API key")
        if status != 200:
            raise FingridError(f"Fingrid answered with status {status}")
        try:
            return json_loads(raw)
        except ValueError as err:
            raise FingridError("Fingrid sent something that isn't JSON") from err

    async def _request(self, path: str, params: dict[str, str]) -> tuple[int, bytes]:
        """One request, spaced from the key's last, as its status and body."""
        async with self._spacing.lock:
            loop = asyncio.get_running_loop()
            wait = self._spacing.last.get(self._api_key, -SPACING) + SPACING - loop.time()
            if wait > 0:
                await asyncio.sleep(wait)
            try:
                async with self._session.get(
                    f"{API_URL}{path}", params=params, headers={"x-api-key": self._api_key}, timeout=TIMEOUT
                ) as response:
                    return response.status, await response.read()
            except aiohttp.ClientError as err:
                raise FingridError(f"Fingrid couldn't be reached: {err}") from err
            except TimeoutError as err:
                raise FingridError("Fingrid didn't answer in time") from err
            finally:
                self._spacing.last[self._api_key] = loop.time()
