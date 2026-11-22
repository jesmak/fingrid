"""Constants for the Fingrid integration."""

from datetime import timedelta
from typing import Final

DOMAIN: Final = "fingrid"

ATTRIBUTION: Final = "Source Fingrid / data.fingrid.fi, license CC BY 4.0"

API_URL: Final = "https://data.fingrid.fi/api"

# The real-time measurements come every one to three minutes and the 15-minute ones up to half an hour late, so an
# hour back holds the newest row of each.
REALTIME_INTERVAL: Final = timedelta(minutes=3)
REALTIME_WINDOW: Final = timedelta(hours=1)
# The forecasts are made every 15 minutes and reach 72 hours ahead.
FORECAST_INTERVAL: Final = timedelta(minutes=15)
FORECAST_AHEAD: Final = timedelta(hours=73)

SERVICE_GET_FORECAST: Final = "get_forecast"
