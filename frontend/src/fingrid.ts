/** What the card reads from the fingrid integration's sensors, without drawing anything. */
import type { HassEntity, HomeAssistant } from "./hass";

/** The integration's sensors by their translation key, which stays the same in every language. */
export type Sensors = Record<string, string>;

export function fingridSensors(hass: HomeAssistant): Sensors {
    const found: Sensors = {};
    for (const entry of Object.values(hass.entities ?? {})) {
        if (entry?.platform === "fingrid" && entry.translation_key) {
            found[entry.translation_key] = entry.entity_id;
        }
    }
    return found;
}

/** A sensor's state as a number, or undefined while it is unavailable or the sensor is disabled. */
export function value(hass: HomeAssistant, sensors: Sensors, key: string): number | undefined {
    const entity: HassEntity | undefined = sensors[key] ? hass.states[sensors[key]] : undefined;
    if (!entity || entity.state === "" || entity.state === "unavailable" || entity.state === "unknown") {
        return undefined;
    }
    const parsed = Number(entity.state);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export interface Border {
    key: string;
    /** The label's key under `borders.`. */
    name: string;
    /** Where an export arrow starts and ends, as [longitude, latitude]. An import runs the other way. */
    from: [number, number];
    to: [number, number];
    /** Which side of the arrow its label goes. */
    label: "left" | "right";
}

/** Fingrid's sign: positive is export from Finland, or from Åland to Sweden for Sweden–Åland. */
export const BORDERS: Border[] = [
    { key: "export_norway", name: "norway", from: [27.0, 70.0], to: [27.0, 70.9], label: "right" },
    { key: "export_northern_sweden", name: "northern_sweden", from: [24.0, 65.95], to: [22.5, 65.95], label: "left" },
    { key: "export_central_sweden", name: "central_sweden", from: [21.3, 61.6], to: [19.6, 61.6], label: "left" },
    { key: "export_estonia", name: "estonia", from: [24.9, 60.15], to: [24.9, 59.35], label: "right" },
];

export const ALAND: Border = { key: "export_aland_sweden", name: "aland_sweden", from: [19.9, 60.2], to: [18.5, 60.2], label: "left" };

/** Åland's main island, roughly, so the Sweden–Åland arrow starts somewhere. */
export const ALAND_ISLAND: [number, number][] = [
    [19.65, 60.08],
    [19.95, 59.98],
    [20.3, 60.06],
    [20.38, 60.22],
    [20.15, 60.4],
    [19.78, 60.38],
    [19.56, 60.24],
];

/** The production types in the order the mix bar stacks them. */
export const MIX = ["nuclear", "hydro", "wind", "district_heating_cogeneration", "industrial_cogeneration", "reserve_and_small_scale"];

export interface Share {
    key: string;
    value: number;
    /** Of the types shown, 0 to 1. */
    share: number;
}

/** The types that have a reading, each with its share of their sum. A negative reading counts as none. */
export function mixShares(hass: HomeAssistant, sensors: Sensors): Share[] {
    const readings = MIX.map((key) => ({ key, value: value(hass, sensors, key) })).filter(
        (reading): reading is { key: string; value: number } => reading.value !== undefined,
    );
    const total = readings.reduce((sum, reading) => sum + Math.max(0, reading.value), 0);
    return readings.map((reading) => ({ ...reading, share: total > 0 ? Math.max(0, reading.value) / total : 0 }));
}

/** An arrow's thickness in pixels by its MW: 2 for nothing, up to 8 at 1500 MW and more. */
export function arrowWidth(megawatts: number): number {
    return 2 + (Math.min(Math.abs(megawatts), 1500) / 1500) * 6;
}

export const FORECASTS = ["wind_forecast", "solar_forecast", "consumption_forecast"];

export interface Point {
    start: number;
    value: number;
}

/** The forecast rows `fingrid.get_forecast` returns, as times and values, oldest first. Rows that can't be read are left out. */
export function forecastPoints(response: unknown): Point[] {
    const rows = (response as { forecast?: unknown } | undefined)?.forecast;
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows
        .map((row: { start?: unknown; value?: unknown }) => ({
            start: Date.parse(String(row?.start)),
            // Number(null) would be 0, a value no row has.
            value: typeof row?.value === "number" ? row.value : Number.NaN,
        }))
        .filter((point) => Number.isFinite(point.start) && Number.isFinite(point.value))
        .sort((a, b) => a.start - b.start);
}

/** A rounded top for the forecast chart, at least 2000 MW, that keeps the curves out of the top 15 %, where its label is. */
export function chartTop(series: Point[][]): number {
    const highest = Math.max(0, ...series.flat().map((point) => point.value));
    return Math.max(2000, Math.ceil(highest / 0.85 / 2000) * 2000);
}

/** A series as SVG polyline points in a chart `width` × `height` from `start` to `end`. */
export function polyline(points: Point[], start: number, end: number, top: number, width: number, height: number): string {
    const span = Math.max(1, end - start);
    return points
        .filter((point) => point.start >= start && point.start <= end)
        .map((point) => `${round(((point.start - start) / span) * width)},${round(height - (Math.max(0, point.value) / top) * height)}`)
        .join(" ");
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The power system state and the shortage status by how serious they are, for the chips' colours. */
export function severity(state: string | undefined): "ok" | "warning" | "error" | "info" | "none" {
    switch (state) {
        case "normal":
            return "ok";
        case "weakened":
        case "possible":
            return "warning";
        case "endangered":
        case "blackout":
        case "high_risk":
        case "shortage":
            return "error";
        case "restoring":
            return "info";
        default:
            return "none";
    }
}
