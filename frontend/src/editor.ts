/** The card's visual editor: the parts shown and the height's rounding. */
import { LitElement, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import type { HomeAssistant } from "./hass";
import { browserLanguage, translate } from "./localize/localize";
import { rowStepData, rowStepSchema, tidyRowStep } from "./rows";
import { DEFAULTS, shows } from "./types";
import type { FingridCardConfig } from "./types";

interface SchemaEntry {
    name: string;
}

function schema(config: FingridCardConfig, text: (key: string) => string) {
    // Åland is on the map and in the list, so its switch is offered while either is shown.
    const aland = shows(config, "show_map") || shows(config, "show_borders");
    return [
        { name: "show_status", selector: { boolean: {} } },
        { name: "show_totals", selector: { boolean: {} } },
        { name: "show_map", selector: { boolean: {} } },
        { name: "show_borders", selector: { boolean: {} } },
        ...(aland ? [{ name: "show_aland", selector: { boolean: {} } }] : []),
        { name: "show_mix", selector: { boolean: {} } },
        { name: "show_forecast", selector: { boolean: {} } },
        { name: "show_details", selector: { boolean: {} } },
        ...rowStepSchema(config, text),
    ];
}

export class FingridCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config: FingridCardConfig = { type: "custom:fingrid-card" };

    public setConfig(config: FingridCardConfig): void {
        this.config = { ...config };
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass) {
            return nothing;
        }
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${{ ...DEFAULTS, ...rowStepData(this.config) }}
                .schema=${schema(this.config, (key) => this.text(key))}
                .computeLabel=${(entry: SchemaEntry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
    }

    private valueChanged(event: CustomEvent<{ value: FingridCardConfig }>): void {
        const config: FingridCardConfig = tidyRowStep(event.detail.value);
        // The defaults are shown in the form but left out of the configuration.
        for (const [key, value] of Object.entries(DEFAULTS)) {
            if (config[key] === value || config[key] === undefined || config[key] === null) {
                delete config[key];
            }
        }
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    private helper(name: string): string | undefined {
        const key = `editor.${name}_helper`;
        const helper = translate(this.language(), key);
        return helper === key ? undefined : helper;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }
}

if (!customElements.get("fingrid-card-editor")) {
    customElements.define("fingrid-card-editor", FingridCardEditor);
}

declare global {
    interface HTMLElementTagNameMap {
        "fingrid-card-editor": FingridCardEditor;
    }
}
