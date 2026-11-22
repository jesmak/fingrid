/**
 * A dashboard card for Finland's power system, from the fingrid integration's sensors.
 *
 * Its parts, each switched on or off in the editor: the grid state and the shortage status in the header, production,
 * consumption and net export, a map of the cross-border flows, the same flows as a list, the production mix, the wind,
 * solar and consumption forecasts for three days, and the emission factor, the non-fossil share and the batteries.
 */
import { LitElement, css, html, nothing, svg } from "lit";
import type { CSSResultGroup, PropertyValues, SVGTemplateResult, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import "./editor";
import { FINLAND } from "./finland";
import {
    ALAND,
    ALAND_ISLAND,
    BORDERS,
    FORECASTS,
    arrowWidth,
    chartTop,
    fingridSensors,
    forecastPoints,
    mixShares,
    polyline,
    severity,
    value,
} from "./fingrid";
import type { Border, Point, Sensors } from "./fingrid";
import type { HomeAssistant } from "./hass";
import { gridMinRows, heightCardSize, validHeight } from "./height";
import { browserLanguage, translate } from "./localize/localize";
import { drawnScale, fillLimit, filledHeight, filledStyle, validRowStep } from "./rows";
import { shows } from "./types";
import type { FingridCardConfig } from "./types";

declare const __CARD_VERSION__: string;
const CARD_VERSION = __CARD_VERSION__;

const PADDING = 16;
const GAP = 12;
// Each part's height at its tallest, at a card of 320 px (288 px of content) with the longest texts. The map and the
// chart have fixed heights, so the card's height depends on its settings, never on the data.
const HEADER_HEIGHT = 32;
// The chips wrap onto a second line with the longest states, such as "Serious disturbance" and "High risk".
const HEADER_WITH_STATUS_HEIGHT = 56;
const TOTALS_HEIGHT = 44;
const MAP_HEIGHT = 260;
const BORDER_ROW_HEIGHT = 30;
const MIX_HEIGHT = 78;
const CHART_HEIGHT = 120;
const FORECAST_HEIGHT = CHART_HEIGHT + 18 + 24;
const DETAILS_HEIGHT = 34;

const MIX_COLOURS: Record<string, string> = {
    nuclear: "var(--fingrid-nuclear-color, #a58bff)",
    hydro: "var(--fingrid-hydro-color, #4fa8f0)",
    wind: "var(--fingrid-wind-color, #45c779)",
    district_heating_cogeneration: "var(--fingrid-district-heating-color, #f0b440)",
    industrial_cogeneration: "var(--fingrid-industry-color, #f08a40)",
    reserve_and_small_scale: "var(--fingrid-other-color, #8fa0bd)",
};
const FORECAST_COLOURS: Record<string, string> = {
    wind_forecast: MIX_COLOURS.wind,
    solar_forecast: "var(--fingrid-solar-color, #ffd54f)",
    consumption_forecast: "var(--primary-text-color)",
};

// The map's projection: longitude shrunk by the cosine of Finland's middle latitude, 20 units a degree of latitude.
const LON_SCALE = 9;
const LAT_SCALE = 20;
const WEST = 12.5;
const EAST = 33;
const NORTH = 71.4;
const SOUTH = 59;
const project = ([lon, lat]: [number, number]): [number, number] => [(lon - WEST) * LON_SCALE, (NORTH - lat) * LAT_SCALE];

export class FingridCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @property({ attribute: false }) public layout?: string;
    @state() private config?: FingridCardConfig;
    @state() private forecasts?: Record<string, Point[]>;
    @state() private forecastFailed = false;
    @state() private filled = 0;

    /** The sensors and what they were looked up from, as the lookup walks the whole entity registry. */
    private found?: { from: unknown; sensors: Sensors };
    /** The forecast sensors' last updates when the forecast was last asked for, so it is asked again only when one moves on. */
    private forecastKey = "";
    private frame?: number;
    private readonly resizes = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => this.measureSoon());

    public static getConfigElement(): HTMLElement {
        return document.createElement("fingrid-card-editor");
    }

    public static getStubConfig(): Record<string, unknown> {
        return {};
    }

    public setConfig(config: FingridCardConfig): void {
        if (!config) {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        if (!validHeight(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_height"));
        }
        if (!validRowStep(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_row_step"));
        }
        this.config = config;
    }

    /** In units of 50 px, for a masonry view. */
    public getCardSize(): number {
        return heightCardSize(this.config ?? {}, Math.ceil(this.minimumHeight() / 50), this.minimumHeight());
    }

    /** The map, the chart and the three totals need about a phone's section, so the card takes a whole section. */
    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, min_columns: 12, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.resizes?.disconnect();
        cancelAnimationFrame(this.frame ?? 0);
    }

    protected willUpdate(changed: PropertyValues): void {
        if (changed.has("hass") || changed.has("config")) {
            this.readForecasts();
        }
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const sensors = this.sensors();
        if (Object.keys(sensors).length === 0) {
            return html`<ha-card style=${this.cardStyle()}
                ><div class="content"><div class="message">${this.text("common.not_found")}</div></div></ha-card
            >`;
        }
        const config = this.config;
        return html`
            <ha-card style=${this.cardStyle()}>
                <div class="content">
                    <div class="part header">
                        <span class="title">${this.text("common.name")}</span>
                        ${shows(config, "show_status") ? this.status(sensors) : nothing}
                    </div>
                    ${shows(config, "show_totals") ? html`<div class="part">${this.totals(sensors)}</div>` : nothing}
                    ${shows(config, "show_map") ? html`<div class="part">${this.map(sensors)}</div>` : nothing}
                    ${shows(config, "show_borders") ? html`<div class="part">${this.borders(sensors)}</div>` : nothing}
                    ${shows(config, "show_mix") ? html`<div class="part">${this.mix(sensors)}</div>` : nothing}
                    ${shows(config, "show_forecast") ? html`<div class="part">${this.forecast(sensors)}</div>` : nothing}
                    ${shows(config, "show_details") ? html`<div class="part">${this.details(sensors)}</div>` : nothing}
                </div>
            </ha-card>
        `;
    }

    protected updated(): void {
        const card = this.renderRoot.querySelector("ha-card");
        if (card && this.isConnected) {
            this.resizes?.observe(card);
            this.measureSoon();
        }
    }

    private sensors(): Sensors {
        const from = this.hass?.entities;
        if (!this.found || this.found.from !== from) {
            this.found = { from, sensors: this.hass ? fingridSensors(this.hass) : {} };
        }
        return this.found.sensors;
    }

    private status(sensors: Sensors): TemplateResult {
        const chip = (key: string, icon: string) => {
            const entity = sensors[key] ? this.hass!.states[sensors[key]] : undefined;
            if (!entity) {
                return nothing;
            }
            const shown = this.hass!.formatEntityState?.(entity) ?? entity.state;
            const name = this.text(`status.${key}`);
            return html`<span class="chip ${severity(entity.state)}" title=${`${name} ${shown}`}
                ><ha-icon .icon=${icon}></ha-icon>${shown}</span
            >`;
        };
        return html`<span class="chips"
            >${chip("power_system_state", "mdi:traffic-light")}${chip("shortage_status", "mdi:flash-alert")}</span
        >`;
    }

    private totals(sensors: Sensors): TemplateResult {
        const total = (key: string, signed = false) => {
            const reading = value(this.hass!, sensors, key);
            return html`<div class="total">
                <div class="number">
                    ${reading === undefined ? "–" : html`${signed && reading > 0 ? "+" : ""}${this.number(reading)}<span class="unit"> MW</span>`}
                </div>
                <div class="label">${this.text(`totals.${key}`)}</div>
            </div>`;
        };
        return html`<div class="totals">${total("production")}${total("consumption")}${total("net_export", true)}</div>`;
    }

    private shownBorders(sensors: Sensors): Border[] {
        return [...BORDERS, ...(shows(this.config, "show_aland") ? [ALAND] : [])].filter((border) => sensors[border.key]);
    }

    private map(sensors: Sensors): TemplateResult {
        const [width, height] = project([EAST, SOUTH]);
        const outline = FINLAND.map((point) => project(point).join(",")).join(" ");
        const borders = this.shownBorders(sensors);
        const aland = borders.includes(ALAND);
        return html`<svg class="map" viewBox="0 0 ${width} ${height}" role="img" aria-label=${this.text("map.label")}>
            <defs>
                <marker id="export" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                    <path d="M0,0L10,5L0,10z" class="export-fill" />
                </marker>
                <marker id="import" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                    <path d="M0,0L10,5L0,10z" class="import-fill" />
                </marker>
            </defs>
            <polygon class="land" points=${outline} />
            ${aland ? svg`<polygon class="land" points=${ALAND_ISLAND.map((point) => project(point).join(",")).join(" ")} />` : nothing}
            ${borders.map((border) => this.arrow(border, value(this.hass!, sensors, border.key)))}
        </svg>`;
    }

    private arrow(border: Border, reading: number | undefined): SVGTemplateResult {
        const [x1, y1] = project(border.from);
        const [x2, y2] = project(border.to);
        const known = reading !== undefined;
        const exporting = (reading ?? 0) >= 0;
        const [sx, sy, ex, ey] = exporting ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
        const kind = known ? (exporting ? "export" : "import") : "unknown";
        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);
        const middleY = (y1 + y2) / 2;
        // The head reaches 1.5 line widths to each side of the line.
        const clear = 3 + 1.5 * arrowWidth(reading ?? 0);
        const [lx, anchor] = border.label === "left" ? [left - clear, "end"] : [right + clear, "start"];
        const ly = border.label === "left" ? middleY - 2 : middleY;
        return svg`
            <line class="arrow ${kind}" x1=${sx} y1=${sy} x2=${ex} y2=${ey} stroke-width=${arrowWidth(reading ?? 0)}
                marker-end=${known ? `url(#${kind})` : ""} />
            <text class="flow ${kind}" x=${lx} y=${ly} text-anchor=${anchor}>${known ? this.number(Math.abs(reading)) : "–"}</text>
            <text class="place" x=${lx} y=${ly + 10} text-anchor=${anchor}>${this.text(`borders.${border.name}`)}</text>
        `;
    }

    private borders(sensors: Sensors): TemplateResult {
        return html`<div class="rows">
            ${this.shownBorders(sensors).map((border) => {
                const reading = value(this.hass!, sensors, border.key);
                const kind = reading === undefined ? "unknown" : reading >= 0 ? "export" : "import";
                return html`<div class="row">
                    <span>${this.text(`borders.${border.name}`)}</span>
                    <span class="flow ${kind}"
                        >${reading === undefined ? "–" : `${this.text(`borders.${kind}`)} ${this.megawatts(Math.abs(reading))}`}</span
                    >
                </div>`;
            })}
        </div>`;
    }

    private mix(sensors: Sensors): TemplateResult {
        const shares = mixShares(this.hass!, sensors);
        return html`
            <div class="bar">
                ${shares.map((share) => html`<span style="flex-grow: ${share.share}; background: ${MIX_COLOURS[share.key]}"></span>`)}
            </div>
            <div class="legend">
                ${shares.map(
                    (share) =>
                        html`<span
                            ><i style="background: ${MIX_COLOURS[share.key]}"></i>${this.text(`mix.${share.key}`)}
                            ${this.number(share.value)}</span
                        >`,
                )}
            </div>
        `;
    }

    private forecast(sensors: Sensors): TemplateResult {
        const keys = FORECASTS.filter((key) => sensors[key]);
        if (this.forecastFailed || keys.length === 0) {
            return html`<div class="message small">${this.text("forecast.unavailable")}</div>`;
        }
        const series = keys.map((key) => this.forecasts?.[key] ?? []);
        const all = series.flat();
        if (all.length === 0) {
            return html`<div class="chart" style="height: ${CHART_HEIGHT + 18}px"></div>
                <div class="legend"></div>`;
        }
        const start = Math.min(...all.map((point) => point.start));
        const end = Math.max(...all.map((point) => point.start));
        const top = chartTop(series);
        const width = 300;
        const days = this.dayStarts(start, end).map((at) => {
            const x = ((at - start) / Math.max(1, end - start)) * width;
            return svg`<line class="day" x1=${x} x2=${x} y1="0" y2=${CHART_HEIGHT} />`;
        });
        // A day starting in the last fifth would have its label cut off at the edge, so only its line is drawn.
        const labels = this.dayStarts(start, end)
            .filter((at) => (at - start) / Math.max(1, end - start) < 0.8)
            .map((at) => html`<span style="left: ${((at - start) / Math.max(1, end - start)) * 100}%">${this.day(at)}</span>`);
        return html`
            <div class="chart">
                <svg viewBox="0 0 ${width} ${CHART_HEIGHT}" preserveAspectRatio="none" style="height: ${CHART_HEIGHT}px">
                    ${days}
                    ${keys.map(
                        (key, index) =>
                            svg`<polyline class="series" points=${polyline(series[index], start, end, top, width, CHART_HEIGHT)}
                                style="stroke: ${FORECAST_COLOURS[key]}" vector-effect="non-scaling-stroke" />`,
                    )}
                </svg>
                <span class="top">${this.megawatts(top)}</span>
                <div class="days">${labels}</div>
            </div>
            <div class="legend">
                ${keys.map((key) => {
                    const now = value(this.hass!, sensors, key);
                    return html`<span
                        ><i style="background: ${FORECAST_COLOURS[key]}"></i>${this.text(`forecast.${key}`)}
                        ${now === undefined ? "–" : this.number(now)}</span
                    >`;
                })}
            </div>
        `;
    }

    private details(sensors: Sensors): TemplateResult {
        const parts: string[] = [];
        const emission = value(this.hass!, sensors, "emission_factor_consumption");
        if (emission !== undefined) {
            parts.push(this.text("details.emission").replace("{value}", this.number(emission)));
        }
        const share = value(this.hass!, sensors, "non_fossil_share");
        if (share !== undefined) {
            parts.push(this.text("details.non_fossil").replace("{value}", this.number(share)));
        }
        const charging = value(this.hass!, sensors, "battery_charging");
        const discharging = value(this.hass!, sensors, "battery_discharging");
        if (charging !== undefined && discharging !== undefined) {
            parts.push(
                this.text("details.batteries")
                    .replace("{charging}", this.number(charging))
                    .replace("{discharging}", this.number(discharging)),
            );
        }
        return html`<div class="details">${parts.map((part) => html`<span>${part}</span>`)}</div>`;
    }

    /** Asks for the forecasts again when one of the forecast sensors has moved on, which it does each quarter of an hour. */
    private readForecasts(): void {
        if (!this.hass?.callWS || !shows(this.config, "show_forecast")) {
            return;
        }
        const sensors = this.sensors();
        const ids = FORECASTS.map((key) => sensors[key]).filter((id): id is string => Boolean(id));
        const key = ids.map((id) => this.hass!.states[id]?.last_updated ?? "").join("|");
        if (ids.length === 0 || key === this.forecastKey) {
            return;
        }
        this.forecastKey = key;
        this.hass
            .callWS<{ response?: Record<string, unknown> }>({
                type: "call_service",
                domain: "fingrid",
                service: "get_forecast",
                target: { entity_id: ids },
                return_response: true,
            })
            .then((result) => {
                const forecasts: Record<string, Point[]> = {};
                for (const forecastKey of FORECASTS) {
                    if (sensors[forecastKey]) {
                        forecasts[forecastKey] = forecastPoints(result.response?.[sensors[forecastKey]]);
                    }
                }
                this.forecasts = forecasts;
                this.forecastFailed = false;
            })
            .catch(() => {
                // The key is kept, so it is asked again when a forecast sensor next moves on, not on every update.
                this.forecastFailed = true;
            });
    }

    /** The local midnights between start and end, in the user's time zone. */
    private dayStarts(start: number, end: number): number[] {
        const date = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: this.timeZone() });
        const starts: number[] = [];
        let previous = date.format(start);
        // Midnights fall on whole quarters of an hour in every time zone Home Assistant has.
        for (let at = Math.ceil(start / 900000) * 900000; at <= end; at += 900000) {
            const today = date.format(at);
            if (today !== previous) {
                starts.push(at);
                previous = today;
            }
        }
        return starts;
    }

    private day(at: number): string {
        return new Intl.DateTimeFormat(this.language(), {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            timeZone: this.timeZone(),
        }).format(at);
    }

    /** The height the parts need at the narrowest the card gets, from its settings alone. */
    private minimumHeight(): number {
        const config = this.config;
        const parts: number[] = [shows(config, "show_status") ? HEADER_WITH_STATUS_HEIGHT : HEADER_HEIGHT];
        if (shows(config, "show_totals")) parts.push(TOTALS_HEIGHT);
        if (shows(config, "show_map")) parts.push(MAP_HEIGHT);
        if (shows(config, "show_borders")) parts.push(BORDER_ROW_HEIGHT * (BORDERS.length + (shows(config, "show_aland") ? 1 : 0)));
        if (shows(config, "show_mix")) parts.push(MIX_HEIGHT);
        if (shows(config, "show_forecast")) parts.push(FORECAST_HEIGHT);
        if (shows(config, "show_details")) parts.push(DETAILS_HEIGHT);
        return 2 * PADDING + parts.reduce((sum, part) => sum + part, 0) + GAP * (parts.length - 1);
    }

    private measureSoon(): void {
        cancelAnimationFrame(this.frame ?? 0);
        this.frame = requestAnimationFrame(() => this.fillRows());
    }

    /**
     * In a sections view whose rows are left automatic, the card takes the whole rows its content needs, or the half rows
     * with `row_step: half`, so the cards under it stay on the rows. The room left over is spread between the parts.
     */
    private fillRows(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        const content = card?.querySelector<HTMLElement>(":scope > .content");
        if (!card || !content || !card.clientWidth) {
            return;
        }
        const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
        if (!limit) {
            this.filled = 0;
            return;
        }
        // The parts' own heights, not where the last one ends, as the spread room pushes it down to the card's bottom.
        // Drawn sizes are unscaled, as the padding and border added to them are the layout's.
        const scale = drawnScale(card);
        const parts = [...content.children] as HTMLElement[];
        const style = getComputedStyle(card);
        const needed =
            parts.reduce((sum, part) => sum + part.getBoundingClientRect().height / scale, 0) +
            GAP * (parts.length - 1) +
            2 * PADDING +
            px(style.borderTopWidth) +
            px(style.borderBottomWidth);
        this.filled = filledHeight(needed, this.config ?? {}, limit);
    }

    private cardStyle(): string {
        return filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
    }

    private megawatts(reading: number): string {
        return `${this.number(reading)} MW`;
    }

    private number(reading: number): string {
        return new Intl.NumberFormat(this.language(), { maximumFractionDigits: 0 }).format(reading);
    }

    private timeZone(): string | undefined {
        return this.hass?.locale?.time_zone === "server" ? this.hass.config?.time_zone : undefined;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    public static get styles(): CSSResultGroup {
        return css`
            ha-card {
                container-type: inline-size;
                overflow: hidden;
                /* Its own transition: all would slide every change in the rows filled. */
                transition: none;
                /* A card taller than its parts, on filled or held rows, spreads the room between them. */
                display: flex;
                flex-direction: column;
            }
            .content {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: ${GAP}px;
                padding: ${PADDING}px;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                min-height: ${HEADER_HEIGHT}px;
                box-sizing: border-box;
            }
            .title {
                font-size: 16px;
                font-weight: 500;
            }
            .chips {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }
            .chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                line-height: 16px;
                padding: 4px 10px 4px 6px;
                border-radius: 14px;
                white-space: nowrap;
                color: var(--secondary-text-color);
                background: rgba(127, 127, 127, 0.12);
                --mdc-icon-size: 16px;
            }
            .chip.ok {
                color: var(--success-color, #43a047);
                background: color-mix(in srgb, var(--success-color, #43a047) 14%, transparent);
            }
            .chip.warning {
                color: var(--warning-color, #ffa600);
                background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent);
            }
            .chip.error {
                color: var(--error-color, #db4437);
                background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent);
            }
            .chip.info {
                color: var(--info-color, #039be5);
                background: color-mix(in srgb, var(--info-color, #039be5) 14%, transparent);
            }
            .totals {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }
            .number {
                font-size: 22px;
                line-height: 30px;
                white-space: nowrap;
            }
            .unit {
                font-size: 13px;
                /* A smaller font on the line would otherwise make the line taller. */
                line-height: 0;
                color: var(--secondary-text-color);
            }
            /* At a card under 400 px, where three numbers of 22 px don't fit side by side. */
            @container (max-width: 400px) {
                .number {
                    font-size: 19px;
                }
            }
            .label,
            .legend,
            .details,
            .place,
            .days,
            .top {
                color: var(--secondary-text-color);
                font-size: 12px;
            }
            .map {
                display: block;
                width: 100%;
                height: ${MAP_HEIGHT}px;
            }
            .land {
                fill: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
                stroke: color-mix(in srgb, var(--primary-text-color) 30%, transparent);
                stroke-width: 0.8;
            }
            .arrow {
                stroke-linecap: round;
            }
            .arrow.export,
            .flow.export {
                stroke: var(--primary-color);
                color: var(--primary-color);
            }
            .arrow.import,
            .flow.import {
                stroke: var(--warning-color, #ffa600);
                color: var(--warning-color, #ffa600);
            }
            .arrow.unknown {
                stroke: var(--disabled-text-color, #8f8f8f);
            }
            .export-fill {
                fill: var(--primary-color);
            }
            .import-fill {
                fill: var(--warning-color, #ffa600);
            }
            text.flow {
                font-size: 11px;
                fill: currentColor;
                stroke: none;
            }
            text.place {
                font-size: 9px;
                fill: var(--secondary-text-color);
            }
            .rows .row {
                display: flex;
                justify-content: space-between;
                gap: 8px;
                min-height: ${BORDER_ROW_HEIGHT}px;
                align-items: center;
                border-top: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            .rows .row:first-child {
                border-top: none;
            }
            .bar {
                display: flex;
                height: 14px;
                border-radius: 7px;
                overflow: hidden;
            }
            .bar span {
                flex-basis: 0;
            }
            .legend {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 12px;
                margin-top: 6px;
                line-height: 18px;
            }
            .legend i {
                display: inline-block;
                width: 9px;
                height: 9px;
                border-radius: 2px;
                margin-right: 4px;
            }
            .chart {
                position: relative;
            }
            .chart svg {
                display: block;
                width: 100%;
            }
            .series {
                fill: none;
                stroke-width: 2;
            }
            .day {
                stroke: var(--divider-color);
                stroke-width: 1;
                vector-effect: non-scaling-stroke;
            }
            .top {
                position: absolute;
                top: 0;
                left: 2px;
                font-size: 11px;
            }
            .days {
                position: relative;
                height: 18px;
            }
            .days span {
                position: absolute;
                top: 2px;
                padding-left: 4px;
                font-size: 11px;
                white-space: nowrap;
            }
            .details {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 12px;
                line-height: 16px;
            }
            .message {
                color: var(--secondary-text-color);
            }
            .message.small {
                font-size: 12px;
            }
        `;
    }
}

const px = (value: string) => Number.parseFloat(value) || 0;

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

if (!customElements.get("fingrid-card")) {
    console.info(
        `%c  FINGRID-CARD \n%c  ${CARD_VERSION}    `,
        "color: lightblue; font-weight: bold; background: black",
        "color: white; font-weight: bold; background: dimgray",
    );

    const registry = window as unknown as { customCards?: CardRegistration[] };
    registry.customCards = registry.customCards ?? [];
    registry.customCards.push({
        type: "fingrid-card",
        name: translate(browserLanguage(), "common.name"),
        description: translate(browserLanguage(), "common.description"),
        documentationURL: "https://github.com/jesmak/fingrid#fingrid-card",
        preview: true,
    });
    customElements.define("fingrid-card", FingridCard);
}

declare global {
    interface HTMLElementTagNameMap {
        "fingrid-card": FingridCard;
    }
}
