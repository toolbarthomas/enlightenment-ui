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
import { EnlightenmentDataEntry } from '@toolbarthomas/enlightenment/src/_types/main'

@customElement('ui-textfield')
class EnlightenmentTextfield extends Enlightenment {
  static styles = [styles]

  static a11y = {
    clear: 'Clear',
    copy: 'Copy',
    search: 'Search'
  }

  @property({
    converter: (value: string) => value.split(',').map((v) => v.toLowerCase()),
    type: Array
  })
  actions: string[] = []

  @property({ type: String })
  label?: string

  @property({ type: String })
  id?: string = Enlightenment.useElementID()

  @property({
    type: String
  })
  size?: String

  @property({
    type: String,
    converter: (value) => Enlightenment.filterProperty(value, ['text', 'password'])
  })
  type = 'text'

  @property({ type: String })
  value?: string

  @property({ type: String })
  name?: string

  @property({ type: String })
  placeholder?: string

  @property({
    converter: (value) =>
      Enlightenment.parseJSON(value, (suggestion: EnlightenmentDataEntry) => {
        if (typeof suggestion === 'string') {
          return suggestion
        }

        return suggestion.title
      }),
    type: Array
  })
  suggestions: EnlightenmentDataEntry[] = []

  handleAction(event: Event) {
    if (!event) {
      return
    }

    const target = event.target as HTMLElement

    if (target instanceof HTMLElement) {
      target.classList.add('textfield__action--is-selected')
      // console.log('Is target')
    }
  }

  handleActionSelectionCallback(event: Event) {
    if (!event) {
      return
    }
    const target = event.target as HTMLElement

    if (target instanceof HTMLElement === false) {
      return
    }

    target.classList.remove('textfield__action--is-selected')

    console.log('Transition ended')
  }

  handleChange(event: Event) {
    if (!event || !event.target) {
      return
    }

    this.throttle(this.updateValue)
  }

  handleClear(event: Event) {
    if (this.disabled || this.preventEvent) {
      return
    }

    if (event && event.preventDefault) {
      event.preventDefault()
    }

    this.handleAction(event)

    const context = this.useContext() as HTMLInputElement

    if (!context || !context.value || !context.value.length) {
      return
    }

    context.value = ''
    this.hook('change', { context })
  }

  handleCopy(event: Event) {
    if (this.preventEvent) {
      return
    }

    this.handleAction(event)

    if (event && event.preventDefault) {
      event.preventDefault()
    }

    if (this.type === 'password') {
      return
    }

    const context = this.useContext() as HTMLInputElement

    if (!context || !context.value || !context.value.length) {
      return
    }

    context.select()
    context.setSelectionRange(0, context.value.length)

    navigator.clipboard.writeText(context.value)

    context.setSelectionRange(context.value.length, context.value.length)
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

    const context = this.useContext()

    this.throttle(this.hook, Enlightenment.FPS, 'change', { context })
  }

  handleSearch(event: Event) {
    if (this.disabled || this.preventEvent) {
      return
    }

    const form = this.findParentElement('form')

    if (!form) {
      this.log('Unable to search from undefined form', 'warning')

      return
    }

    this.handleAction(event)

    this.hook('submit', { context: form })
  }

  handleSuggestion(event: Event) {
    if (!event) {
      return
    }

    event.preventDefault()

    const context = this.useContext() as HTMLInputElement
    if (!context) {
      return
    }

    const target = event.target as Element

    if (!target || !target.textContent || !target.textContent.trim()) {
      return
    }

    context.value = target.textContent.trim()

    this.hook('change', { context })

    context.focus()
  }

  render() {
    const classes = ['textfield']

    if (this.value) {
      classes.push('textfield--has-value')
    }

    if (this.suggestions.length && this.type !== 'password') {
      classes.push('textfield--has-suggestions')
    }

    if (this.size) {
      classes.push('textfield--has-size')
    }

    return html`<div class="${classes.join(' ')}">
      <div class="textfield__label-wrapper">${this.renderLabel()}</div>
      <div class="textfield__body">
        <div class="textfield__input-wrapper">
          <input
            ?disabled=${this.disabled || this.busy}
            ?value=${this.value}
            @change=${this.handleChange}
            @keydown=${this.handleKeydown}
            class="textfield__input"
            id=${this.id}
            name=${this.name}
            placeholder=${this.placeholder}
            ref="{${ref(this.context)}}"
            size="${this.size}"
            type="${this.type}"
            value="${this.value}"
          />
          ${this.renderActions()} ${this.renderIndicator()}
        </div>
        ${this.renderSuggestions()}
      </div>
    </div>`
  }

  renderActions() {
    const { actions } = this.slots

    return html`<div class="textfield__actions">
      ${this.renderCopy()} ${this.renderClear()} ${this.renderSearch()}
      <slot name="actions"></slot>
    </div>`
  }

  renderClear() {
    if (!this.actions.includes('clear')) {
      return nothing
    }

    return html`<button
      class="textfield__action textfield__clear"
      type="button"
      @click="${this.handleClear}"
      @animationend="${this.handleActionSelectionCallback}"
    >
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.clear}</span>
      <span class="textfield__clear-icon" aria-focusable="false" aria-hidden="true"></span>
    </button>`
  }

  renderCopy() {
    if (!this.actions.includes('copy')) {
      return nothing
    }

    return html`<button
      class="textfield__action textfield__copy"
      type="button"
      @click="${this.handleCopy}"
      @animationend=${this.handleActionSelectionCallback}
    >
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.copy}</span>
      <span class="textfield__copy-icon" aria-focusable="false" aria-hidden="true"></span>
    </button>`
  }

  renderIndicator() {
    return html`<span class="textfield__indicator"></span>`
  }

  renderSearch() {
    if (!this.actions.includes('search')) {
      return nothing
    }
    console.log('Render search')

    return html`<button
      class="textfield__action textfield__search"
      type="submit"
      @click="${this.handleSearch}"
      @animationend="${this.handleActionSelectionCallback}"
    >
      <span class="textfield__action-label">${EnlightenmentTextfield.a11y.search}</span>
      <span class="textfield__search-icon" aria-focusable="false" aria-hidden="true"></span>
    </button>`
  }

  renderSuggestions() {
    if (!this.suggestions.length || this.type === 'password') {
      return nothing
    }

    const context = this.useContext() as HTMLInputElement

    const suggestions = this.suggestions.map((suggestion) => {
      if (context && suggestion === context.value) {
        return nothing
      }

      return html`<li class="textfield__suggestions-item">
        <button @click="${this.handleSuggestion}" class="textfield__suggestions-item-button">
          ${suggestion}
        </button>
      </li>`
    })

    return html`<div class="textfield__suggestions">
      <ul class="textfield__suggestions-items">
        ${suggestions}
      </ul>
    </div>`
  }

  renderLabel() {
    const slot = this.useSlot()

    return this.label
      ? html`<label class="textfield__label" for="${this.id}">${this.label}</label>`
      : html`<slot></slot>`
  }

  updateValue() {
    const context = this.useContext() as HTMLInputElement

    if (context && context.value !== this.value) {
      this.commit('value', context.value)
      if (this.type !== 'password') {
        this.setAttribute('value', context.value)
      }
    } else if (!context.value) {
      this.commit('value', '')
    }

    if (!this.value) {
      this.removeAttribute('value')
    }

    this.hook('change')
  }
}
