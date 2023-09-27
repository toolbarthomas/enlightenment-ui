import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Form.scss'

@customElement('ui-form')
class EnlightenmenForm extends Enlightenment {
  static styles = [styles]

  raw: [[HTMLElement, any]] = []
  inputs: HTMLInputElement[] = []

  enableDocumentEvents: boolean

  handleChange(event: InputEvent) {
    const target: HTMLInputElement = event.target

    if (!target) {
      return
    }

    const [exists] = this.raw
      .map(([element], index) => (element === event.target ? index : undefined))
      .filter((index) => index !== undefined)

    let value = target.value

    if (['radio', 'checkbox'].includes(target.type)) {
      value = target.checked
    }

    if (exists !== undefined) {
      this.raw[exists] = [target, value]
    } else {
      this.raw.push([target, value])
    }
  }

  handleKeydown(event: KeyboardEvent) {
    const { keyCode } = event

    if (!keyCode) {
      return
    }

    if (keyCode === 13) {
      this.handleSubmit(event)
      return
    }

    if (Enlightenment.keyCodes.meta.includes(keyCode)) {
      return
    }

    const input: any = event.target

    if (input.disabled) {
      return
    }

    this.throttle(() => {
      if (input.previousValue !== input.value) {
        input.previousValue = input.value

        this.throttle(this.handleChange, Enlightenment.FPS, event)
      }
    })
  }

  /**
   * Dispatch the Reset event to the actual form element
   * @param event
   */
  handleReset(event: Event) {
    this.hook('reset', { bubbles: true })
  }

  handleSubmit(event: Event) {
    event.preventDefault()

    const input: HTMLInputElement = event.target

    if (input.tagName === 'INPUT' && input.type !== 'submit') {
      if (!input.value) {
        return
      }
    }
  }

  protected assignInputEvent(
    context: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) {
    if (context.shadowRoot) {
      this.assignInputEvents(context.shadowRoot)

      return
    }

    const host = Enlightenment.useHost(context) as HTMLInputElement

    if (context.type === 'submit' || (host && host.getAttribute('type') === 'submit')) {
      this.clearGlobalEvent('click', context)
      this.assignGlobalEvent('click', this.handleSubmit, context)

      return
    }

    if (context.type === 'reset') {
      this.clearGlobalEvent('click', context)
      this.assignGlobalEvent('click', this.handleReset, context)

      return
    }

    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(context.tagName)) {
      this.clearGlobalEvent('change', context)
      this.assignGlobalEvent('change', this.handleChange, context)

      // Trigger an initial Change event to ensure the initial Raw Form data is
      // defined
      this.hook('change', { context })

      if (context.type === 'radio' || context.type === 'checkbox') {
        return
      }

      this.clearGlobalEvent('keydown', context)
      this.assignGlobalEvent('keydown', this.handleKeydown, context)
    }
  }

  protected assignInputEvents(ctx: HTMLSlotElement | ShadowRoot) {
    const selectors = ['input', 'button', 'textarea', 'select', '*[type=submit]']

    const elements = ctx.assignedElements
      ? (ctx as HTMLSlotElement).assignedElements()
      : (ctx as ShadowRoot).querySelectorAll(selectors.join(','))

    if (!elements.length) {
      return
    }

    // only div
    for (let i = elements.length; i--; ) {
      if (selectors.includes(elements[i].tagName.toLowerCase())) {
        this.assignInputEvent(elements[i])
        continue
      }

      const context = elements[i].shadowRoot ? elements[i].shadowRoot : elements[i]
      const sets = context.querySelectorAll(selectors.join(','))

      if (sets.length) {
        Object.values(sets).forEach((element) => this.assignInputEvent(element))
      }
    }
  }

  getElements(context: Element, tags: string[], elements: HTMLElement[]) {
    if (!context) {
      return
    }

    if (context.shadowRoot) {
      Object.values(context.shadowRoot.children).forEach((child) =>
        this.getElements(child, tags, elements)
      )
    }

    if (tags.includes(context.tagName.toLowerCase()) && !elements.includes(context)) {
      console.log(
        'TEST',
        context,
        this.contains(context),
        Enlightenment.useHost(context)?.contains(context)
      )

      elements.push(context)
    }

    if (context.children) {
      Object.values(context.children).forEach((child) => this.getElements(child, tags, elements))
    }

    // console.log('bar', this.contains(context), context)

    // return [...new Set(elements)]
  }

  handleSlotChangeCallback() {}

  protected assignInputElements(slot: HTMLSlotElement) {
    this.inputs = []

    if (slot.assignedElements) {
      slot
        .assignedElements()
        .forEach((element) => this.getElements(element, ['input', 'button'], this.inputs))
    }
  }

  protected handleSlotChange(event: Event): void {
    super.handleSlotChange()

    this.assignInputElements(event.target as HTMLSlotElement)

    // Update the found input element during a slotchange within the actual
    // form slot.
    Object.values(this.inputs).forEach((input) => {
      this.clearGlobalEvent('slotchange', Enlightenment.useHost(input))
      this.assignGlobalEvent(
        'slotchange',
        () => {
          this.throttle(
            this.assignInputElements,
            Enlightenment.FPS,
            event.target as HTMLSlotElement
          )
        },
        Enlightenment.useHost(input)
      )
    })

    this.assignInputEvents(event.target)
  }

  render() {
    const classes = ['form']

    return html` <form ref=${ref(this.context)} @submit=${this.handleSubmit}><slot></slot></form> `
  }
}
