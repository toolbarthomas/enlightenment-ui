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
  checked?: boolean
  disabled?: boolean
  id?: string
  label?: string
  name: string
  value: string
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

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  indicator?: boolean

  // Defines the dropdown orientation when collapsed.
  orientation?: string = 'bottom'

  @property({ type: Array })
  selected: HTMLInputElement[] = []

  // Reference to the rendered dropdown containter.
  dropdownContext = createRef()

  // Reference to the rendered selected options container.
  selectedContext = createRef()

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
          const { checked, disabled, id, label, name, value } = suggestion || {}

          return {
            disabled,
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

  /**
   * Merge the previously defined suggestions that are checked. This enables
   * the usage of autosuggest since the suggestions can be updated while the
   * component is running. See the MultipleSelectSuggestion Typing for
   * expected Object structure. Keep in mind that unchecked options are removed
   * after the suggestions attribute has been updated.
   *
   * @param name The named attribute that has changed
   * @param _old The previous defined value of the mutated attribute.
   * @param value The new value of the mutated attribute.
   */
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
              disabled: selected.disabled,
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
                disabled: selected.disabled,
                label: selected.label,
                name: selected.name,
                value: selected.value,
                id: selected.id || 'bar'
              })

              mutated = true
            }
          })

          if (this.suggestions && mutated) {
            this.suggestions = [...commit, ...this.suggestions]

            // this.suggestions.push(...commit)
            this.requestUpdate()
          }
        }
      })
    }
  }

  /**
   * Validates the initial Slotted Elements and update the current selection
   * from their initial checked/selected state.
   *
   * @param event Custom Event constructed within the component context.
   */
  protected handleSlotChange(event: Event): void {
    super.handleSlotChange(event)

    const inputs = Enlightenment.getElements(this, ['input']).filter(
      (input) => input !== this.useContext()
    )

    if (!inputs.length) {
      this.throttle(this.requestUpdate)
    } else {
      this.throttle(this.updateSelected)
    }
  }

  /**
   * Callback handler during a selection change within the dropdown.
   *
   * @param event Expected Change Event handler.
   */
  handleChange(event: Event) {
    const input = event.target as HTMLInputElement

    if (!input.hasAttribute('checked') && input.checked) {
      input.setAttribute('checked', '')
    } else if (!input.checked) {
      input.removeAttribute('checked')
    }

    const inputs: HTMLInputElement[] = Enlightenment.getElements(this, ['input'])

    // Ensures related radio elements can only have one active selection.
    const relatedInputs = inputs.filter((e: HTMLInputElement) => e.name === input.name)
    if (relatedInputs.length) {
      relatedInputs.forEach((relatedInput) => {
        if (!relatedInput.checked) {
          relatedInput.removeAttribute('checked')
        }
      })
    }

    this.throttle(this.updateSelected)
  }

  /**
   * Use the currentElement attribute to expand or collapse the dropdown.
   *
   * @param target Check if the defined context exists within the component.
   */
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

    const dropdownContext = this.useRef(this.dropdownContext) as HTMLElement

    if (dropdownContext) {
      dropdownContext.setAttribute('aria-hidden', `${this.currentElement ? 'false' : 'true'}`)
    }

    // Update the additional options defined the options property.
    this.currentElement && this.throttle(this.requestUpdate)
  }

  /**
   * Callback handler that should trigger a change Event during a DOM mutation.
   * This also enables the deselection for Radio elements since they cannot be
   * unchecked.
   *
   * @param event The expected Click or Keyboard Event handler.
   */
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

  toggleSelected(event: Event, input: HTMLInputElement) {
    if (!input) {
      return
    }

    if (event && event.preventDefault) {
      event.preventDefault()
    }

    input.checked = !input.checked

    this.hook('change', { context: input })
  }

  /**
   * Helper function that should return the required values for an existing
   * option.
   *
   * @param context Defines the required properties from the given context.
   */
  getOptionAttributes(context: HTMLInputElement | HTMLOptionElement) {
    if (!context) {
      return {}
    }

    const parent = context.closest('label') ? context.closest('label') : context.parentElement

    const id = context.id || context.getAttribute('id')
    const name = context.name || context.getAttribute('name')
    const value = context.value || context.getAttribute('value')
    const disabled = context.disabled || context.hasAttribute('disabled')

    const checked =
      (context as HTMLInputElement).checked ||
      Enlightenment.isBoolean(context.getAttribute('checked')) ||
      false

    const selected =
      (context as HTMLOptionElement).selected ||
      Enlightenment.isBoolean(context.getAttribute('selected')) ||
      false

    const textContent = parent ? parent.textContent : name
    const label = context.getAttribute('label') || context.textContent || textContent

    return { checked, disabled, id, label, name, selected, value }
  }

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

  /**
   * Renders the dropdown container that should contain the initial options and
   * optional suggestions.
   */
  renderDropdown() {
    const slot = this.useSlot()

    if (!slot) {
      return nothing
    }

    const options = Enlightenment.getElementsFromSlot(slot, ['option']) as HTMLOptionElement[]

    const result = options.map((option) => {
      const { name } = this.getOptionAttributes(option)

      const type =
        options.filter((opt) => this.getOptionAttributes(opt).name === name).length > 1
          ? 'radio'
          : 'checkbox'

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
        option.disabled = suggestion.disabled

        // setTimeout(() => {
        //   if (!this.selected) {
        //     return
        //   }

        //   if (this.shadowRoot) {
        //     const input = this.shadowRoot.getElementById(suggestion.id) as HTMLInputElement

        //     //@TODO SHOULD FIX CHECKED RESET
        //     if (input && input.checked && !suggestion.checked) {
        //       // input.checked = false
        //       // console.log('foo', )
        //       console.log('TEST MERGE', suggestion)
        //     }
        //   }

        //   // const [match] = this.selected.filter(
        //   //   (selected) => selected.name === suggestion.name && selected.value === suggestion.value
        //   // )

        //   // if (match && match.checked !== suggestion.checked) {
        //   //   console.log('TEST RESET', match, match.checked, suggestion)
        //   // }

        //   // console.log(
        //   //   'test merge 2',
        //   //   // option.selected,
        //   //   // suggestion.name,
        //   //   // suggestion.checked,
        //   //   // suggestion.value,
        //   //   match
        //   // )
        // }, 100)

        // console.log('TEST MERGE RENDER DROPDOWN', suggestion.name, suggestion.checked)

        const relatedInputs =
          (this.suggestions || []).filter((s) => s.name === suggestion.name).length +
          (options || []).filter(
            (option) => this.getOptionAttributes(option).name === suggestion.name
          ).length

        const type = relatedInputs > 1 ? 'radio' : 'checkbox'

        result.push(this.renderInput(option, type))
      })
    }

    return html`<div class="multiple-select__dropdown" ref="${ref(this.dropdownContext)}">
      ${result || nothing}
    </div>`
  }

  /**
   * Renders the placeholder element that displays the selected elements without
   * the need of collapsing the dropdown.
   */
  renderPlaceholder() {
    return html`
      <div class="multiple-select__placeholder">
        <input
          class="multiple-select__placeholder-input"
          ref="${ref(this.context)}"
          type="text"
          value="${this.placeholder}"
        />
        ${this.renderSelected()}
      </div>
    `
  }

  /**
   * Renders the visual element of a selected option when the [indicator]
   * property is TRUE.
   */
  renderSelected() {
    if (!this.indicator) {
      return
    }

    const body = this.selected
      ? this.selected.map((selected) => {
          const { disabled, label, id, name, value } = this.getOptionAttributes(selected)

          const body = html`<span class="multiple-select__selected-option-label">${label}</span>`

          if (disabled) {
            return html`<span class="multiple-select__selected-option">${body}</span>`
          }

          return html`<button
            class="multiple-select__selected-option"
            aria-hidden="true"
            aria-focusable="false"
            @click="${(event: Event) => this.toggleSelected(event, selected)}"
          >
            ${body}
          </button>`
        })
      : nothing

    return html`<div class="multiple-select__selected" ref="${ref(this.selectedContext)}">
      <div class="multiple-select__selected-options">${body}</div>
    </div>`
  }

  /**
   * Renders a single selection input as checkbox or radiobutton.
   *
   * @param option Use the defined input attribute values.
   * @param type Renders the input as checkbox or radiobutton.
   */
  renderInput(option: HTMLOptionElement, type?: string) {
    if (!option) {
      return nothing
    }

    const { disabled, name, id, value, selected, label } = this.getOptionAttributes(option)

    // Mark the options defined within the element directly as initialOption.
    // These options will always be rendered with the optional suggestions.
    const slot = this.useSlot()
    const initialOption = slot
      ? Enlightenment.getElementsFromSlot(slot, ['option']).includes(option)
      : false

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

  resizeSelected() {
    const selectedContext = this.useRef(this.selectedContext) as HTMLElement

    if (!selectedContext) {
      return
    }

    // Updates the visible height of the selected options container.
    if (selectedContext && selectedContext.firstElementChild) {
      if (selectedContext.firstElementChild.scrollHeight) {
        selectedContext.style.height = `${selectedContext.firstElementChild.scrollHeight}px`
      } else {
        selectedContext.removeAttribute('style')
      }
    } else {
      selectedContext.style.height = `auto`
    }
  }

  protected updated(properties: Map<any>): void {
    super.updated(properties)

    if (properties.has('selected')) {
      this.resizeSelected()
    }
  }

  /**
   * Collect all checked input selections and update the readable placeholder.
   */
  updateSelected() {
    const context = this.useContext() as HTMLInputElement

    const selected = Enlightenment.getElements(this, ['input'])
      .filter((input: HTMLInputElement) =>
        context && input !== context && input.checked ? input : !context ? input : null
      )
      .filter((v) => v)
    // console.log('TEST suggested', this.suggested)
    const values = selected.map((input) => {
      if (input.checked) {
        const { name, label, value } = this.getOptionAttributes(input)

        return label || name || value
      }
    })

    this.placeholder = values.join(', ')

    // Ensure the current value is used for the optional placeholder input.
    if (context && context.value !== undefined) {
      context.value = this.placeholder
    }

    this.commit('selected', selected)
  }
}
