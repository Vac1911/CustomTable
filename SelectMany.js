import {
    html,
    css,
    LitElement
} from "lit";
import {
    styleMap
} from "lit/directives/style-map.js";

export class SelectMany extends LitElement {
    static get styles() {
        return css`
            :host {
                display: inline-block;
                position: relative;
                min-width: 250px;
                max-width: 350px;
                font-size: 13.3333px;
            }
            :host,
            .dropdown {
                background: white;
                border: 1px black solid;
            }
            .dropdown {
                position: absolute;
                left: 0;
                right: 0;
                max-height: 500px;
                overflow: auto;
            }
            .dropdown[closed] {
                display: none;
            }
            .option[data-selected] {
                background: #5380cc;
                color: white;
            }
            .option:not([data-selected]):hover {
                background: lightgray;
            }
            .display,
            .option {
                box-sizing: border-box;
                height: 21px;
                padding: 2px 16px 2px 4px;
                text-align: left;
            }
        `;
    }

    static get properties() {
        return {
            options: {
                type: Object
            },
            open: {
                type: Boolean
            },
        };
    }

    toggle = (val) => this.selected.delete(val) || this.selected.add(val);

    onChange(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.target.focus();
        const val = e.target.getAttribute("data-value");
        this.toggle(val);

        this.requestUpdate();

        this.value = Array.from(this.selected);

        const event = new Event("change", {
            composed: true
        });
        this.dispatchEvent(event);
    }

    willUpdate(changedProperties) {
        if (changedProperties.has("options")) {
            this.selected = new Set();
            this.open = false;
        }
    }

    constructor() {
        super();
        this.selected = new Set();
        this.options = {};
        this.open = false;
        this.dropdownHeight = 0;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("focusout", () => {
            this.open = false;
        });
        this.addEventListener("focusin", () => {
            this.open = true;
        });
    }

    getDisplayText() {
        if (this.selected.size)
            return Array.from(this.selected)
                .map((k) => this.options[k])
                .join(", ");
        else return "-";
    }

    willUpdate() {
        const dispalyRect = this.shadowRoot
            .querySelector(".display")
            ?.getBoundingClientRect();
        if (dispalyRect) {
            const intViewportHeight = window.innerHeight;
            this.bottomMargin = 24; // This is just because I think it looks nicer not right up against the bottom edge
            let spaceBelow = Math.floor(intViewportHeight - dispalyRect.bottom - this.bottomMargin);
            let autoHeight = this.options.length * 21 + 2;
            this.dropdownHeight = Math.min(spaceBelow, autoHeight) + 'px';
        }
    }

    render() {
        return html`
            <div class="display" tabindex="0">${this.getDisplayText()}</div>
            <div
                class="dropdown"
                ?closed="${!this.open}"
                style=${styleMap({height: this.dropdownHeight})}
            >
                ${Object.entries(this.options).map(
                    ([val, name]) => html`
                        <div
                            class="option"
                            tabindex="-1"
                            data-value="${val}"
                            ?data-selected=${this.selected.has(val)}
                            @click="${this.onChange}"
                        >
                            ${name}
                        </div>
                    `
                )}
            </div>
        `;
    }
}
customElements.define("select-many", SelectMany);
