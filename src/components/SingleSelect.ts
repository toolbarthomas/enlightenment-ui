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
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  disabled?: boolean

  @property({ type: String })
  label?: string

  @property({ type: String })
  name?: string

  @property({ type: String })
  id?: string = Enlightenment.useElementID()

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

    if (target.selectedIndex === 0) {
      target.setAttribute('edge', 'start')
    } else if (target.selectedIndex >= target.querySelectorAll('option').length - 1) {
      target.setAttribute('edge', 'end')
    } else {
      target.removeAttribute('edge')
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

    if (this.disabled) {
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
            ?disabled=${this.disabled}
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
      (element: HTMLOptGroupElement | HTMLOptionElement) => {
        let options: Element[] = []
        if (element.tagName === 'OPTGROUP' && element.children.length) {
          options = [...element.children].map((child) => this.renderChild(child))

          if (element.labell) {
            return html`<optgroup
              class="single-select__optgroup"
              label="${element.label}"
              ?disabled=${element.disabled}
            >
              ${options}
            </optgroup>`
          } else {
            return options
          }
        }

        // Ignore any nested element.
        if (element.closest('optgroup') || options.includes(element)) {
          return nothing
        }

        return this.renderChild(element)
      }
    )

    return children
  }

  renderIcon() {
    const slot = this.useSlot('icon')

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
