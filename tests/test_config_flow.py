"""Adding the API key, a refused or unreachable one, and a new key when Fingrid refuses the old."""

from homeassistant.config_entries import SOURCE_USER
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant.test_util.aiohttp import AiohttpClientMocker

from custom_components.fingrid.const import DOMAIN

from .conftest import API_KEY, CHECK_URL, fingrid_entry

REFUSED = {"statusCode": 401, "message": "Access denied due to invalid subscription key."}


async def test_add(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: f"  {API_KEY} "})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Fingrid"
    assert result["data"] == {CONF_API_KEY: API_KEY}
    headers = [call[3] for call in fingrid.mock_calls if str(call[1]) == CHECK_URL]
    assert headers == [{"x-api-key": API_KEY}]
    await hass.async_block_till_done()


async def test_refused_key(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker) -> None:
    aioclient_mock.get(CHECK_URL, status=401, json=REFUSED)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: API_KEY})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_API_KEY: "invalid_api_key"}


async def test_unreachable(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker) -> None:
    aioclient_mock.get(CHECK_URL, status=503)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: API_KEY})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}


async def test_reauth(hass: HomeAssistant, fingrid: AiohttpClientMocker) -> None:
    entry = fingrid_entry(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    result = await entry.start_reauth_flow(hass)
    assert result["step_id"] == "reauth_confirm"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_API_KEY: "fedcba9876543210"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"
    await hass.async_block_till_done()
    assert entry.data == {CONF_API_KEY: "fedcba9876543210"}
