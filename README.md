# Fingrid for Home Assistant

Home Assistant integration for Finland's electricity production, consumption, cross-border transmission and grid state,
from Fingrid's open data.

[![GitHub Release][releases-shield]][releases] [![GitHub Release Date][release-date-shield]][releases] [![Downloads][downloads-shield]][releases] [![Marketplace][marketplace-shield]][marketplace] [![License][license-shield]](LICENSE)

## What is it?

A custom component that reads Fingrid's open data, the measurements and forecasts that Finland's transmission system
operator publishes about the national grid. It shows how much electricity Finland produces and uses right now, how the
production splits between nuclear, hydro, wind and cogeneration, how much flows to and from Sweden, Norway and Estonia,
how clean the electricity is, and whether the power system is in its normal state or an electricity shortage is coming.
The wind, solar and consumption forecasts reach three days ahead.

The real-time measurements are read every three minutes and the forecasts every 15. Only the datasets of the sensors
you have enabled are asked for, so the sensors you don't need cost nothing.

It needs a free API key from Fingrid, which is personal to each user.

## Installation

### With the Marketplace

1. Open Settings › Marketplace, choose Add from link and paste `https://github.com/jesmak/fingrid`
2. Open Fingrid in the Marketplace and choose Install
3. Restart Home Assistant
4. Add the integration in Settings › Devices & services, and enter your API key

### Manual

1. Download the source code from the latest release
2. Copy the `custom_components/fingrid` folder to your Home Assistant installation's `config/custom_components` folder
3. Restart Home Assistant
4. Add the integration in Settings › Devices & services, and enter your API key

### Getting an API key

1. Register in [Fingrid's open data service](https://data.fingrid.fi/en/) with your email address
2. Open the developer portal from the control panel and sign in
3. Under Products, choose Open Data starter, give the subscription a name and choose Subscribe
4. Your key is on your profile page

[Fingrid's instructions](https://data.fingrid.fi/en/instructions) describe the same steps.

## Settings

| Name    | Type   | Description                                  | Default  |
| ------- | ------ | -------------------------------------------- | -------- |
| API key | string | The API key of the product Open Data starter | required |

The integration is added once. When Fingrid stops accepting the key, Home Assistant asks for a new one.

## Sensors

All the sensors are on one device, Fingrid. Power is in megawatts, and every numeric sensor keeps long-term statistics.
Their entity IDs follow Home Assistant's language. The examples here are those of an English one, such as
`sensor.fingrid_wind_power`. The interval in the tables is how often Fingrid publishes the dataset.

A transmission is positive when electricity flows out of Finland and negative when it flows in, as Fingrid gives it.
Export from Åland to Sweden is positive when electricity flows from Åland to Sweden. Åland belongs to the Swedish
bidding zone SE3, so this flow isn't across a border of mainland Finland, whose own link to Åland Fingrid publishes
only the next morning.

### Enabled by default

| Sensor                                    | Unit     | Interval | Fingrid dataset |
| ----------------------------------------- | -------- | -------- | --------------- |
| Production                                | MW       | 3 min    | 192             |
| Consumption                               | MW       | 3 min    | 193             |
| Net export                                | MW       | 3 min    | 194             |
| Nuclear power                             | MW       | 3 min    | 188             |
| Hydropower                                | MW       | 3 min    | 191             |
| Wind power                                | MW       | 3 min    | 181             |
| Cogeneration, district heating            | MW       | 3 min    | 201             |
| Cogeneration, industry                    | MW       | 3 min    | 202             |
| Reserve plants and small-scale production | MW       | 3 min    | 205             |
| Export to Northern Sweden                 | MW       | 3 min    | 87              |
| Export to Central Sweden                  | MW       | 3 min    | 89              |
| Export to Estonia                         | MW       | 3 min    | 180             |
| Export to Norway                          | MW       | 3 min    | 187             |
| Export from Åland to Sweden               | MW       | 3 min    | 90              |
| Battery storage charging                  | MW       | 3 min    | 399             |
| Battery storage discharging               | MW       | 3 min    | 398             |
| Emission factor of consumption            | gCO₂/kWh | 3 min    | 265             |
| Emission factor of production             | gCO₂/kWh | 3 min    | 266             |
| Non-fossil share of production            | %        | 15 min   | 395             |
| Power system state                        |          | 3 min    | 209             |
| Electricity shortage                      |          | 3 min    | 336             |
| Wind power forecast                       | MW       | 15 min   | 245             |
| Solar power forecast                      | MW       | 15 min   | 248             |
| Consumption forecast                      | MW       | 15 min   | 166             |

**Power system state** is Fingrid's traffic light for the grid. It is _normal_ (green), _weakened_ (yellow, the
adequacy of electricity is threatened or the system doesn't meet its security criteria), _endangered_ (red,
consumption has been disconnected or the risk of a wide blackout is considerable), _serious disturbance_ (black, a
disturbance over a large part of Finland or all of it) or _restoring_ (blue, recovering from one).

**Electricity shortage** is Fingrid's three-step warning of a shortage. It is _normal_, _possible_, _high risk_ or
_shortage_, when consumption has to be restricted.

A **forecast** sensor shows the forecast for the current quarter of an hour, and the whole forecast is available
through the [get_forecast](#actions) action.

### Disabled by default

Enable these in the device's page when you need them.

| Sensor                                    | Unit | Interval | Fingrid dataset |
| ----------------------------------------- | ---- | -------- | --------------- |
| Peak load power                           | MW   | 3 min    | 183             |
| Production surplus                        | MW   | 3 min    | 198             |
| Production surplus, cumulative            | MW   | 3 min    | 186             |
| Electric boilers                          | MW   | 1 min    | 371             |
| Transmission from north to south          | MW   | 1 min    | 30              |
| Frequency                                 | Hz   | 1 min    | 177             |
| Time deviation                            | s    | 3 min    | 206             |
| Kinetic energy of the Nordic power system | GJ   | 15 min   | 260             |
| Temperature in Helsinki                   | °C   | 3 min    | 178             |
| Temperature in Jyväskylä                  | °C   | 3 min    | 182             |
| Temperature in Oulu                       | °C   | 3 min    | 196             |
| Temperature in Rovaniemi                  | °C   | 3 min    | 185             |

Fingrid gives the kinetic energy in GWs, which is the same as GJ.

A sensor becomes unavailable when its dataset has had no reading for an hour.

## Actions

### fingrid.get_forecast

Returns a forecast sensor's quarters of an hour from the current one on, up to 72 hours ahead. The forecast is the
one the integration already holds, so the action asks nothing of Fingrid.

| Field  | Description                         |
| ------ | ----------------------------------- |
| Target | One or more of the forecast sensors |

```yaml
action: fingrid.get_forecast
target:
    entity_id: sensor.fingrid_wind_power_forecast
response_variable: wind
```

```yaml
sensor.fingrid_wind_power_forecast:
    forecast:
        - start: "2026-01-15T18:00:00+00:00"
          end: "2026-01-15T18:15:00+00:00"
          value: 5120.4
        - start: "2026-01-15T18:15:00+00:00"
          end: "2026-01-15T18:30:00+00:00"
          value: 5134.9
```

## Examples

A notification when Fingrid warns of an electricity shortage:

```yaml
triggers:
    - trigger: state
      entity_id: sensor.fingrid_electricity_shortage
      to:
          - possible
          - high_risk
          - shortage
      not_from:
          - unknown
          - unavailable
actions:
    - action: notify.notify
      data:
          title: Electricity shortage
          message: "Fingrid's electricity shortage status is now {{ trigger.to_state.state }}."
```

The highest wind power forecast for the next 24 hours, in a template:

```yaml
actions:
    - action: fingrid.get_forecast
      target:
          entity_id: sensor.fingrid_wind_power_forecast
      response_variable: wind
    - variables:
          peak: >-
              {{ wind['sensor.fingrid_wind_power_forecast'].forecast
                 | selectattr('start', 'lt', (utcnow() + timedelta(hours=24)).isoformat())
                 | map(attribute='value') | max }}
```

## Data

The data comes from [Fingrid's open data](https://data.fingrid.fi/en/), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each sensor carries Fingrid's attribution, "Source Fingrid /
data.fingrid.fi, license CC BY 4.0".

Fingrid allows 10 000 requests a day and one every two seconds for each API key. The integration makes about 580 a
day, and keeps its requests at least two seconds apart.

This integration is unofficial and not affiliated with or endorsed by Fingrid. Each user signs up for an API key of
their own.

## Development

Requires Python 3.14.

```
python3.14 -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/pytest
.venv/bin/ruff check .
```

| Path                           | What it contains                                                       |
| ------------------------------ | ---------------------------------------------------------------------- |
| `__init__.py`                  | Setup, the datasets of the enabled sensors and the get_forecast action |
| `config_flow.py`               | Adding the API key, and a new one when Fingrid refuses the old         |
| `const.py`                     | The API's address and the update intervals                             |
| `api.py`                       | Fingrid's API, with the requests spaced to its limit                   |
| `datasets.py`                  | The sensors' datasets, and reading Fingrid's rows                      |
| `coordinator.py`               | The real-time and forecast updates                                     |
| `sensor.py`                    | The measurement and forecast sensors                                   |
| `translations/<language>.json` | Home Assistant UI texts                                                |

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/jesmak)

## License

MIT, see [LICENSE](LICENSE). Fingrid's data is licensed under CC BY 4.0, see [Data](#data).

[releases-shield]: https://img.shields.io/github/release/jesmak/fingrid.svg?style=for-the-badge
[release-date-shield]: https://img.shields.io/github/release-date/jesmak/fingrid?style=for-the-badge
[releases]: https://github.com/jesmak/fingrid/releases
[downloads-shield]: https://img.shields.io/github/downloads/jesmak/fingrid/total.svg?style=for-the-badge
[marketplace-shield]: https://img.shields.io/badge/Marketplace-Custom-orange.svg?style=for-the-badge
[marketplace]: https://my.home-assistant.io/redirect/marketplace_repository/?owner=jesmak&repository=fingrid&category=integration
[license-shield]: https://img.shields.io/github/license/jesmak/fingrid.svg?style=for-the-badge
