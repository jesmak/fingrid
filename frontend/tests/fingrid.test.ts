import { describe, expect, it } from "vitest";

import { arrowWidth, chartTop, fingridSensors, forecastPoints, mixShares, polyline, severity, value } from "../src/fingrid";
import type { HomeAssistant } from "../src/hass";

function hass(states: Record<string, string>, entities: Record<string, { platform: string; translation_key?: string }>): HomeAssistant {
    return {
        states: Object.fromEntries(
            Object.entries(states).map(([id, state]) => [id, { entity_id: id, state, last_changed: "", last_updated: "", attributes: {} }]),
        ),
        entities: Object.fromEntries(Object.entries(entities).map(([id, entry]) => [id, { entity_id: id, ...entry }])),
    };
}

describe("sensors", () => {
    it("are found by translation key, whatever their entity ids", () => {
        const home = hass(
            {},
            {
                "sensor.fingrid_tuulivoima": { platform: "fingrid", translation_key: "wind" },
                "sensor.my_wind": { platform: "other", translation_key: "wind" },
                "sensor.fingrid_no_key": { platform: "fingrid" },
            },
        );
        expect(fingridSensors(home)).toEqual({ wind: "sensor.fingrid_tuulivoima" });
    });

    it("read as numbers, and as nothing while unavailable or missing", () => {
        const home = hass({ "sensor.a": "6887.44", "sensor.b": "unavailable", "sensor.c": "unknown" }, {});
        const sensors = { wind: "sensor.a", hydro: "sensor.b", nuclear: "sensor.c", solar: "sensor.gone" };
        expect(value(home, sensors, "wind")).toBe(6887.44);
        expect(value(home, sensors, "hydro")).toBeUndefined();
        expect(value(home, sensors, "nuclear")).toBeUndefined();
        expect(value(home, sensors, "solar")).toBeUndefined();
        expect(value(home, sensors, "consumption")).toBeUndefined();
    });
});

describe("the mix", () => {
    it("shares the types that have a reading, a negative one counting as none", () => {
        const home = hass({ "sensor.n": "4000", "sensor.h": "1000", "sensor.w": "unavailable", "sensor.o": "-20" }, {});
        const shares = mixShares(home, { nuclear: "sensor.n", hydro: "sensor.h", wind: "sensor.w", reserve_and_small_scale: "sensor.o" });
        expect(shares.map((share) => [share.key, share.share])).toEqual([
            ["nuclear", 0.8],
            ["hydro", 0.2],
            ["reserve_and_small_scale", 0],
        ]);
    });

    it("has no shares when nothing produces", () => {
        const home = hass({ "sensor.n": "0" }, {});
        expect(mixShares(home, { nuclear: "sensor.n" })).toEqual([{ key: "nuclear", value: 0, share: 0 }]);
    });
});

describe("arrows", () => {
    it("thicken with the MW either way, up to 1500", () => {
        expect(arrowWidth(0)).toBe(2);
        expect(arrowWidth(-750)).toBe(5);
        expect(arrowWidth(1500)).toBe(8);
        expect(arrowWidth(3000)).toBe(8);
    });
});

describe("the forecast", () => {
    it("reads get_forecast's rows oldest first, leaving out what can't be read", () => {
        const points = forecastPoints({
            forecast: [
                { start: "2026-11-22T18:15:00+00:00", end: "2026-11-22T18:30:00+00:00", value: 7121.1 },
                { start: "2026-11-22T18:00:00+00:00", end: "2026-11-22T18:15:00+00:00", value: 7114.6 },
                { start: "not a time", value: 1 },
                { start: "2026-11-22T18:30:00+00:00", value: null },
            ],
        });
        expect(points).toEqual([
            { start: Date.parse("2026-11-22T18:00:00Z"), value: 7114.6 },
            { start: Date.parse("2026-11-22T18:15:00Z"), value: 7121.1 },
        ]);
        expect(forecastPoints(undefined)).toEqual([]);
        expect(forecastPoints({ forecast: "nope" })).toEqual([]);
    });

    it("tops its chart at a round 2000 MW, leaving the label's top 15 % clear of the curves", () => {
        expect(chartTop([[{ start: 0, value: 11000 }], [{ start: 0, value: 7121 }]])).toBe(14000);
        expect(chartTop([[{ start: 0, value: 12609 }]])).toBe(16000);
        expect(chartTop([[{ start: 0, value: 0 }]])).toBe(2000);
        expect(chartTop([])).toBe(2000);
    });

    it("draws a series across the chart, values from the bottom", () => {
        const points = [
            { start: 0, value: 0 },
            { start: 50, value: 1000 },
            { start: 100, value: 2000 },
        ];
        expect(polyline(points, 0, 100, 2000, 300, 120)).toBe("0,120 150,60 300,0");
    });
});

describe("the chips", () => {
    it("take their colour from how serious the state is", () => {
        expect(severity("normal")).toBe("ok");
        expect(severity("weakened")).toBe("warning");
        expect(severity("possible")).toBe("warning");
        expect(severity("high_risk")).toBe("error");
        expect(severity("blackout")).toBe("error");
        expect(severity("restoring")).toBe("info");
        expect(severity("unavailable")).toBe("none");
    });
});
