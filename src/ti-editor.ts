import { sass as cssLang } from "@codemirror/lang-sass";
import { html as htmlLang } from "@codemirror/lang-html";
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { syntaxHighlighting, indentUnit } from "@codemirror/language";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { EditorView, highlightWhitespace } from "@codemirror/view";
import { classHighlighter } from "@lezer/highlight";
import { minimalSetup } from "codemirror";
import { css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ti-editor")
export class TiEditor extends LitElement {
	static override styles = css`
		:host {
			box-sizing: border-box;
			display: block;
			font-size: var(--editor-font-size);
		}

		.cm-editor {
			&.cm-focused {
				outline: none;
			}

			.cm-scroller {
				line-height: var(--editor-line-height);
				scrollbar-width: var(--editor-scrollbar-width);

				.cm-content {
					font-family: var(--editor-font-family);
					padding: var(--editor-padding);
					text-box: var(--editor-text-box);

					.cm-line {
						color: var(--syntax-text);
						padding: initial;

						.tok-link {
							color: var(--syntax-link);
						}

						.tok-heading {
							color: var(--syntax-heading);
						}

						.tok-emphasis {
							color: var(--syntax-emphasis);
						}

						.tok-strong {
							color: var(--syntax-strong);
						}

						.tok-keyword {
							color: var(--syntax-keyword);
						}

						.tok-atom {
							color: var(--syntax-atom);
						}

						.tok-bool {
							color: var(--syntax-bool);
						}

						.tok-url {
							color: var(--syntax-url);
						}

						.tok-labelName {
							color: var(--syntax-labelName);
						}

						.tok-inserted {
							color: var(--syntax-inserted);
						}

						.tok-deleted {
							color: var(--syntax-deleted);
						}

						.tok-literal {
							color: var(--syntax-literal);
						}

						.tok-string {
							color: var(--syntax-string);
						}

						.tok-number {
							color: var(--syntax-number);
						}

						.tok-variableName {
							color: var(--syntax-variableName);
						}

						.tok-definition {
							color: var(--syntax-definition);
						}

						.tok-typeName {
							color: var(--syntax-typeName);
						}

						.tok-namespace {
							color: var(--syntax-namespace);
						}

						.tok-className {
							color: var(--syntax-className);
						}

						.tok-macroName {
							color: var(--syntax-macroName);
						}

						.tok-propertyName {
							color: var(--syntax-propertyName);
						}

						.tok-operator {
							color: var(--syntax-operator);
						}

						.tok-comment {
							color: var(--syntax-comment);
						}

						.tok-meta {
							color: var(--syntax-meta);
						}

						.tok-punctuation {
							color: var(--syntax-punctuation);
						}

						.tok-invalid {
							color: var(--syntax-invalid);
						}

						.cm-highlightSpace,
						.cm-highlightTab {
							position: relative;

							&::before {
								color: var(--syntax-whitespace);
								pointer-events: none;
								position: absolute;
							}
						}

						.cm-highlightSpace {
							background: var(--syntax-whitespace-space-background);

							&::before { content: var(--syntax-whitespace-space, '•'); }
						}

						.cm-highlightTab {
							background: var(--syntax-whitespace-tab-background);

							&::before { content: var(--syntax-whitespace-tab, '⇥'); }
						}
					}
				}

				.cm-layer.cm-cursorLayer .cm-cursor {
					border-left-color: var(--editor-caret-color);
				}

				.cm-layer.cm-selectionLayer .cm-selectionBackground {
					background-color: var(--editor-selection-background);
				}
			}
		}
	`;

	view?: EditorView;
	readOnlyCompartment = new Compartment();

	@property()
	file: string | null = null;

	@property()
	code: string = "";

	@property({ type: Boolean })
	readonly = false;

	private getLang() {
		return this.file?.split(".").pop();
	}

	private createState() {
		const extensions: Extension[] = [
			minimalSetup,
			EditorView.updateListener.of(() => this.onUpdate()),
			this.readOnlyCompartment.of(EditorState.readOnly.of(this.readonly)),
			syntaxHighlighting(classHighlighter),
			highlightWhitespace(),
			indentUnit.of("\t"),
		];

		const lang = this.getLang();

		if (lang === "html") {
			extensions.push(htmlLang());
		}

		if (lang === "css") {
			extensions.push(cssLang());
		}

		if (lang === "js") {
			extensions.push(jsLang());
		}

		return EditorState.create({
			doc: this.code,
			extensions,
		});
	}

	private onUpdate() {
		this.dispatchEvent(
			new CustomEvent("code-change", {
				detail: {
					file: this.file,
					code: this.view!.state.doc.toString(),
				},
			})
		);
	}

	override connectedCallback() {
		super.connectedCallback();

		this.view = new EditorView({
			root: this.shadowRoot!,
			parent: this,
		});

		this.view?.setState(this.createState());
	}

	override disconnectedCallback() {
		super.disconnectedCallback();

		this.view?.destroy();
	}

	override render() {
		if (this.view?.state.readOnly !== this.readonly) {
			this.view?.dispatch({ effects: this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(this.readonly)) });
		}

		if (this.code !== this.view!.state.doc.toString()) {
			this.view?.setState(this.createState());
		}

		return this.view?.dom;
	}
}
