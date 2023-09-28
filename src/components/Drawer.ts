import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Drawer.scss'

@customElement('ui-drawer')
class EnlightenmentDrawer extends Enlightenment {
  static styles = [styles]

  enableDocumentEvents = true
  ready?: boolean = false

  @property({
    attribute: 'active',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isActive?: string | null

  @property({
    attribute: 'floating',
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  isFloating?: boolean

  // Prevent the hide command during an exit keycommand or when clicking outside
  // the defined Drawer context.
  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  strict?: boolean

  @property({
    converter: Enlightenment.convertToSelectors,
    type: Array
  })
  toggles?: HTMLElement[]

  @property({
    type: String
  })
  label?: boolean

  @property({
    attribute: 'offset-element',
    converter: (value: any) => Enlightenment.convertToSelectors(value)[0],
    type: HTMLElement
  })
  offsetElement?: HTMLElement

  @property({
    reflect: true,
    type: String
  })
  position = 'left'

  private _defineOffset() {
    if (!this.offsetElement) {
      return
    }

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    if (
      this.offsetElement.getAttribute('aria-hidden') === 'false' ||
      !this.offsetElement.hasAttribute('aria-hidden')
    ) {
      context.style.paddingTop = `${this.offsetElement.offsetHeight}px`
    } else {
      context.style.paddingTop = '0px'
    }
  }

  private _renderLabel() {
    if (!this.label) {
      return
    }

    return html`
      <header class="drawer__panel-header">
        <span class="drawer__label">${this.label}</span>
      </header>
    `
  }

  updated(properties: any) {
    super.updated(properties)

    this._defineOffset()

    // Will mark the defined Drawer as active and ensure the currentElement
    // property is updated.
    if (this.isActive) {
      this.commit('currentElement', this.isActive)
    }

    // Public property that can be used within the process method for other
    // components like the Toggler.
    this.ariaHidden = String(!this.isActive)

    const state = this.useState()

    this.throttle(() => {
      if (state && state.currentElements.filter((c) => c instanceof EnlightenmentDrawer).length) {
        document.body.classList.add('body--drawer-is-active')
      } else {
        document.body.classList.remove('body--drawer-is-active')
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('resize', this.handleResize, window)
    this.assignGlobalEvent('scroll', this.handleScroll, window)
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.clearGlobalEvent('resize', [this, window])
  }

  handleResize() {
    this.throttle(() => this._defineOffset())
  }

  handleScroll() {
    this.handleResize()
  }

  protected handleGlobalClick(event: MouseEvent) {
    super.handleGlobalClick(event)

    const state = this.useState()

    const target = event.target as HTMLElement

    let ignore = false
    // if (target) {
    //   let observe: Enlightenment['observe'] = target.observe

    //   if (!observe && !this.isComponentContext(target)) {
    //     console.log('Try again', this.isComponentContext(target))

    //     let hasParent = false
    //     let current = target

    //     while (current.parentNode && !hasParent) {
    //       if (current.shadowRoot && current.shadowRoot.host && current.shadowRoot.host.observe) {
    //         observe = current.shadowRoot.host.observe
    //         hasParent = true
    //       } else if (current.tagName === this.tagName) {
    //         //@todo Should do explicit compare
    //         break
    //       }

    //       current = current.parentNode
    //     }
    //   }

    //   ignore = Object.values(observe || {}).includes(this)
    // }

    // console.log('ignore?', ignore)

    if (!this.strict && !this.isComponentContext(target) && !ignore) {
      this.hide()
    }

    if (
      !ignore &&
      this.toggles &&
      (this.toggles.includes(target) ||
        this.toggles.filter((e) => target && e.contains(target)).length)
    ) {
      if (this.isActive) {
        this.hide()
      } else {
        this.show()
      }
    }
  }

  protected handleGlobalKeydown(event: KeyboardEvent) {
    super.handleGlobalKeydown(event)

    const { keyCode } = event

    if (!this.strict && Enlightenment.keyCodes.exit.includes(keyCode)) {
      this.hide()
    }
  }

  hide() {
    this.commit('isActive', false)
  }

  show() {
    this.commit('isActive', true)
  }

  render() {
    const classes = ['drawer']

    if (this.position) {
      classes.push(`drawer--align-from-${this.position}`)
    }

    if (this.isActive) {
      classes.push('drawer--is-active')
    }

    if (this.isFloating) {
      classes.push('drawer--is-floating')
    }

    if (this.strict) {
      classes.push('drawer--is-strict')
    }

    return html`
      <focus-trap ?active=${this.isActive} containers="${this.getAttribute('toggles')}">
        <div ref="${ref(this.context)}" class="${classes.join(' ')}">
          <div class="drawer__panel">
            ${this._renderLabel()}
            <div class="drawer__body">
              <slot></slot>
            </div>
          </div>
        </div>
        <span class="drawer-backdrop"></span>
      </focus-trap>
    `
  }
}
