import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Checkbox.scss'

@customElement('ui-checkbox')
class EnlightenmentCheckbox extends Enlightenment {
  static styles = [styles]

  @property({ attribute: 'active', converter: Enlightenment.isBoolean, type: Boolean })
  isActive?: boolean = false

  @property({ type: String })
  label?: string = ''

  @property({ type: String })
  id? = Enlightenment.useElementID()

  @property({ type: String })
  name?: string

  @property({ type: String })
  value?: string

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  disabled?: boolean

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    const target = event.target as HTMLInputElement

    this.commit('isActive', target.checked)
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement

    if (target.tagName === 'INPUT') {
      event.preventDefault()

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
      const target = event.target as HTMLInputElement
      target.blur && target.blur()

      return
    }

    if (!Enlightenment.keyCodes.confirm.includes(keyCode)) {
      return
    }

    this.handleClick({ target: this })
  }

  render() {
    const classes = []

    if (this.disabled) {
      classes.push('checkbox--is-disabled')
    }

    if (this.isActive) {
      classes.push('checkbox--is-active')
    }

    return html`
      <div class="checkbox ${classes.join(' ')}" @click=${this.handleClick}>
        <label class="checkbox__label">
          <span class="checkbox__input-wrapper">
            <input
              ?checked=${this.isActive && 'checked'}
              ?disabled=${this.disabled}
              ?name=${this.name}
              ?value=${this.value}
              @change=${this.handleChange}
              @click=${this.handleClick}
              @keydown=${this.handleKeydown}
              class="checkbox__input"
              ref="{${ref(this.context)}}"
              type="checkbox"
            />
            <span class="checkbox__icon"></span>
          </span>
          <span class="checkbox__body">
            <slot>${this.label || nothing}</slot>
          </span>
        </label>
      </div>
    `
  }
}
