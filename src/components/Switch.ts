import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Switch.scss'

@customElement('ui-switch')
class EnlightenmentRadioButton extends Enlightenment {
  static styles = [styles]

  @property({
    converter: (value: string) => Enlightenment.filterProperty(value, ['ltr', 'rtl']),
    type: String
  })
  direction = 'ltr'

  @property({ attribute: 'active', converter: Enlightenment.isBoolean, type: Boolean })
  isActive?: boolean = false

  @property({ attribute: 'flip', converter: Enlightenment.isBoolean, type: Boolean })
  isFlipped?: boolean = false

  @property({ type: String })
  label?: string = ''

  @property({ type: String })
  name?: string

  @property({ type: String })
  value?: string

  @property({
    converter: (value: string) => Enlightenment.filterProperty(value, ['medium', 'small', 'large']),
    type: String
  })
  size = 'medium'

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  disabled?: boolean

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    this.commit('isActive', event.target.checked)
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement

    if (target.tagName === 'INPUT') {
      event.preventDefault()

      return
    }

    if (this.disabled) {
      return
    }

    const input = this.useContext() as HTMLInputElement

    if (!input) {
      return
    }

    input.checked = !this.isActive

    this.hook('change', { context: input })
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

    if (!Enlightenment.keyCodes.confirm.includes(keyCode)) {
      return
    }

    this.handleClick({ target: this })
  }

  render() {
    const classes = [`switch--is-${this.direction}`, `switch--is-${this.size}`]

    if (this.disabled) {
      classes.push('switch--is-disabled')
    }

    if (this.isActive) {
      classes.push('switch--is-active')
    }

    if (this.isFlipped) {
      classes.push('switch--is-flipped')
    }

    return html`
      <div class="switch ${classes.join(' ')}" @click=${this.handleClick}>
        <label class="switch__label">
          <span class="switch__input-wrapper">
            <input
              ?checked=${this.isActive && 'checked'}
              ?disabled=${this.disabled}
              ?name=${this.name}
              ?value=${this.value}
              @change=${this.handleChange}
              @click=${this.handleClick}
              @keydown=${this.handleKeydown}
              class="switch__input"
              ref="{${ref(this.context)}}"
              type="checkbox"
            />
            <span class="switch__icon"></span>
            <span aria-focusable="false" aria-hidden="true" class="switch__focus-indicator"></span>
          </span>
          <span class="switch__body">
            <slot>${this.label || nothing}</slot>
          </span>
        </label>
      </div>
    `
  }
}
