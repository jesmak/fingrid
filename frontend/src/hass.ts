/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    last_changed: string;
    last_updated: string;
    attributes: Record<string, unknown>;
}

/** An entity's entry in the frontend's registry, which leaves out a disabled one. */
export interface EntityRegistryEntry {
    entity_id: string;
    device_id?: string | null;
    platform: string;
    translation_key?: string | null;
}

export interface DeviceRegistryEntry {
    id: string;
    name?: string | null;
    name_by_user?: string | null;
    via_device_id?: string | null;
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    entities?: Record<string, EntityRegistryEntry | undefined>;
    devices?: Record<string, DeviceRegistryEntry | undefined>;
    callWS?<T>(message: Record<string, unknown>): Promise<T>;
    /** An entity's state as the frontend shows it, translated and with its unit. */
    formatEntityState?(entity: HassEntity): string;
    language?: string;
    /** `time_zone` is the user's choice between the browser's zone and the server's, `time_format` their clock's. */
    locale?: { language?: string; time_zone?: "local" | "server"; time_format?: "language" | "system" | "12" | "24" };
    config?: { time_zone?: string };
    themes?: { darkMode?: boolean };
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}
