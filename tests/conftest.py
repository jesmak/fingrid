"""Shared fixtures: Fingrid's API answering from rows of a real response, filtered as Fingrid filters them."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant.common import MockConfigEntry
from pytest_homeassistant.test_util.aiohttp import AiohttpClientMocker, AiohttpClientMockResponse
from yarl import URL

from custom_components.fingrid import api
from custom_components.fingrid.const import API_URL, DOMAIN

# The rows are from 2026-11-22: the real-time datasets' last few before 18:00 UTC, the forecasts' first quarters.
ROWS: list[dict[str, Any]] = json.loads((Path(__file__).parent / "fixtures" / "data.json").read_text())
NOW = datetime(2026, 11, 22, 18, 0, 5, tzinfo=UTC)
API_KEY = "0123456789abcdef0123456789abcdef"
DATA_URL = f"{API_URL}/data"
CHECK_URL = f"{API_URL}/datasets/{api.CHECK_DATASET}/data/latest"


@pytest.fixture(autouse=True)
def no_spacing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(api, "SPACING", 0)


def answer(rows: list[dict[str, Any]]):
    """An answer to /data with the rows of the datasets and the time range asked for."""

    async def respond(method: str, url: URL, data: Any) -> AiohttpClientMockResponse:
        datasets = {int(dataset) for dataset in url.query["datasets"].split(",")}
        start, end = dt_util.parse_datetime(url.query["startTime"]), dt_util.parse_datetime(url.query["endTime"])
        assert start is not None and end is not None
        found = [
            row for row in rows if row["datasetId"] in datasets and start <= (dt_util.parse_datetime(row["startTime"]) or start) <= end
        ]
        return AiohttpClientMockResponse(method, url, json={"data": found, "pagination": {"total": len(found)}})

    return respond


@pytest.fixture
def fingrid(aioclient_mock: AiohttpClientMocker, freezer: FrozenDateTimeFactory) -> AiohttpClientMocker:
    freezer.move_to(NOW)
    aioclient_mock.get(DATA_URL, side_effect=answer(ROWS))
    aioclient_mock.get(CHECK_URL, json={"datasetId": api.CHECK_DATASET, "value": 6887.44})
    return aioclient_mock


def fingrid_entry(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, title="Fingrid", data={CONF_API_KEY: API_KEY})
    entry.add_to_hass(hass)
    return entry


def requested(aioclient_mock: AiohttpClientMocker) -> list[set[int]]:
    """The datasets of each /data request made."""
    return [
        {int(dataset) for dataset in url.query["datasets"].split(",")}
        for method, url, _data, _headers in aioclient_mock.mock_calls
        if str(url).startswith(DATA_URL)
    ]
