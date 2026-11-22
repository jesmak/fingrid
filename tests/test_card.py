"""The card that comes with the integration: served, and kept in the dashboards' resources."""

import logging

import pytest
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
from homeassistant.setup import async_setup_component
from pytest_homeassistant.common import MockConfigEntry
from pytest_homeassistant.test_util.aiohttp import AiohttpClientMocker

from custom_components.fingrid.const import DOMAIN

from .conftest import fingrid_entry

CARD = "/fingrid/fingrid-card.js"
OLD = f"{CARD}?v=0.9.0"
OLDER = f"{CARD}?v=0.8.0"
OTHER = "/hacsfiles/some-card/some-card.js"
# Stands for the card's resource at the integration's current version.
CURRENT = "current"


async def _url(hass: HomeAssistant, url: str) -> str:
    return f"{CARD}?v={(await async_get_integration(hass, DOMAIN)).version}" if url == CURRENT else url


def _store(hass_storage, urls: list[str]) -> None:
    """Resources as Home Assistant keeps them between starts, not yet loaded when the integration starts."""
    items = [{"id": f"resource{index}", "type": "module", "url": url} for index, url in enumerate(urls)]
    hass_storage["lovelace_resources"] = {"version": 1, "minor_version": 1, "key": "lovelace_resources", "data": {"items": items}}


async def _setup(hass: HomeAssistant, hass_storage, resources: list[str], yaml: bool = False) -> MockConfigEntry:
    """The integration, started with the given resources."""
    urls = [await _url(hass, url) for url in resources]
    if yaml:
        config = {"resource_mode": "yaml", "resources": [{"url": url, "type": "module"} for url in urls]}
        assert await async_setup_component(hass, "lovelace", {"lovelace": config})
    else:
        _store(hass_storage, urls)
        assert await async_setup_component(hass, "lovelace", {})
    entry = fingrid_entry(hass)
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()
    return entry


async def _urls(hass: HomeAssistant) -> list[str]:
    resources = hass.data[LOVELACE_DATA].resources
    await resources.async_get_info()
    return [item["url"] for item in resources.async_items()]


def _warnings(caplog) -> list[str]:
    return [record.getMessage() for record in caplog.records if record.name.endswith(".card") and record.levelno == logging.WARNING]


@pytest.mark.parametrize(
    ("before", "after"),
    [
        # One resource of the card's own, at the current version, is kept in place of any others of its own.
        ([], [CURRENT]),
        ([OTHER], [OTHER, CURRENT]),
        ([CURRENT], [CURRENT]),
        ([OLD], [CURRENT]),
        ([CARD], [CURRENT]),
        ([OLD, CURRENT], [CURRENT]),
        ([CURRENT, OLD], [CURRENT]),
        ([OLDER, OLD], [CURRENT]),
        ([CURRENT, CURRENT], [CURRENT]),
        ([OTHER, OLD, OTHER], [OTHER, CURRENT, OTHER]),
        # The current one is the one kept, and nothing else moves.
        ([OLD, OTHER, CURRENT], [OTHER, CURRENT]),
    ],
)
async def test_storage_mode_keeps_one_resource_at_the_current_version(
    hass: HomeAssistant, hass_storage, fingrid: AiohttpClientMocker, caplog, before, after
):
    await _setup(hass, hass_storage, before)
    assert await _urls(hass) == [await _url(hass, url) for url in after]
    # A resource already current is kept as it is, not replaced by another updated to it.
    if CURRENT in before:
        ids = [item["id"] for item in hass.data[LOVELACE_DATA].resources.async_items() if item["url"] == await _url(hass, CURRENT)]
        assert ids == [f"resource{before.index(CURRENT)}"]
    assert _warnings(caplog) == []


@pytest.mark.parametrize(
    ("resources", "asked"),
    [
        ([], "add"),
        ([OTHER], "add"),
        ([OLD], "change"),
        ([CARD], "change"),
        ([CURRENT], None),
        ([OLD, CURRENT], None),
        ([CURRENT, OLD], None),
        # Of several earlier ones, the first is the one to change.
        ([OLDER, OLD], "change"),
    ],
)
async def test_yaml_mode_is_left_alone_and_asks_for_the_current_line(
    hass: HomeAssistant, hass_storage, fingrid: AiohttpClientMocker, caplog, resources, asked
):
    await _setup(hass, hass_storage, resources, yaml=True)
    current = await _url(hass, CURRENT)
    assert await _urls(hass) == [await _url(hass, url) for url in resources]
    warnings = _warnings(caplog)
    if asked is None:
        assert warnings == []
    elif asked == "add":
        assert len(warnings) == 1
        assert f"Add url: {current}, type: module to them" in warnings[0]
    else:
        assert len(warnings) == 1
        assert f"Change {resources[0]} in them to {current}" in warnings[0]


async def test_removing_the_integration_in_yaml_mode_asks_to_remove_its_lines(
    hass: HomeAssistant, hass_storage, fingrid: AiohttpClientMocker, caplog
):
    entry = await _setup(hass, hass_storage, [OTHER, OLD, CURRENT], yaml=True)
    caplog.clear()
    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert await _urls(hass) == [OTHER, OLD, await _url(hass, CURRENT)]
    warnings = _warnings(caplog)
    assert len(warnings) == 2
    assert f"Remove {OLD} from them" in warnings[0]
    assert f"Remove {await _url(hass, CURRENT)} from them" in warnings[1]


async def test_removing_the_integration_removes_its_resources(hass: HomeAssistant, hass_storage, fingrid: AiohttpClientMocker):
    entry = await _setup(hass, hass_storage, [OTHER, OLD, CURRENT])
    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert await _urls(hass) == [OTHER]


async def test_the_card_is_served(hass: HomeAssistant, hass_storage, fingrid: AiohttpClientMocker, hass_client):
    await _setup(hass, hass_storage, [])
    response = await (await hass_client()).get(await _url(hass, CURRENT))
    assert response.status == 200
    assert "fingrid-card" in await response.text()
