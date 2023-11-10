import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from '@/components/RadioButton.scss'

@customElement('ui-radio-button')
class EnlightenmentRadioButton extends Enlightenment {
  static styles = [styles]

  @property({ attribute: 'active', converter: Enlightenment.isBoolean, type: Boolean })
  isActive?: boolean = false

  @property({ type: String })
  label?: string = ''

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

    if (event.target.checked) {
      this.uncheckRelated()
    }

    this.commit('isActive', event.target.checked)
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
      event.target && event.target.blur()

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
      classes.push('radio-button--is-disabled')
    }

    if (this.isActive) {
      classes.push('radio-button--is-active')
    }

    return html`
      <div class="radio-button ${classes.join(' ')}" @click=${this.handleClick}>
        <label class="radio-button__label">
          <span class="radio-button__input-wrapper">
            <input
              ?checked=${this.isActive && 'checked'}
              ?disabled=${this.disabled}
              ?name=${this.name}
              ?value=${this.value}
              @change=${this.handleChange}
              @click=${this.handleClick}
              @keydown=${this.handleKeydown}
              class="radio-button__input"
              ref="{${ref(this.context)}}"
              type="radio"
            />
            <span class="radio-button__icon"></span>
          </span>
          <span class="radio-button__body">
            <slot>${this.label || nothing}</slot>
          </span>
        </label>
      </div>
    `
  }

  uncheckRelated() {
    const related = Enlightenment.getRelatedComponents(this, `${this.tagName}[name="${this.name}"]`)

    related.forEach((element) => {
      if (element.context && element.context.value) {
        const input = element.context.value as HTMLInputElement
        input.checked = false
        this.hook('change', { context: input })
      }
    })
  }
}
