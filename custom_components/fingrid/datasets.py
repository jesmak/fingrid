"""The datasets the integration carries, and reading Fingrid's rows."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntityDescription, SensorStateClass
from homeassistant.const import PERCENTAGE, UnitOfEnergy, UnitOfFrequency, UnitOfPower, UnitOfTemperature, UnitOfTime
from homeassistant.util import dt as dt_util

from .api import FingridError

EMISSION_UNIT = "gCO₂/kWh"


@dataclass(frozen=True, kw_only=True)
class FingridSensorDescription(SensorEntityDescription):
    dataset: int
    forecast: bool = False
    # An enum dataset's codes and the states they stand for.
    codes: dict[int, str] | None = None


def _power(key: str, dataset: int, *, enabled: bool = True, forecast: bool = False) -> FingridSensorDescription:
    return FingridSensorDescription(
        key=key,
        translation_key=key,
        dataset=dataset,
        forecast=forecast,
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.MEGA_WATT,
        suggested_display_precision=0,
        entity_registry_enabled_default=enabled,
    )


def _temperature(key: str, dataset: int) -> FingridSensorDescription:
    return FingridSensorDescription(
        key=key,
        translation_key=key,
        dataset=dataset,
        device_class=SensorDeviceClass.TEMPERATURE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=1,
        entity_registry_enabled_default=False,
    )


def _emission(key: str, dataset: int) -> FingridSensorDescription:
    return FingridSensorDescription(
        key=key,
        translation_key=key,
        dataset=dataset,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=EMISSION_UNIT,
        suggested_display_precision=0,
    )


# Fingrid's traffic lights for the power system: green, yellow, red, black and blue.
POWER_SYSTEM_STATES = {1: "normal", 2: "weakened", 3: "endangered", 4: "blackout", 5: "restoring"}
SHORTAGE_STATES = {0: "normal", 1: "possible", 2: "high_risk", 3: "shortage"}

# A transmission's sign follows Fingrid's: positive is export from Finland, or from Åland for Sweden–Åland.
SENSORS: tuple[FingridSensorDescription, ...] = (
    _power("production", 192),
    _power("consumption", 193),
    _power("net_export", 194),
    _power("nuclear", 188),
    _power("hydro", 191),
    _power("wind", 181),
    _power("district_heating_cogeneration", 201),
    _power("industrial_cogeneration", 202),
    _power("reserve_and_small_scale", 205),
    _power("export_northern_sweden", 87),
    _power("export_central_sweden", 89),
    _power("export_estonia", 180),
    _power("export_norway", 187),
    _power("battery_charging", 399),
    _power("battery_discharging", 398),
    _emission("emission_factor_consumption", 265),
    _emission("emission_factor_production", 266),
    FingridSensorDescription(
        key="non_fossil_share",
        translation_key="non_fossil_share",
        dataset=395,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=0,
    ),
    FingridSensorDescription(
        key="power_system_state",
        translation_key="power_system_state",
        dataset=209,
        device_class=SensorDeviceClass.ENUM,
        options=list(POWER_SYSTEM_STATES.values()),
        codes=POWER_SYSTEM_STATES,
    ),
    FingridSensorDescription(
        key="shortage_status",
        translation_key="shortage_status",
        dataset=336,
        device_class=SensorDeviceClass.ENUM,
        options=list(SHORTAGE_STATES.values()),
        codes=SHORTAGE_STATES,
    ),
    _power("wind_forecast", 245, forecast=True),
    _power("solar_forecast", 248, forecast=True),
    _power("consumption_forecast", 166, forecast=True),
    _power("export_aland_sweden", 90, enabled=False),
    _power("peak_load_power", 183, enabled=False),
    _power("surplus", 198, enabled=False),
    _power("surplus_cumulative", 186, enabled=False),
    _power("electric_boilers", 371, enabled=False),
    _power("north_south_transmission", 30, enabled=False),
    FingridSensorDescription(
        key="frequency",
        translation_key="frequency",
        dataset=177,
        device_class=SensorDeviceClass.FREQUENCY,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfFrequency.HERTZ,
        suggested_display_precision=3,
        entity_registry_enabled_default=False,
    ),
    FingridSensorDescription(
        key="time_deviation",
        translation_key="time_deviation",
        dataset=206,
        device_class=SensorDeviceClass.DURATION,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        suggested_display_precision=1,
        entity_registry_enabled_default=False,
    ),
    # Fingrid gives it in GWs, which is GJ.
    FingridSensorDescription(
        key="kinetic_energy",
        translation_key="kinetic_energy",
        dataset=260,
        device_class=SensorDeviceClass.ENERGY_STORAGE,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfEnergy.GIGA_JOULE,
        suggested_display_precision=0,
        entity_registry_enabled_default=False,
    ),
    _temperature("temperature_helsinki", 178),
    _temperature("temperature_jyvaskyla", 182),
    _temperature("temperature_oulu", 196),
    _temperature("temperature_rovaniemi", 185),
)


@dataclass(frozen=True)
class Reading:
    start: datetime
    end: datetime
    value: float


def _reading(row: Any) -> tuple[int, Reading]:
    try:
        start = dt_util.parse_datetime(row["startTime"])
        end = dt_util.parse_datetime(row["endTime"])
        value = row["value"]
        dataset = int(row["datasetId"])
    except (KeyError, TypeError, ValueError) as err:
        raise FingridError(f"Fingrid sent a row that can't be read: {row!r}") from err
    if start is None or end is None or not isinstance(value, int | float) or isinstance(value, bool):
        raise FingridError(f"Fingrid sent a row that can't be read: {row!r}")
    return dataset, Reading(start, end, float(value))


def latest(rows: list[Any]) -> dict[int, Reading]:
    """Each dataset's newest reading."""
    newest: dict[int, Reading] = {}
    for row in rows:
        dataset, reading = _reading(row)
        if dataset not in newest or reading.start > newest[dataset].start:
            newest[dataset] = reading
    return newest


def series(rows: list[Any]) -> dict[int, list[Reading]]:
    """Each dataset's readings, oldest first."""
    found: dict[int, list[Reading]] = defaultdict(list)
    for row in rows:
        dataset, reading = _reading(row)
        found[dataset].append(reading)
    return {dataset: sorted(readings, key=lambda reading: reading.start) for dataset, readings in found.items()}


def current(readings: list[Reading], now: datetime) -> Reading | None:
    """The reading whose period holds now."""
    return next((reading for reading in readings if reading.start <= now < reading.end), None)
