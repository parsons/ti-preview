import type { PropertyValueMap } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("ti-output")
export class TiOutput extends LitElement {
	static override styles = css`
		:host {
			display: block;
			border: var(--output-border);
			border-left: 0;
			position: relative;
			background: var(--output-background);
		}

		iframe {
			margin: 0;
			inline-size: 100%;
			block-size: 100%;
			display: block;
			border: 0;
		}

		p {
			backdrop-filter: var(--output-dimensions-backdrop, blur(5px));
			background: var(--output-dimensions-background, #ffffffaa);
			border: var(--output-dimensions-border);
			border-bottom: var(--output-dimensions-border-bottom, var(--output-dimensions-border));
			border-left: var(--output-dimensions-border-left, var(--output-dimensions-border));
			border-right: var(--output-dimensions-border-right, var(--output-dimensions-border));
			border-top: var(--output-dimensions-border-top, var(--output-dimensions-border));
			box-shadow: var(--output-dimensions-box-shadow);
			font-family: var(--output-dimensions-font-family, var(--editor-font-family));
			font-size: var(--output-dimensions-font-size, 12px);
			font-variant-numeric: tabular-nums;
			inset: var(--output-dimensions-inset, auto auto 4px 4px);
			margin: 0;
			padding: var(--output-dimensions-padding, 3px 5px);
			position: absolute;
			text-box: var(--output-dimensions-text-box);

			&.hidden {
				animation: fade-out 200ms forwards;
			}
		}

		@keyframes fade-out {
			from {
				opacity: 1;
			}
			to {
				opacity: 0;
			}
		}
	`;

	@property()
	code: string = "";

	@property()
	base: string | null = null;

	private iframe = document.createElement("iframe");
	private ro = new ResizeObserver((entries) => this.onResize(entries));

	@state()
	protected inlineSize = 0;

	@state()
	protected blockSize = 0;

	@state()
	protected dimensionsVisible = false;

	private dimensionsTimeout: number | undefined;

	private onResize(entries: ResizeObserverEntry[]) {
		const { blockSize, inlineSize } = entries[0].contentBoxSize[0];

		this.inlineSize = Math.round(inlineSize);
		this.blockSize = Math.round(blockSize);

		this.dimensionsVisible = true;

		clearTimeout(this.dimensionsTimeout);
		this.dimensionsTimeout = setTimeout(() => (this.dimensionsVisible = false), 2000);
	}

	constructor() {
		super();
		this.ro.observe(this);
	}

	private get sanitized() {
		let sanitizedCode = this.code.replace(/<link(?!.*href="\/).*?>/gm, '');
		sanitizedCode = sanitizedCode.replace(/<script(?!.*src="\/).*?>.*<\/script>/gm, '');

		if (this.base) {
			sanitizedCode = sanitizedCode.replace(/url\((["'])(?!http)/g, `url($1${this.base}`);
			sanitizedCode = sanitizedCode.replace('</head>', `<base href="${this.base}"></head>`);
		}

		return sanitizedCode;
	}

	override update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		if (this.code !== changedProperties.get("code")) {
			this.iframe.srcdoc = this.sanitized;
		}

		super.update(changedProperties);
	}

	override render() {
		return html`
			${this.iframe}
			<p class="${classMap({ hidden: !this.dimensionsVisible })}">${this.inlineSize}px &times; ${this.blockSize}px</p>
		`;
	}
}
