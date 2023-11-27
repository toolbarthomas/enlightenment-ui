import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Toolbar.scss'

@customElement('ui-toolbar')
class EnlightenmentToolbar extends Enlightenment {
  static styles = [styles]

  // Cache the previous scroll in order to define the current scroll direction.
  previousScrollY?: number

  // Only update if the current width does not match the current value of this.
  previousWidth?: number

  // Element that will match the actual Component height without any fixed
  // position.
  pushContext = createRef()

  @property({ converter: Enlightenment.isInteger, type: Number })
  treshhold: number = 50

  @property({
    converter: Enlightenment.isBoolean,
    type: Boolean
  })
  autohide?: boolean

  connectedCallback() {
    super.connectedCallback()

    this.assignGlobalEvent('scroll', this.handleScroll, { context: window })
    this.assignGlobalEvent('resize', this.handleResize, { context: window })
  }

  public disconnectedCallback(): void {
    this.omitGlobalEvent('scroll', this.handleScroll)
    this.omitGlobalEvent('resize', this.handleResize)

    super.disconnectedCallback()
  }

  protected handleUpdate(name?: string | undefined): void {
    super.handleUpdate(name)

    this.handleResizeCallback(true)
  }

  handleResize(event?: UIEvent) {
    this.throttle(this.handleResizeCallback, 200)
  }

  handleResizeCallback(force?: boolean) {
    const push = this.useRef(this.pushContext)
    const toolbar = this.useRef(this.context) as HTMLElement

    if (!push || !toolbar) {
      return
    }

    const width = window.innerWidth

    if (!force && width === this.previousWidth) {
      return
    }

    toolbar.style.minHeight = ''

    push.style.height = `${toolbar.scrollHeight}px`
    toolbar.style.minHeight = `${toolbar.scrollHeight}px`

    this.previousWidth = width
  }

  handleScroll(event: Event) {
    if (!this.autohide) {
      return
    }

    this.throttle(this.handleScrollCallback)
  }

  handleScrollCallback() {
    const { scrollY, innerHeight } = this.root
    const delta = Math.abs(this.previousScrollY - scrollY)

    if (scrollY >= innerHeight && delta >= this.treshhold) {
      this.ariaHidden = 'true'
    } else if (delta >= this.treshhold) {
      this.ariaHidden = 'false'
    }

    if (this.previousScrollY && this.previousScrollY > scrollY && delta > this.treshhold) {
      this.ariaHidden = 'false'
    }

    this.previousScrollY = scrollY
  }

  render() {
    const classes = ['toolbar']

    return html`
      <div ref="${ref(this.context)}" class="toolbar">
        <div class="toolbar__wrapper">
          <slot></slot>
        </div>
      </div>
      <div class="toolbar__push" ref="${ref(this.pushContext)}"></div>
    `
  }
}
