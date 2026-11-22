import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/fingrid-card";
import type { HomeAssistant } from "../src/hass";

const WIND = "sensor.fingrid_wind_power_forecast";
const NUCLEAR = "sensor.fingrid_nuclear_power";

function home(windUpdated: string, nuclear: string, callWS: HomeAssistant["callWS"]): HomeAssistant {
    const state = (id: string, value: string, updated: string) => ({
        entity_id: id,
        state: value,
        last_changed: updated,
        last_updated: updated,
        attributes: {},
    });
    return {
        states: { [WIND]: state(WIND, "5120", windUpdated), [NUCLEAR]: state(NUCLEAR, nuclear, "2026-11-22T18:03:00Z") },
        entities: {
            [WIND]: { entity_id: WIND, platform: "fingrid", translation_key: "wind_forecast" },
            [NUCLEAR]: { entity_id: NUCLEAR, platform: "fingrid", translation_key: "nuclear" },
        },
        callWS,
    };
}

async function card(hass: HomeAssistant): Promise<HTMLElement & { hass: HomeAssistant; updateComplete: Promise<boolean> }> {
    const element = document.createElement("fingrid-card") as HTMLElement & {
        hass: HomeAssistant;
        setConfig(config: object): void;
        updateComplete: Promise<boolean>;
    };
    element.setConfig({ type: "custom:fingrid-card" });
    element.hass = hass;
    document.body.appendChild(element);
    await element.updateComplete;
    return element;
}

const settle = async (element: { updateComplete: Promise<boolean> }) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await element.updateComplete;
};

afterEach(() => {
    document.body.innerHTML = "";
});

describe("the forecast", () => {
    it("is asked for once, and again only when a forecast sensor moves on", async () => {
        const callWS = vi.fn().mockResolvedValue({ response: { [WIND]: { forecast: [] } } });
        const element = await card(home("2026-11-22T18:00:00Z", "4226", callWS));
        expect(callWS).toHaveBeenCalledTimes(1);
        expect(callWS.mock.calls[0][0]).toMatchObject({ domain: "fingrid", service: "get_forecast", target: { entity_id: [WIND] } });

        element.hass = home("2026-11-22T18:00:00Z", "4300", callWS);
        await settle(element);
        expect(callWS).toHaveBeenCalledTimes(1);

        element.hass = home("2026-11-22T18:15:00Z", "4300", callWS);
        await settle(element);
        expect(callWS).toHaveBeenCalledTimes(2);
    });

    it("that failed is asked for again when a forecast sensor moves on, not on every update", async () => {
        const callWS = vi.fn().mockRejectedValue(new Error("not loaded"));
        const element = await card(home("2026-11-22T18:00:00Z", "4226", callWS));
        await settle(element);
        expect(element.shadowRoot?.textContent).toContain("The forecast isn't available");

        element.hass = home("2026-11-22T18:00:00Z", "4300", callWS);
        await settle(element);
        expect(callWS).toHaveBeenCalledTimes(1);

        element.hass = home("2026-11-22T18:15:00Z", "4300", callWS);
        await settle(element);
        expect(callWS).toHaveBeenCalledTimes(2);
    });
});
