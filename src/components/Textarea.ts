import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Textarea.scss'

@customElement('ui-textarea')
class EnlightenmentTextfield extends Enlightenment {
  static styles = [styles]

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  autofocus?: boolean

  @property({ converter: Enlightenment.isInteger, type: Boolean })
  minLength?: number

  @property({ converter: Enlightenment.isInteger, type: Boolean })
  maxLength?: number

  @property({ type: String })
  id?: string = Enlightenment.useElementID()

  @property({ type: String })
  label?: string

  @property({ type: String })
  name?: string

  @property({ type: String })
  placeholder?: string

  @property({ type: String })
  value?: string

  renderLabel() {
    const slot = this.useSlot()

    return this.label
      ? html`<label class="textarea__label" for="${this.id}">${this.label}</label>`
      : html`<slot></slot>`
  }

  render() {
    return html`<div class="textarea">
      <aside class="textarea__aside">
        <div class="textarea__label-wrapper">${this.renderLabel()}</div>
      </aside>
      <main class="textarea__body">
        <div class="textarea__input-wrapper">
          <textarea
            ?autofocus=${this.autofocus}
            class="textarea__input"
            id="${this.id}"
            maxlength="${this.maxLength}"
            minlength="${this.minLength}"
            name="${this.name}"
            placeholder="${this.placeholder}"
          >
${this.value}</textarea
          >
        </div>
      </main>
    </div>`
  }
}
