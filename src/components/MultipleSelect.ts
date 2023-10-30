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

/**
 * Expected Object interface for additional Selection Options that are defined
 * from the suggestions property.
 */
export type MultipleSelectSuggestion = {
  name: string
  value: string
  id?: string
  label?: string
  checked?: boolean
}

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

  // Will update during a input suggestion change. The suggested entries should
  // be included for the actual component value.
  suggested: MultipleSelectSuggestion[] = []

  @property({
    converter: (value) => {
      if (!value) {
        return
      }

      let json: any

      try {
        json = JSON.parse(value.replaceAll(`'`, `"`))

        return json.map((suggestion) => {
          const { checked, id, label, name, value } = suggestion || {}

          return {
            checked,
            id: id || Enlightenment.useElementID(),
            label: label || value || name || suggestion,
            name: name || value || suggestion,
            value: name || value
          }
        })
      } catch (error) {
        if (error) {
          return value.split(',').map((v) => ({ label: v, name: v, value: v }))
        }
      }
    },
    type: Array
  })

  // Implements the usage of additional Selection Options within the rendered
  // Dropdown element. This enables the usage of Input suggestions that are
  // fetched from an external Request. See the MultipleSelectSuggestion typing
  // for the actual Object interface.
  // You should merge previous defined suggestions with any new suggestions to
  // prevent the issue where previously checked suggestions are lost within the
  // final component value.
  suggestions?: MultipleSelectSuggestion[] = []

  // Use the currentElement state to expand or collapse the dropdown.
  enableDocumentEvents = true

  public attributeChangedCallback(
    name: string,
    _old?: string | undefined,
    value?: string | undefined
  ): void {
    super.attributeChangedCallback(name, _old, value)

    // Merge the previous defined suggestions that are checked.
    if (name === 'suggestions' && Array.isArray(this.selected)) {
      const slot = this.useSlot()

      // Exclude the initial inputs that are defined from the default
      // Slot Element.
      const initialOptions = slot
        ? (Enlightenment.getElementsFromSlot(slot, ['option']) as HTMLOptionElement[])
        : []

      // Cache the previous selected values since they could already be removed
      // from the DOM.
      const oldSelected = this.selected.map((selected) =>
        !selected.hasAttribute('initial')
          ? {
              checked: selected.checked,
              id: selected.id,
              label: selected.closest('label')?.textContent,
              name: selected.name,
              value: selected.value
            }
          : {}
      )

      // Merge the previous defined suggestions with the updated suggestions
      // result.
      this.throttle(() => {
        let mutated = false
        const commit: typeof this.suggestions = []

        if (oldSelected.length) {
          oldSelected.forEach((selected) => {
            if (selected.name && selected.value && selected.checked) {
              if (!this.suggestions) {
                return
              }

              // Don't include the existing suggestion when it already exists
              // within the updated suggestions.
              const match = this.suggestions.filter(
                (suggestion) =>
                  suggestion.name === selected.name && suggestion.value === selected.value
              )

              if (match.length) {
                return
              }

              // Merge the initial suggestion.
              commit.push({
                checked: true,
                label: selected.label,
                name: selected.name,
                value: selected.value,
                id: selected.id || 'bar'
              })

              mutated = true
            }
          })

          if (this.suggestions && mutated) {
            this.suggestions.push(...commit)
            this.requestUpdate()
          }
        }
      })
    }
  }

  protected handleSlotChange(event: Event): void {
    super.handleSlotChange(event)

    const inputs = Enlightenment.getElements(this, ['input']).filter(
      (input) => input !== this.useContext()
    )

    if (!inputs.length) {
      this.throttle(() => {
        this.requestUpdate()
        this.updatePlaceholder()
      })
    }
  }

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input.hasAttribute('checked') && input.checked) {
      input.setAttribute('checked', '')
    } else if (!input.checked) {
      input.removeAttribute('checked')
    }

    const inputs: HTMLInputElement[] = Enlightenment.getElements(this, ['input'])

    const relatedInputs = inputs.filter((e: HTMLInputElement) => e.name === input.name)

    if (relatedInputs.length) {
      relatedInputs.forEach((relatedInput) => {
        if (!relatedInput.checked) {
          relatedInput.removeAttribute('checked')
        }
      })
    }

    const isSuggested = this.suggested.filter(
      (suggested) => suggested.name === input.name && suggested.value === input.value
    ).length

    // if (isSuggested && !input.checked) {
    //   this.suggested = []

    //   console.log('Test remove')
    // }

    // console.log('Test suggested', isSuggested)

    this.throttle(this.updatePlaceholder, Enlightenment.FPS, {})
  }

  protected handleCurrentElement(target: EventTarget | null): void {
    super.handleCurrentElement(target)

    if (this.currentElement) {
      const y = this.getBoundingClientRect().y

      // Position the dropdown according to the current Viewport.
      this.commit('orientation', () => {
        if (y > window.innerHeight / 2) {
          return 'top'
        } else {
          return 'bottom'
        }
      })
    }

    // Update the additional options defined the options property.
    this.currentElement && this.throttle(this.requestUpdate)
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

    //@todo include more options
    if (this.suggestions && this.suggestions.length) {
      this.suggestions.forEach((suggestion) => {
        const option = document.createElement('option')
        option.name = suggestion.name
        option.value = suggestion.value
        option.id = suggestion.id || Enlightenment.useElementID()
        option.label = suggestion.label
        option.selected = suggestion.checked

        setTimeout(() => {
          if (!this.selected) {
            return
          }

          if (this.shadowRoot) {
            const input = this.shadowRoot.getElementById(suggestion.id) as HTMLInputElement

            //@TODO SHOULD FIX CHECKED RESET
            if (input && input.checked && !suggestion.checked) {
              // input.checked = false
              // console.log('foo', )
              console.log('TEST MERGE', suggestion)
            }
          }

          // const [match] = this.selected.filter(
          //   (selected) => selected.name === suggestion.name && selected.value === suggestion.value
          // )

          // if (match && match.checked !== suggestion.checked) {
          //   console.log('TEST RESET', match, match.checked, suggestion)
          // }

          // console.log(
          //   'test merge 2',
          //   // option.selected,
          //   // suggestion.name,
          //   // suggestion.checked,
          //   // suggestion.value,
          //   match
          // )
        }, 100)

        // console.log('TEST MERGE RENDER DROPDOWN', suggestion.name, suggestion.checked)

        const relatedInputs =
          (this.suggestions || []).filter((s) => s.name === suggestion.name).length +
          (options || []).filter((option) => option.getAttribute('name') === suggestion.name).length

        const type = relatedInputs > 1 ? 'radio' : 'checkbox'

        result.push(this.renderInput(option, type))
      })
    }

    this.throttle(this.updatePlaceholder)

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
    const id = option.id || option.getAttribute('id')

    const value = option.value || option.getAttribute('value')
    const selected = option.selected || option.hasAttribute('selected')
    const label = option.label || option.textContent

    const slot = this.useSlot()
    const initialOption = slot
      ? Enlightenment.getElementsFromSlot(slot, ['option']).includes(option)
      : false

    // if (!initialOption) {
    //   console.log('Test render')
    //   this.suggested.push({ checked, label, name, value })
    // }

    return html`<label class="multiple-select__input-label"
      ><input
        class="multiple-select__input"
        name="${name}"
        id="${id}"
        value="${value}"
        ?initial=${initialOption}
        ?disabled=${disabled}
        ?checked=${selected}
        type="${type || 'checkbox'}"
        @change=${this.handleChange}
        @click=${this.handleMutate}
        @keydown=${this.handleMutate}
      /><span class="multiple-select__input-value">${label}</span></label
    >`
  }

  updatePlaceholder() {
    const context = this.useContext() as HTMLInputElement

    if (context.type !== 'text') {
      return
    }

    this.throttle(() => {
      const selected = Enlightenment.getElements(this, ['input'])
        .filter((input: HTMLInputElement) => input !== context && input.checked)
        .filter((v) => v)

      // console.log('TEST suggested', this.suggested)
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

      this.selected = selected
    })
  }
}
