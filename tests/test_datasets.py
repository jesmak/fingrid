"""Reading Fingrid's rows."""

from datetime import UTC, datetime

import pytest

from custom_components.fingrid.api import FingridError
from custom_components.fingrid.datasets import SENSORS, current, latest, series


def row(dataset: int, start: str, end: str, value: float) -> dict:
    return {"datasetId": dataset, "startTime": start, "endTime": end, "value": value}


def test_latest_takes_each_datasets_newest() -> None:
    rows = [
        row(181, "2026-11-22T17:54:00.000Z", "2026-11-22T17:57:00.000Z", 6887.44),
        row(181, "2026-11-22T17:48:00.000Z", "2026-11-22T17:51:00.000Z", 6900.1),
        row(209, "2026-11-22T17:51:00.000Z", "2026-11-22T17:54:00.000Z", 1),
    ]
    found = latest(rows)
    assert found[181].value == 6887.44
    assert found[181].start == datetime(2026, 11, 22, 17, 54, tzinfo=UTC)
    assert found[209].value == 1.0


def test_series_and_current_quarter() -> None:
    rows = [
        row(245, "2026-11-22T18:15:00.000Z", "2026-11-22T18:30:00.000Z", 7100.0),
        row(245, "2026-11-22T18:00:00.000Z", "2026-11-22T18:15:00.000Z", 7050.0),
    ]
    readings = series(rows)[245]
    assert [reading.value for reading in readings] == [7050.0, 7100.0]
    assert current(readings, datetime(2026, 11, 22, 18, 14, 59, tzinfo=UTC)).value == 7050.0  # type: ignore[union-attr]
    # A quarter starts where the previous one ends.
    assert current(readings, datetime(2026, 11, 22, 18, 15, tzinfo=UTC)).value == 7100.0  # type: ignore[union-attr]
    assert current(readings, datetime(2026, 11, 22, 18, 30, tzinfo=UTC)) is None


@pytest.mark.parametrize(
    "bad",
    [
        {"datasetId": 181, "startTime": "2026-11-22T17:54:00.000Z", "endTime": "2026-11-22T17:57:00.000Z"},
        row(181, "yesterday", "2026-11-22T17:57:00.000Z", 1.0),
        {**row(181, "2026-11-22T17:54:00.000Z", "2026-11-22T17:57:00.000Z", 1.0), "value": "1.0"},
        {**row(181, "2026-11-22T17:54:00.000Z", "2026-11-22T17:57:00.000Z", 1.0), "value": None},
        "181",
    ],
)
def test_a_row_that_cant_be_read(bad: object) -> None:
    with pytest.raises(FingridError):
        latest([bad])


def test_keys_and_datasets_are_unique() -> None:
    assert len({d.key for d in SENSORS}) == len(SENSORS)
    assert len({d.dataset for d in SENSORS}) == len(SENSORS)
