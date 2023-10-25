import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Textfield.scss'

@customElement('ui-textfield')
class EnlightenmentTextfield extends Enlightenment {
  static styles = [styles]

  @property({ type: String })
  id? = Enlightenment.useElementID()

  @property({ type: String })
  label?: string

  @property({ type: String })
  placeholder?: string

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    console.log('Change')

    this.hook('change')
  }

  handleKeydown(event: KeyboardEvent) {
    const { keyCode } = event

    if (Enlightenment.keyCodes.meta.includes(keyCode)) {
      return
    }

    if (Enlightenment.keyCodes.exit.includes(keyCode)) {
      event.target && event.target.blur()

      return
    }

    // this.hook('change', { context: this.useContext() })
  }

  render() {
    const classes = ['textfield']

    return html`<div class="${classes.join(' ')}">
      ${this.renderLabel()}
      <div class="textfield__input-wrapper">
        <input
          ?disabled=${this.disabled}
          ?value=${this.value}
          @change=${this.handleChange}
          @keydown=${this.handleKeydown}
          class="textfield__input"
          id=${this.id}
          name=${this.name}
          placeholder=${this.placeholder}
          ref="{${ref(this.context)}}"
          type="text"
        />
        <span class="textfield__focus-indicator"></span>
      </div>
    </div>`
  }

  renderLabel() {
    const slot = this.useSlot()

    console.log(this.label, 'foo')

    if (!slot && !this.label) {
      return nothing
    }

    if (this.label) {
      return html`<div class="textfield__label-wrapper">
        <label class="textfield__label" for="${this.id}"> ${this.label}</label>
      </div>`
    } else if (slot) {
      return html`<div class="textfield_label-wrapper"><slot></slot></div>`
    } else {
      return nothing
    }
  }
}
