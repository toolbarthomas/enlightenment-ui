import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Throbber.scss'

@customElement('ui-throbber')
class EnlightenmentThrobber extends Enlightenment {
  static styles = [styles]

  @property({ type: String })
  color?: string

  @property({ converter: Enlightenment.isBoolean, reflect: true, type: Boolean })
  hidden?: boolean = false

  @property({ type: String })
  label?: string

  updated() {
    super.updated()

    this.hidden = this.hasAttribute('hidden')

    if (this.hidden != null) {
      this.setAttribute('aria-hidden', String(this.hidden))
    }

    const context = this.useContext() as HTMLElement

    if (context && this.color) {
      context.style.color = `var(${this.color}, ${this.mode === 'dark' ? 'black' : 'white'})`
    }
  }

  render() {
    return html`
      <div class="throbber" ref="${ref(this.context)}">
        <span class="throbber__icon"></span>
        ${this.renderLabel()}
      </div>
    `
  }

  renderLabel() {
    if (!this.label) {
      return nothing
    }

    return html`<span class="throbber__label">${this.label}</span>`
  }
}
