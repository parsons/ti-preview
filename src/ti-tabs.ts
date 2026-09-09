import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("ti-tabs")
export class TiTabs extends LitElement {
	static override styles = css`
		:host {
			display: block;
			position: sticky;
			top: 0;
			z-index: 1;
		}

		nav {
			-webkit-backdrop-filter: var(--tab-bar-filter);
			backdrop-filter: var(--tab-bar-filter);
			background: var(--tab-bar-nav-background, var(--tab-bar-background));
			border: var(--tab-bar-nav-border);
			border-bottom: var(--tab-bar-nav-border-bottom, var(--tab-bar-nav-border));
			border-left: var(--tab-bar-nav-border-left, var(--tab-bar-nav-border));
			border-right: var(--tab-bar-nav-border-right, var(--tab-bar-nav-border));
			border-top: var(--tab-bar-nav-border-top, var(--tab-bar-nav-border));
			box-shadow: var(--tab-bar-nav-box-shadow);
			display: flex;
			margin: var(--tab-bar-margin);

			&:has(a:only-child) { display: none }
		}

		a {
			background: var(--tab-bar-background);
			border: var(--tab-bar-border);
			border-bottom: var(--tab-bar-border-bottom, var(--tab-bar-border));
			border-left: var(--tab-bar-border-left, var(--tab-bar-border));
			border-right: var(--tab-bar-border-right, var(--tab-bar-border));
			border-top: var(--tab-bar-border-top, var(--tab-bar-border));
			box-shadow: var(--tab-bar-box-shadow);
			color: var(--tab-bar-foreground);
			font-family: var(--tab-bar-font-family);
			font-size: var(--tab-bar-font-size);
			margin: 0;
			padding: var(--tab-bar-padding);
			position: relative;
			text-box: var(--tab-bar-text-box);
			text-decoration: none;

			&:hover {
				background: var(--tab-bar-hover-background);
				color: var(--tab-bar-hover-foreground);
			}

			&.active {
				background: var(--tab-bar-active-background);
				border: var(--tab-bar-active-border);
				border-bottom: var(--tab-bar-active-border-bottom, var(--tab-bar-active-border));
				border-left: var(--tab-bar-active-border-left, var(--tab-bar-active-border));
				border-right: var(--tab-bar-active-border-right, var(--tab-bar-active-border));
				border-top: var(--tab-bar-active-border-top, var(--tab-bar-active-border));
				box-shadow: var(--tab-bar-active-box-shadow);
				color: var(--tab-bar-active-foreground);
				font-weight: var(--tab-bar-active-weight);
			}

			&.active::after {
				background: var(--tab-bar-active-highlight);
				border-radius: var(--tab-bar-active-border-radius);
				content: "";
				inset: var(--tab-bar-active-inset);
				position: absolute;
			}
		}
	`;

	@property()
	current: string | null = null;

	@property()
	files: string = "";

	private get fileNames() {
		return this.files.split(",");
	}

	private handleClick(event: Event) {
		if (event.target === event.currentTarget) return;

		if (event.target instanceof HTMLAnchorElement) {
			const file = event.target.getAttribute("aria-controls");

			if (file) {
				this.dispatchEvent(new CustomEvent("set-current", { detail: { file } }));
				event.preventDefault();
			}
		}
	}

	override connectedCallback() {
		super.connectedCallback();
	}

	override render() {
		return html`
			<nav role="tablist" @click="${this.handleClick}">
				${this.fileNames.map(
					(file) => html`
						<a class="${classMap({ active: file === this.current })}" href="#tab" aria-controls="${file}" role="tab">
							${file}
						</a>
					`
				)}
			</nav>
		`;
	}
}
