"""A sensor per dataset: the newest reading of a measurement, the current quarter of a forecast."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, ServiceResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_utc_time_change
from homeassistant.helpers.update_coordinator import CoordinatorEntity, DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import ATTRIBUTION, DOMAIN
from .coordinator import FingridConfigEntry, ForecastCoordinator, RealtimeCoordinator
from .datasets import SENSORS, FingridSensorDescription, current

_LOGGER = logging.getLogger(__name__)

PARALLEL_UPDATES = 0


async def async_setup_entry(hass: HomeAssistant, entry: FingridConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    data = entry.runtime_data
    device = DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name="Fingrid",
        manufacturer="Fingrid",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url="https://data.fingrid.fi/en/",
    )
    async_add_entities(
        ForecastSensor(data.forecasts, device, description)
        if description.forecast
        else MeasurementSensor(data.realtime, device, description)
        for description in SENSORS
    )


class _Sensor[T: DataUpdateCoordinator[Any]](CoordinatorEntity[T], SensorEntity):
    _attr_has_entity_name = True
    _attr_attribution = ATTRIBUTION

    entity_description: FingridSensorDescription

    def __init__(self, coordinator: T, device: DeviceInfo, description: FingridSensorDescription) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_device_info = device
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{description.key}"

    async def async_get_forecast(self) -> ServiceResponse:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="not_a_forecast", translation_placeholders={"entity_id": self.entity_id}
        )


class MeasurementSensor(_Sensor[RealtimeCoordinator]):
    _unknown_codes: set[int]

    def __init__(self, coordinator: RealtimeCoordinator, device: DeviceInfo, description: FingridSensorDescription) -> None:
        super().__init__(coordinator, device, description)
        self._unknown_codes = set()

    @property
    def available(self) -> bool:
        return super().available and self.entity_description.dataset in self.coordinator.data

    @property
    def native_value(self) -> float | str | None:
        value = self.coordinator.data[self.entity_description.dataset].value
        codes = self.entity_description.codes
        if codes is None:
            return value
        code = round(value)
        if code not in codes:
            if code not in self._unknown_codes:
                self._unknown_codes.add(code)
                _LOGGER.warning("Fingrid sent the code %s for %s, which isn't one of %s", code, self.entity_id, sorted(codes))
            return None
        return codes[code]


class ForecastSensor(_Sensor[ForecastCoordinator]):
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        # The forecast's current quarter changes between updates.
        self.async_on_remove(async_track_utc_time_change(self.hass, self._quarter_changed, minute=(0, 15, 30, 45), second=0))

    @callback
    def _quarter_changed(self, now: datetime) -> None:
        self.async_write_ha_state()

    @property
    def available(self) -> bool:
        return super().available and self.native_value is not None

    @property
    def native_value(self) -> float | None:
        reading = current(self.coordinator.data.get(self.entity_description.dataset, []), dt_util.utcnow())
        return reading.value if reading else None

    async def async_get_forecast(self) -> ServiceResponse:
        now = dt_util.utcnow()
        readings = self.coordinator.data.get(self.entity_description.dataset, []) if self.coordinator.last_update_success else []
        return {
            "forecast": [
                {"start": reading.start.isoformat(), "end": reading.end.isoformat(), "value": reading.value}
                for reading in readings
                if reading.end > now
            ]
        }
