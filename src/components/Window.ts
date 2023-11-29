import {
  createRef,
  customElement,
  Enlightenment,
  html,
  nothing,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import styles from './Window.scss'

@customElement('ui-window')
class EnlightenmentWindow extends Enlightenment {
  static styles = [styles]

  // Enable the usage of currentElement.
  enableDocumentEvents: boolean = true

  // Actual x position for the context Element.
  currentX?: number

  // Actual y position for the context Element.
  currentY?: number

  // Will be TRUE when the drag action is currently used.
  dragActive?: boolean

  // Defined Animation request that should render the current context position.
  dragRequest?: number

  // Keep track of the last edge that was interacted with.
  edgeX?: string
  edgeY?: string

  // Previous left position of the defined context Element.
  previousX?: number

  // Previous top position of the defined context Element.
  previousY?: number

  // Current defined X position of the used Pointer.
  pointerX?: number

  // Current defined Y position of the used Pointer.
  pointerY?: number

  // Delays the actual drag action.
  treshhold: number = 0

  @property({
    converter: (value) => Enlightenment.filterProperty(value, ['left', 'right']),
    type: String
  })
  controls?: string = 'left'

  @property({ type: String })
  title?: string

  @property({
    reflect: true,
    converter: (value) => Enlightenment.filterProperty(value, ['primary', 'secondary']),
    type: String
  })
  type?: string = 'primary'

  @property({ converter: Enlightenment.isInteger, type: Number })
  views?: number = 1

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  fullscreen?: boolean = false

  public connectedCallback(): void {
    super.connectedCallback()
  }

  handleDragEnd(event?: MouseEvent) {
    this.dragRequest && cancelAnimationFrame(this.dragRequest)

    if (this.dragActive) {
      const context = this.useContext() as HTMLElement

      if (this.fullscreen) {
        this.commit('fullscreen', false)

        return this.handleDragEnd()
      }

      if (context) {
        this.dragRequest && cancelAnimationFrame(this.dragRequest)

        const [x, y] = Enlightenment.parseMatrix(context.style.transform)

        context.style.transform = ''
        context.style.top = `${Math.round(this.currentY + y)}px`
        context.style.left = `${Math.round(this.currentX + x)}px`

        this.currentX += x
        this.currentY += y

        if (this.currentX >= window.innerWidth) {
          console.log('RESET RIGHT')
        } else if (this.currentX + context.offsetWidth < 0) {
          console.log('RESET LEFT')
        }

        if (this.currentY + context.offsetHeight < 0) {
          console.log('REST TOP')
        } else if (this.currentY > window.innerHeight) {
          console.log('REST BOTTOM')
        }

        this.treshhold = 0
      }
    }

    this.dragActive = false

    this.omitGlobalEvent('mousemove', this.handleDragUpdate)
    this.omitGlobalEvent('mouseup', this.handleDragEnd)
    this.omitGlobalEvent('touchend', this.handleDragEnd)
  }

  handleDragUpdate(event?: MouseEvent) {
    const context = this.useContext() as HTMLElement

    if (!event || !this.dragActive || !context) {
      return
    }

    if (this.dragRequest) {
      cancelAnimationFrame(this.dragRequest)
    }

    this.treshhold += 1

    // Delay the drag action while fullscreen is active.
    if (this.fullscreen && this.treshhold < Enlightenment.FPS) {
      return
    }

    if (this.handleDragValidate(event)) {
      return
    }

    // if (clientY < 0) {
    //   console.log('Top')
    // } else if (clientY > window.innerHeight) {
    //   console.log('Bottom')
    // }

    // if (clientX < 0) {
    //   console.log('Left')
    // } else if (clientX > window.innerWidth) {
    //   console.log('Right')
    // }

    this.dragRequest = requestAnimationFrame(() => {
      const x = this.pointerX - event.clientX
      const y = this.pointerY - event.clientY

      context.style.transform = `translate(${-x}px, ${-y}px)`
      // context.style.top = `${context.offsetLeft - x}px`
    })
  }

  handleDragValidate(event?: MouseEvent) {
    if (!event || !this.dragActive) {
      return false
    }

    const { clientX, clientY } = event

    if (clientY <= 0) {
      this.edgeY = 'top'
    } else if (clientY >= window.innerHeight) {
      this.edgeY = 'bottom'
    }

    if (clientX <= 0) {
      this.edgeX = 'left'
    } else if (clientX >= window.innerWidth) {
      this.edgeX = 'right'
    }

    if (clientY < 0 || clientY > window.innerHeight || clientX < 0 || clientX > window.innerWidth) {
      this.handleDragEnd(event)

      return true
    }

    return false
  }

  handleDragStart(event?: MouseEvent) {
    if (!event || this.dragActive) {
      return
    }

    event.preventDefault()

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    this.dragActive = true

    // let x = 0
    // let y = 0
    // if (context.style.transform) {
    //   const matrix = context.style.transform.split('(')[1].split(')')[0].split(',').map(parseFloat)

    //   if (matrix[0]) {
    //     x = matrix[0]
    //   }

    //   if (matrix[1]) {
    //     y = matrix[1]
    //   }
    // }

    this.currentX = context.offsetLeft
    this.currentY = context.offsetTop
    this.pointerX = event.clientX
    this.pointerY = event.clientY

    this.assignGlobalEvent('mousemove', this.handleDragUpdate, {
      context: document.documentElement
    })

    this.assignGlobalEvent('touchend', this.handleDragEnd, {
      once: true
    })

    this.assignGlobalEvent('mouseup', this.handleDragEnd, {
      once: true
    })
  }

  protected handleCurrentElement(target: EventTarget | null): void {
    super.handleCurrentElement(target)

    !this.currentElement && this.handleDragEnd()
  }

  handleExit(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    this.remove && this.remove()
  }

  handleSuspend(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }
  }

  handleZoom(event?: Event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const context = this.useContext() as HTMLElement

    if (context) {
      if (!this.fullscreen) {
        this.previousX = context.offsetLeft
        this.previousY = context.offsetTop
        context.removeAttribute('style')
      } else {
        context.style.top = `${this.previousY}px`
        context.style.left = `${this.previousX}px`
      }
    }

    this.commit('fullscreen', !this.fullscreen)
  }

  protected updated(properties: any) {
    super.updated(properties)

    this.updateAttribute('views')
  }

  renderControls() {
    return html`
      <div class="window__controls">
        <button class="window__control window__control--exit" @click=${this.handleExit}></button>
        <button
          class="window__control window__control--suspend @click=${this.handleSuspend}"
        ></button>
        <button class="window__control window__control--zoom" @click=${this.handleZoom}></button>
      </div>
    `
  }

  renderHeader(excludeControls?: boolean) {
    return html`
      <header class="window__header">
        <span class="window__handle" @mousedown="${this.handleDragStart}"></span>
        ${this.renderMeta()} ${!excludeControls ? this.renderControls() : nothing}
      </header>
    `
  }

  renderMeta() {
    return html` <span class="window__meta">${this.title}</span> `
  }

  renderViews() {
    if (!this.views) {
      return
    }

    const views = Array.from({ length: this.views }).map((_, index) => {
      return html`
        <section class="window__view">
          <slot name="${index ? `view--${index}` : ''}"></slot>
        </section>
      `
    })

    if (!views.length) {
      return nothing
    }

    return html` <div class="window__views">${views}</div> `
  }

  render() {
    const classes = ['window']

    if (this.type) {
      classes.push(`window--type-is-${this.type}`)
    }

    if (this.controls) {
      classes.push(`window--has-controls-${this.controls}`)
    }

    if (this.fullscreen) {
      classes.push(`window--is-fullscreen`)
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}" draggable>
        ${this.type === 'primary' ? this.renderHeader() : nothing}
        <div class="window__body">
          <aside class="window__aside">
            ${this.type === 'secondary' ? this.renderControls() : nothing}
          </aside>
          <main class="window__content">
            ${this.type === 'secondary' ? this.renderHeader(true) : nothing} ${this.renderViews()}
          </main>
        </div>
        <footer class="window__footer"></footer>
      </div>
    `
  }
}
