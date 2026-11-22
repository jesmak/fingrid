"""The two updates: the real-time measurements every three minutes, the forecasts every 15."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .api import Client, FingridAuthError, FingridError
from .const import DOMAIN, FORECAST_AHEAD, FORECAST_INTERVAL, REALTIME_INTERVAL, REALTIME_WINDOW
from .datasets import Reading, latest, series

_LOGGER = logging.getLogger(__name__)


@dataclass
class FingridRuntimeData:
    realtime: RealtimeCoordinator
    forecasts: ForecastCoordinator


type FingridConfigEntry = ConfigEntry[FingridRuntimeData]


class RealtimeCoordinator(DataUpdateCoordinator[dict[int, Reading]]):
    """Each enabled dataset's newest reading."""

    config_entry: FingridConfigEntry

    def __init__(self, hass: HomeAssistant, entry: FingridConfigEntry, client: Client, datasets: set[int]) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=f"{DOMAIN} real-time", update_interval=REALTIME_INTERVAL)
        self._client = client
        self.datasets = datasets

    async def _async_update_data(self) -> dict[int, Reading]:
        if not self.datasets:
            return {}
        now = dt_util.utcnow()
        try:
            return latest(await self._client.data(self.datasets, now - REALTIME_WINDOW, now))
        except FingridAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except FingridError as err:
            raise UpdateFailed(str(err)) from err


class ForecastCoordinator(DataUpdateCoordinator[dict[int, list[Reading]]]):
    """Each enabled forecast from the current quarter on."""

    config_entry: FingridConfigEntry

    def __init__(self, hass: HomeAssistant, entry: FingridConfigEntry, client: Client, datasets: set[int]) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=f"{DOMAIN} forecasts", update_interval=FORECAST_INTERVAL)
        self._client = client
        self.datasets = datasets

    async def _async_update_data(self) -> dict[int, list[Reading]]:
        if not self.datasets:
            return {}
        now = dt_util.utcnow()
        try:
            # From a quarter back, so the current quarter is always among the rows.
            return series(await self._client.data(self.datasets, now - FORECAST_INTERVAL, now + FORECAST_AHEAD))
        except FingridAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except FingridError as err:
            raise UpdateFailed(str(err)) from err
