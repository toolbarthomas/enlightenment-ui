import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'
import { EnligtenmentTarget } from '@toolbarthomas/enlightenment/src/_types/main'

import styles from './Modal.scss'

@customElement('ui-modal')
class EnlightenmentModal extends Enlightenment {
  static styles = [styles]

  bodyContext = createRef()
  enableDocumentEvents = true
  wrapperContext = createRef()
  panelContext = createRef()

  hasOverflow?: boolean = false
  isSticky?: boolean = false

  @property({
    type: String
  })
  label?: string

  @property({
    type: String
  })
  position = 'center'

  @property({
    attribute: 'active',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isActive?: boolean

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isFullscreen?: boolean

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  strict?: boolean = true

  header?: ReturnType<typeof html>

  protected firstUpdated(properties: any) {
    super.firstUpdated(properties)

    const body = this.useRef(this.bodyContext)
    body &&
      this.assignGlobalEvent(
        'scroll',
        (event: Event) => this.throttle(this.handleScroll, Enlightenment.FPS, event, body),
        { context: body }
      )

    const wrapper = this.useRef(this.wrapperContext)
    wrapper &&
      this.assignGlobalEvent(
        'scroll',
        (event: Event) => this.throttle(this.handleScroll, Enlightenment.FPS, event, wrapper),
        { context: wrapper }
      )
  }

  protected handleClick(event: Event) {
    const { target } = event || {}

    const wrapper = this.useRef(this.wrapperContext)
    if (target && target === wrapper && !this.strict) {
      this.close()
    }
  }

  protected handleGlobalClick(event: MouseEvent): void {
    super.handleGlobalClick(event)

    const { target } = event

    if (this.currentElement) {
    } else {
      this.commit('isActive', !this.isActive)
    }
  }

  protected handleGlobalKeydown(event: KeyboardEvent) {
    const { keyCode } = event || {}

    if (Enlightenment.keyCodes.exit.includes(keyCode)) {
      this.close()
    }
  }

  protected handleResize(event: Event) {
    this.handleScroll(event, this.useRef(this.wrapperContext))
    this.handleScroll(event, this.useRef(this.bodyContext))

    this.hook('resize')
  }

  protected handleScroll(event: Event, target?: EnligtenmentTarget) {
    if (!target) {
      return
    }

    const body = this.useRef(this.bodyContext) as HTMLElement
    const panel = this.useRef(this.panelContext) as HTMLElement
    const wrapper = this.useRef(this.wrapperContext) as HTMLElement

    switch (target) {
      case wrapper:
        if (!wrapper) {
          return
        }

        const { paddingTop } = getComputedStyle(wrapper) || {}

        if (!paddingTop) {
          return
        }

        const offset = parseFloat(paddingTop.replace('px', ''))

        if (isNaN(offset)) {
          return
        }

        this.throttle(() =>
          this.commit('isSticky', () => {
            if (wrapper.scrollTop > offset) {
              return true
            }

            return false
          })
        )

        break

      default:
        this.commit('hasOverflow', () => {
          if (body && body.scrollTop) {
            return true
          } else {
            return false
          }
        })

        break
    }

    this.hook('scroll')
  }

  protected updated(properties: any) {
    super.updated(properties)

    this.handleCurrentElement(this.isActive ? this : null)
  }

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent(
      'resize',
      (event: UIEvent) => this.throttle(this.handleResize, Enlightenment.FPS, event),
      { context: window }
    )
  }

  disconnectedCallback() {
    this.clearGlobalEvent('resize', window)
    this.clearGlobalEvent('scroll', this.useRef(this.bodyContext))
    this.clearGlobalEvent('scroll', this.useRef(this.wrapperContext))

    super.disconnectedCallback()
  }

  close() {
    this.commit('isActive', false)
  }

  open() {
    this.commit('isActive', true)
  }

  render() {
    const classes = []

    if (this.isActive) {
      classes.push('modal--is-active')
    }

    if (this.isSticky && !this.isFullscreen) {
      classes.push('modal--is-sticky')
    } else if (this.isFullscreen) {
      classes.push('modal--is-fullscreen')
    }

    if (this.position) {
      classes.push(`modal--align-from-${this.position}`)
    }

    return html`
      <focus-trap ?active=${this.isActive}>
        <div
          ${ref(this.context)}
          class="modal ${classes.join(' ')}"
          aria-hidden="${String(!this.isActive)}"
          aria-disabled="${String(!this.isActive)}"
          @click=${this.handleClick}
        >
          <div class="modal__wrapper" ${ref(this.wrapperContext)}>
            <div
              class="modal__panel ${this.isSticky ? 'modal__panel--is-sticky' : ''}"
              ${ref(this.panelContext)}
            >
              ${this.renderHeader()}
              <section class="modal__panel-body" ${ref(this.bodyContext)}>
                <slot></slot>
              </section>
              <footer class="modal__panel-footer">
                <slot name="footer"></slot>
              </footer>
            </div>
          </div>
        </div>
      </focus-trap>
    `
  }

  renderHeader() {
    return html`
      <header class="modal__panel-header">
        <slot name="header">${this.renderLabel(this.label)}</slot>
      </header>
    `
  }

  renderLabel(value?: string) {
    return value ? html`<span class="modal__header-label">${value}</span>` : nothing
  }
}
