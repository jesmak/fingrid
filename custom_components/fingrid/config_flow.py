"""Config flow: the API key, checked against Fingrid, and a new one when Fingrid refuses it."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_API_KEY
from homeassistant.helpers.selector import TextSelector, TextSelectorConfig, TextSelectorType

from .api import Client, FingridAuthError, FingridError
from .const import DOMAIN

_SCHEMA = vol.Schema({vol.Required(CONF_API_KEY): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))})
PLACEHOLDERS = {"portal_url": "https://data.fingrid.fi/en/instructions"}


class FingridConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            errors = await self._check(api_key)
            if not errors:
                return self.async_create_entry(title="Fingrid", data={CONF_API_KEY: api_key})
        return self.async_show_form(step_id="user", data_schema=_SCHEMA, errors=errors, description_placeholders=PLACEHOLDERS)

    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            errors = await self._check(api_key)
            if not errors:
                return self.async_update_reload_and_abort(self._get_reauth_entry(), data={CONF_API_KEY: api_key})
        return self.async_show_form(step_id="reauth_confirm", data_schema=_SCHEMA, errors=errors, description_placeholders=PLACEHOLDERS)

    async def _check(self, api_key: str) -> dict[str, str]:
        try:
            await Client(self.hass, api_key).check()
        except FingridAuthError:
            return {CONF_API_KEY: "invalid_api_key"}
        except FingridError:
            return {"base": "cannot_connect"}
        return {}
