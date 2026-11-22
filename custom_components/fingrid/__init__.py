"""Fingrid: Finland's electricity production, consumption, cross-border transmission and grid state from Fingrid's open data.

One config entry holds the API key. Its sensors are on one service device, and only the datasets of enabled sensors
are asked for, as enabling or disabling one reloads the entry. The integration serves its card and keeps it in the
dashboards' resources.
"""

from __future__ import annotations

from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from homeassistant.const import CONF_API_KEY, Platform
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import service
from homeassistant.helpers.typing import ConfigType

from .api import Client
from .card import async_add_card_resource, async_remove_card_resource, async_serve_card
from .const import DOMAIN, SERVICE_GET_FORECAST
from .coordinator import FingridConfigEntry, FingridRuntimeData, ForecastCoordinator, RealtimeCoordinator
from .datasets import SENSORS, FingridSensorDescription

PLATFORMS = [Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    await async_serve_card(hass)
    service.async_register_platform_entity_service(
        hass,
        DOMAIN,
        SERVICE_GET_FORECAST,
        entity_domain=SENSOR_DOMAIN,
        schema=None,
        func="async_get_forecast",
        supports_response=SupportsResponse.ONLY,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: FingridConfigEntry) -> bool:
    await async_add_card_resource(hass)
    client = Client(hass, entry.data[CONF_API_KEY])
    enabled = [description for description in SENSORS if _enabled(hass, entry, description)]
    realtime = RealtimeCoordinator(hass, entry, client, {d.dataset for d in enabled if not d.forecast})
    forecasts = ForecastCoordinator(hass, entry, client, {d.dataset for d in enabled if d.forecast})
    await realtime.async_config_entry_first_refresh()
    await forecasts.async_config_entry_first_refresh()
    entry.runtime_data = FingridRuntimeData(realtime, forecasts)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


def _enabled(hass: HomeAssistant, entry: FingridConfigEntry, description: FingridSensorDescription) -> bool:
    """Whether the sensor is enabled, or will be once added for the first time."""
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(SENSOR_DOMAIN, DOMAIN, f"{entry.entry_id}_{description.key}")
    entity = registry.async_get(entity_id) if entity_id else None
    if entity is None:
        return description.entity_registry_enabled_default
    return entity.disabled_by is None


async def async_unload_entry(hass: HomeAssistant, entry: FingridConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: FingridConfigEntry) -> None:
    await async_remove_card_resource(hass)
