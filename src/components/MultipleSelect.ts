import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './MultipleSelect.scss'

@customElement('ui-multiple-select')
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
  id? = Enlightenment.useElementID()

  @property({ type: String })
  placeholder?: string

  orientation?: string = 'bottom'

  @property({ type: Array })
  selected: HTMLInputElement[] = []

  // Use the currentElement state to expand or collapse the dropdown.
  enableDocumentEvents = true

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input.hasAttribute('checked') && input.checked) {
      input.setAttribute('checked', '')
    } else if (!input.checked) {
      input.removeAttribute('checked')
    }

    const relatedInputs: HTMLInputElement[] = Enlightenment.getElements(this, ['input']).filter(
      (e: HTMLInputElement) => e.name === input.name
    )

    if (relatedInputs.length) {
      relatedInputs.forEach((relatedInput) => {
        if (!relatedInput.checked) {
          relatedInput.removeAttribute('checked')
        }
      })
    }

    this.throttle(this.updatePlaceholder, Enlightenment.FPS, {})
  }

  protected handleCurrentElement(target: EventTarget | null): void {
    super.handleCurrentElement(target)

    if (this.currentElement) {
      const y = this.getBoundingClientRect().y

      this.commit('orientation', () => {
        if (y > window.innerHeight / 2) {
          return 'top'
        } else {
          return 'bottom'
        }
      })
    }
  }

  handleMutate(event: Event) {
    const { keyCode } = event as KeyboardEvent
    const target = event.target as HTMLInputElement

    if (target.hasAttribute('checked') && target.checked) {
      if (!keyCode || Enlightenment.keyCodes.confirm.includes(keyCode)) {
        target.checked = false
        !keyCode && this.hook('change', { context: target })
      }
    }
  }

  handleMutateCallback(option: HTMLOptionElement) {}

  render() {
    const classes = ['multiple-select']

    if (this.orientation) {
      classes.push(`multiple-select--align-from-${this.orientation}`)
    }

    return html`
      <div class="${classes.join(' ')}">
        <div class="multiple-select__body">
          ${this.renderPlaceholder()} ${this.renderDropdown()}
        </div>
        <slot aria-focusable-"false" aria-hidden="true"></slot>
      </div>
    `
  }

  renderDropdown() {
    const slot = this.useSlot()

    if (!slot) {
      return nothing
    }

    const options = Enlightenment.getElementsFromSlot(slot, ['option']) as HTMLOptionElement[]

    const result = options.map((option) => {
      const name = option.getAttribute('name')

      const type =
        options.filter((opt) => opt.getAttribute('name') === name).length > 1 ? 'radio' : 'checkbox'

      return this.renderInput(option, type)
    })

    return html`<div class="multiple-select__dropdown">${result || nothing}</div>`
  }

  renderPlaceholder() {
    return html`
      <div class="multiple-select__placeholder">
        <input
          class="multiple-select__placeholder-input"
          ref="${ref(this.context)}"
          type="text"
          value="${this.placeholder}"
        />
      </div>
    `
  }

  renderInput(option: HTMLOptionElement, type?: string) {
    if (!option) {
      return nothing
    }

    const disabled = option.disabled || option.hasAttribute('disabled')
    const name = option.name || option.getAttribute('name')
    const value = option.value || option.getAttribute('value')

    return html`<label class="multiple-select__input-label"
      ><input
        class="multiple-select__input"
        name="${name}"
        value="${value}"
        ?disabled=${disabled}
        type="${type || 'checkbox'}"
        @change=${this.handleChange}
        @click=${this.handleMutate}
        @keydown=${this.handleMutate}
      /><span class="multiple-select__input-value">${option.textContent}</span></label
    >`
  }

  updatePlaceholder(inputs) {
    const context = this.useContext() as HTMLInputElement

    if (context.type !== 'text') {
      return
    }

    const selected = Enlightenment.getElements(this, ['input'])
      .filter((input: HTMLInputElement) => input !== context && input.checked)

      .filter((v) => v)

    this.commit('selected', () => {
      const values = selected.map((input) => {
        if (input.checked) {
          const label = input.closest('label')
          const fallback = label ? label.textContent : input.name

          return input.label || fallback || input.value
        }
      })

      this.placeholder = values.join(', ')

      // Ensure the current value is used for the optional placeholder input.
      context.value = this.placeholder

      return selected
    })
  }
}
