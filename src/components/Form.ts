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

  static inputElements = ['button', 'input', 'select', 'textarea']

  initialFormData: [[HTMLElement, any]] = []

  enableDocumentEvents: boolean

  afterChange() {
    const slot = this.useSlot()

    slot &&
      Enlightenment.getElementsFromSlot(slot, ['input', 'select', 'textarea']).forEach(
        (element) => {
          console.log('After change', element)
        }
      )
  }

  handleChange(event: InputEvent) {
    this.throttle(this.afterChange, Enlightenment.FPS)
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

    console.log('Submit')
  }

  protected assignInputEvent(
    context: HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) {
    const host = Enlightenment.useHost(context) as HTMLInputElement

    if (context.type === 'submit' || (host && host.getAttribute('type') === 'submit')) {
      console.log('Assign', context)
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

  handleSlotChangeCallback() {}

  protected handleSlotChange(event: Event): void {
    super.handleSlotChange()

    const slot = this.useSlot()

    slot &&
      Enlightenment.getElementsFromSlot(slot, ['button', 'input', 'select', 'textarea']).forEach(
        (element) => {
          this.assignInputEvent(element)

          if (!this.initialFormData.filter(([e]) => e === element).length) {
            let initialValue: any

            if (['checkbox', 'radio'].includes(element.type)) {
              initialValue = element.checked
            } else if (!['reset', 'submit', 'button'].includes(element.type)) {
              initialValue = element.value
            }

            if (initialValue !== undefined) {
              this.initialFormData.push([element, initialValue])
            }
          }
        }
      )

    // this.assignInputElements(event.target as HTMLSlotElement)

    // // Update the found input element during a slotchange within the actual
    // // form slot.
    // Object.values(this.inputs).forEach((input) => {
    //   this.clearGlobalEvent('slotchange', Enlightenment.useHost(input))
    //   this.assignGlobalEvent(
    //     'slotchange',
    //     () => {
    //       this.throttle(
    //         this.assignInputElements,
    //         Enlightenment.FPS,
    //         event.target as HTMLSlotElement
    //       )
    //     },
    //     Enlightenment.useHost(input)
    //   )
    // })

    // this.assignInputEvents(event.target)
  }

  render() {
    const classes = ['form']

    return html` <form ref=${ref(this.context)} @submit=${this.handleSubmit}><slot></slot></form> `
  }
}
