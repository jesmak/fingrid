import type { LovelaceCardConfig } from "./hass";
import type { RowStepConfig } from "./rows";

export interface FingridCardConfig extends LovelaceCardConfig, RowStepConfig {
    /** The power system state and the shortage status in the header. */
    show_status?: boolean;
    /** Production, consumption and net export. */
    show_totals?: boolean;
    show_map?: boolean;
    /** The cross-border flows as a list. */
    show_borders?: boolean;
    /** Sweden–Åland on the map and in the list. */
    show_aland?: boolean;
    show_mix?: boolean;
    show_forecast?: boolean;
    /** The emission factor, the non-fossil share and the batteries. */
    show_details?: boolean;
}

/** Every part but the border list, which repeats the map, is on unless switched off. */
export const DEFAULTS = {
    show_status: true,
    show_totals: true,
    show_map: true,
    show_borders: false,
    show_aland: true,
    show_mix: true,
    show_forecast: true,
    show_details: true,
} as const;

export type Part = keyof typeof DEFAULTS;

export function shows(config: FingridCardConfig | undefined, part: Part): boolean {
    const value = config?.[part];
    return typeof value === "boolean" ? value : DEFAULTS[part];
}
