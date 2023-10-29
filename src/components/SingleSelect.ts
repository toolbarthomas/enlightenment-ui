import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './SingleSelect.scss'

@customElement('ui-single-select')
class EnlightenmentSingleSelect extends Enlightenment {
  static styles = [styles]

  @property({
    attribute: 'disabled',
    converter: Enlightenment.isBoolean,
    reflect: true,
    type: Boolean
  })
  isDisabled?: boolean

  @property({
    attribute: 'loading',
    converter: Enlightenment.isBoolean,
    reflect: true,
    type: Boolean
  })
  isLoading?: boolean

  @property({ type: String })
  label?: string

  @property({ type: String })
  name?: string

  @property({ type: String })
  id? = Enlightenment.useElementID()

  @property({ type: String })
  value?: string

  selected?: string

  /**
   * Returns the text contents of the selected input value.
   */
  protected getReadableValue(value?: string) {
    const context = this.useContext() as HTMLSelectElement

    if (!context) {
      return
    }

    const options = context.querySelectorAll('option')

    if (!options || !options.length) {
      return
    }

    const option = value
      ? Array.from(options).filter((option) => option.value === value)[0]
      : options[context.selectedIndex]

    return option.textContent || option.value
  }

  protected handleChange(event: Event): void {
    if (!event) {
      return
    }

    const target = event.target as HTMLSelectElement

    if (target.childElementCount) {
      this.getReadableValue() && this.commit('selected', this.getReadableValue())
      this.commit('value', target.value)
    } else {
      this.addEventListener(
        'updated',
        () => {
          const context = this.useContext() as HTMLSelectElement

          // if (!this.selected) {
          this.throttle(() => {
            this.commit('selected', this.getReadableValue(this.value))
            this.commit('value', context.value)
          })
          // }

          this.requestUpdate()
        },
        { once: true }
      )
    }
  }

  protected handleSlotChange(event: Event): void {
    super.handleSlotChange(event)

    const context = this.useContext() as HTMLSelectElement

    if (!context) {
      return
    }

    this.throttle(this.hook, Enlightenment.FPS, 'change', { context })
  }

  render() {
    const classes = ['single-select']

    if (this.isDisabled) {
      classes.push('single-select--is-disabled')
    }

    return html`
      <div class="${classes.join(' ')}">
        ${this.renderLabel()}
        <div class="single-select__input-wrapper">
          <select
            class="single-select__input"
            id="${this.id}"
            ref="${ref(this.context)}"
            @change="${this.handleChange}"
            ?disabled=${this.isDisabled}
          >
            ${this.renderChildren()}
          </select>
          <span class="single-select__value">${this.selected}</span>
          <div class="single-select__icon-wrapper">
            ${this.renderIcon()}
          </div>
        </div>

        <slot aria-focusable-"false" aria-hidden="true"></slot>
      </div>
    `
  }

  renderChild(element?: HTMLOptionElement) {
    if (!element) {
      return nothing
    }

    const value = element.value || element.textContent
    const disabled = element.hasAttribute('disabled')
    const selected =
      (this.selected && value === this.value) || (!this.value && element.hasAttribute('selected'))

    return html`<option
      class="single-select__option"
      ?disabled=${disabled}
      ?selected=${selected}
      value="${value}"
    >
      ${element.textContent}
    </option>`
  }

  renderChildren() {
    const slot = this.useSlot()

    if (!slot) {
      return nothing
    }

    const children = Enlightenment.getElementsFromSlot(slot, ['optgroup', 'option']).map(
      (element) => {
        if (element.tagName === 'OPTGROUP' && element.children.length) {
          const options = Array.from(element.children).map((child) => this.renderChild(child))
          const label = element.getAttribute('label')

          if (label) {
            return html`<optgroup class="single-select__optgroup" label="${label}">
              ${options}
            </optgroup>`
          } else {
            return options
          }
        }

        if (element.closest('optgroup')) {
          return nothing
        }

        return this.renderChild(element)
      }
    )

    return children
  }

  renderIcon() {
    const slot = this.useSlot('icon')

    if (this.isLoading) {
      return html`<span class="single-select__status-indicator"></span>`
    }

    if (!slot) {
      return html`<span class="single-select__default-icon"></span
        ><span class="single-select__default-icon"></span>`
    }

    return html`<slot name="icon" tabindex="-1" aria-focusable="false" aria-hidden="true"></slot>`
  }

  renderLabel() {
    const slot = this.useSlot('label')

    if (!slot && !this.label) {
      return nothing
    }

    const content = slot
      ? html`<slot name="label"></slot>`
      : html`<label class="single-select__label" for="${this.id}">${this.label}</label>`

    return html`<div class="single-select__label-wrapper">${content}</div>`
  }
}
