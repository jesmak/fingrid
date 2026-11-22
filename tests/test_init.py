"""Setting up: the sensors, the datasets asked for, the forecasts' quarters and the get_forecast action."""

from datetime import timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import SOURCE_REAUTH, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant.common import async_fire_time_changed
from pytest_homeassistant.test_util.aiohttp import AiohttpClientMocker

from custom_components.fingrid import api
from custom_components.fingrid.const import DOMAIN, SERVICE_GET_FORECAST
from custom_components.fingrid.datasets import SENSORS

from .conftest import CHECK_URL, DATA_URL, NOW, ROWS, answer, fingrid_entry, requested

ENABLED = {d.dataset for d in SENSORS if d.entity_registry_enabled_default}


async def setup(hass: HomeAssistant):
    entry = fingrid_entry(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_sensors(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    await setup(hass)
    production = hass.states.get("sensor.fingrid_production")
    assert production is not None
    assert production.state == "13531.1"
    assert production.attributes["unit_of_measurement"] == "MW"
    assert production.attributes["attribution"] == "Source Fingrid / data.fingrid.fi, license CC BY 4.0"
    # Fingrid's own sign: negative is import into Finland.
    assert hass.states.get("sensor.fingrid_export_to_northern_sweden").state == "-81.785"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_export_from_aland_to_sweden").state == "4.867"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_non_fossil_share_of_production").state == "97.58"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_power_system_state").state == "normal"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_electricity_shortage").state == "normal"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_wind_power_forecast").state == "7114.6"  # type: ignore[union-attr]
    # Disabled by default.
    assert hass.states.get("sensor.fingrid_electric_boilers") is None
    assert er.async_get(hass).async_get("sensor.fingrid_electric_boilers").disabled_by is er.RegistryEntryDisabler.INTEGRATION  # type: ignore[union-attr]


async def test_a_reload_asks_for_the_datasets_enabled_in_the_registry(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    entry = await setup(hass)
    forecasts = {d.dataset for d in SENSORS if d.forecast}
    assert requested(fingrid) == [ENABLED - forecasts, forecasts]

    # Home Assistant reloads the entry when a sensor is enabled or disabled.
    registry = er.async_get(hass)
    registry.async_update_entity("sensor.fingrid_electric_boilers", disabled_by=None)
    registry.async_update_entity("sensor.fingrid_production", disabled_by=er.RegistryEntryDisabler.USER)
    fingrid.mock_calls.clear()
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert requested(fingrid)[0] == (ENABLED - forecasts - {192}) | {371}
    assert hass.states.get("sensor.fingrid_electric_boilers").state == "1264.52"  # type: ignore[union-attr]


async def test_no_request_without_enabled_datasets(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    entry = await setup(hass)
    registry = er.async_get(hass)
    for entity_id in ("sensor.fingrid_wind_power_forecast", "sensor.fingrid_solar_power_forecast", "sensor.fingrid_consumption_forecast"):
        registry.async_update_entity(entity_id, disabled_by=er.RegistryEntryDisabler.USER)
    fingrid.mock_calls.clear()
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    forecasts = {d.dataset for d in SENSORS if d.forecast}
    assert requested(fingrid) == [ENABLED - forecasts]


async def test_a_dataset_missing_from_the_answer(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, freezer: FrozenDateTimeFactory
) -> None:
    freezer.move_to(NOW)
    aioclient_mock.get(DATA_URL, side_effect=answer([row for row in ROWS if row["datasetId"] != 181]))
    await setup(hass)
    assert hass.states.get("sensor.fingrid_wind_power").state == STATE_UNAVAILABLE  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_production").state == "13531.1"  # type: ignore[union-attr]


async def test_an_unknown_code(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, freezer: FrozenDateTimeFactory, caplog: pytest.LogCaptureFixture
) -> None:
    freezer.move_to(NOW)
    rows = [{**row, "value": 7} if row["datasetId"] == 209 else row for row in ROWS]
    aioclient_mock.get(DATA_URL, side_effect=answer(rows))
    await setup(hass)
    assert hass.states.get("sensor.fingrid_power_system_state").state == STATE_UNKNOWN  # type: ignore[union-attr]
    # The next update sends the same code, which isn't warned about again.
    freezer.tick(timedelta(minutes=3))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert caplog.text.count("Fingrid sent the code 7 for sensor.fingrid_power_system_state") == 1


async def test_forecast_moves_on_with_the_quarter(
    hass: HomeAssistant, fingrid: AiohttpClientMocker, freezer: FrozenDateTimeFactory
) -> None:
    await setup(hass)
    forecasts = {d.dataset for d in SENSORS if d.forecast}
    freezer.move_to(NOW.replace(minute=15, second=0))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.fingrid_wind_power_forecast").state == "7121.1"  # type: ignore[union-attr]
    assert hass.states.get("sensor.fingrid_consumption_forecast").state == "12528.0"  # type: ignore[union-attr]
    # The quarter came from the rows already fetched. Only the real-time update has asked again.
    assert requested(fingrid).count(forecasts) == 1


async def test_get_forecast(hass: HomeAssistant, fingrid: AiohttpClientMocker, freezer: FrozenDateTimeFactory) -> None:
    await setup(hass)
    # Past the 18:00 quarter, before the next update at 18:15:05.
    freezer.move_to(NOW.replace(minute=15, second=2))
    response = await hass.services.async_call(
        DOMAIN, SERVICE_GET_FORECAST, {"entity_id": "sensor.fingrid_wind_power_forecast"}, blocking=True, return_response=True
    )
    forecast = response["sensor.fingrid_wind_power_forecast"]["forecast"]  # type: ignore[index]
    assert forecast[0] == {"start": "2026-11-22T18:15:00+00:00", "end": "2026-11-22T18:30:00+00:00", "value": 7121.1}
    # The fixture's last quarter is 20:00–20:15.
    assert len(forecast) == 8


async def test_get_forecast_of_a_measurement(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    await setup(hass)
    with pytest.raises(ServiceValidationError, match="sensor.fingrid_wind_power isn't a forecast"):
        await hass.services.async_call(
            DOMAIN, SERVICE_GET_FORECAST, {"entity_id": "sensor.fingrid_wind_power"}, blocking=True, return_response=True
        )


async def test_refused_key_asks_for_a_new_one(hass: HomeAssistant, fingrid: AiohttpClientMocker, freezer: FrozenDateTimeFactory) -> None:
    entry = await setup(hass)
    fingrid.clear_requests()
    fingrid.get(DATA_URL, status=401, json={"statusCode": 401})
    freezer.tick(timedelta(minutes=3))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert [flow["context"]["source"] for flow in hass.config_entries.flow.async_progress_by_handler(DOMAIN)] == [SOURCE_REAUTH]
    assert entry.state is ConfigEntryState.LOADED


async def test_unreachable_at_start(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, freezer: FrozenDateTimeFactory) -> None:
    freezer.move_to(NOW)
    aioclient_mock.get(DATA_URL, status=500)
    entry = fingrid_entry(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_requests_are_spaced(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, monkeypatch: pytest.MonkeyPatch) -> None:
    # No frozen clock here, as freezegun stops the loop's clock and the wait with it.
    aioclient_mock.get(CHECK_URL, json={})
    monkeypatch.setattr(api, "SPACING", 0.3)
    client = api.Client(hass, "a")
    loop = hass.loop
    await client.check()
    started = loop.time()
    await client.check()
    assert loop.time() - started >= 0.29
    # Another key has a spacing of its own.
    started = loop.time()
    await api.Client(hass, "b").check()
    assert loop.time() - started < 0.29
