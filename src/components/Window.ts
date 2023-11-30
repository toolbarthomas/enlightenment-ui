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

export type WindowZoomOptions = {
  left?: number
  top?: number
  width?: number
  height?: number
}

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

  previousEdge?: string

  // Previous width value of the defined context Element.
  previousWidth?: number

  // Previous height value of the defined context Element.
  previousHeight?: number

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
  views: number = 1

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeTop: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeRight: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeBottom: number = 0

  @property({ converter: Enlightenment.isInteger, type: Number })
  edgeLeft: number = 0

  @property({ converter: Enlightenment.isBoolean, type: Boolean })
  fullscreen?: boolean = false

  @property({ type: String })
  width?: '200px'

  @property({ type: String })
  height?: string

  public connectedCallback(): void {
    super.connectedCallback()

    this.assignGlobalEvent('resize', this.handleResize, { context: window })
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback()

    this.omitGlobalEvent('resize', this.handleResize)
  }

  handleDragEnd(event?: MouseEvent | TouchEvent) {
    this.dragRequest && cancelAnimationFrame(this.dragRequest)

    if (this.dragActive) {
      const context = this.useContext() as HTMLElement

      if (this.fullscreen) {
        // this.commit('fullscreen', false)
        this.handleZoom()

        return this.handleDragEnd()
      }

      if (context) {
        this.dragRequest && cancelAnimationFrame(this.dragRequest)

        const [x, y] = Enlightenment.parseMatrix(context.style.transform)

        context.style.transform = ''
        context.style.left = `${Math.round(this.currentX + x)}px`
        context.style.top = `${Math.round(this.currentY + y)}px`

        this.currentY += y
        this.currentX += x

        // if (this.edgeX) {
        //   this.handleZoom(event, { top: 0, left: 0, width: 50 })
        // }

        let top = 0
        let left = 0
        let width = window.innerWidth
        let height = window.innerHeight

        const [edgeTop, edgeRight, edgeBottom, edgeLeft] = this.useEdge()

        if (this.edgeX === 'right' || this.currentX >= edgeRight) {
          left = window.innerWidth / 2
          width = window.innerWidth / 2 - this.edgeRight
        } else if (this.edgeX === 'left' || this.currentX + context.offsetWidth < edgeLeft) {
          if (this.edgeLeft) {
            left = this.edgeLeft
          }

          width = window.innerWidth / 2 - this.edgeLeft
        }

        if (this.edgeY === 'top' || this.currentY + context.offsetHeight < edgeTop) {
          height = window.innerHeight / 2 - this.edgeTop

          if (this.edgeTop) {
            top = this.edgeTop
          }

          // if (edgeTop) {
          //   height = window.innerHeight / 2 - 0
          // }
          console.log('REST TOP')
        } else if (this.edgeY === 'bottom' || this.currentY > edgeBottom) {
          top = window.innerHeight / 2
          height = window.innerHeight / 2 - this.edgeBottom

          console.log('REST BOTTOM')
        }

        if (this.edgeX || this.edgeY) {
          console.log('EDGE ZOOM')
          this.handleZoom(event)
        }

        console.log('STOP', this.fullscreen, top, left, width, height)

        this.treshhold = 0
      }
    }

    this.dragActive = false

    this.omitGlobalEvent('mousemove', this.handleDragUpdate)
    this.omitGlobalEvent('mouseup', this.handleDragEnd)
    this.omitGlobalEvent('touchend', this.handleDragEnd)
    this.omitGlobalEvent('touchmove', this.handleDragUpdate)
  }

  handleDragUpdate(event?: MouseEvent | TouchEvent) {
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

    const [clientX, clientY] = this.usePointerPosition(event)

    if (clientX === undefined || clientY === undefined) {
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
      const x = this.pointerX - clientX
      const y = this.pointerY - clientY

      context.style.transform = `translate(${-x}px, ${-y}px)`
      // context.style.top = `${context.offsetLeft - x}px`
    })
  }

  handleResize(event: UIEvent) {
    this.throttle(this.handleResizeCallback, Enlightenment.FPS, event)
  }

  handleResizeCallback(event: UIEvent) {
    if (this.fullscreen) {
      if (this.previousEdge) {
        if (this.previousEdge === 'left' || this.previousEdge === 'right') {
          this.edgeX = this.previousEdge
        } else {
          this.edgeY = this.previousEdge
        }
        console.log('RESTORE EDGE', this.edgeX, this.edgeY)
      }

      this.fullscreen = false
      this.handleZoom(event)
    }

    console.log('resize')
  }

  useEdge() {
    const top = 0 + this.edgeTop
    const left = 0 + this.edgeLeft
    const right = window.innerWidth - this.edgeRight
    const bottom = window.innerHeight - this.edgeBottom

    return [top, right, bottom, left]
  }

  usePointerPosition(event?: MouseEvent | TouchEvent) {
    if (!event || !this.dragActive) {
      return []
    }

    const [edgeTop, edgeRight, edgeBottom, edgeLeft] = this.useEdge()

    const treshhold = devicePixelRatio * 2
    let clientX = 0
    let clientY = 0
    if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    }

    if (clientY <= edgeTop + treshhold) {
      this.edgeY = 'top'
    } else if (clientY >= edgeBottom - treshhold) {
      this.edgeY = 'bottom'
    } else {
      this.edgeY = undefined
    }

    if (clientX <= edgeLeft + treshhold) {
      this.edgeX = 'left'
    } else if (clientX >= edgeRight - treshhold) {
      this.edgeX = 'right'
    } else {
      this.edgeX = undefined
    }

    if (clientY < edgeTop || clientY > edgeBottom || clientX < edgeLeft || clientX > edgeRight) {
      this.handleDragEnd(event)

      return []
    }

    return [clientX, clientY]
  }

  handleDragStart(event?: MouseEvent | TouchEvent) {
    if (!event || this.dragActive) {
      return
    }

    event.preventDefault()

    if (event instanceof MouseEvent) {
      if (event.button !== 0) {
        return
      }
    }

    const context = this.useContext() as HTMLElement

    if (!context) {
      return
    }

    this.dragActive = true

    this.handleCurrentElement(this)

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

    if (event instanceof MouseEvent) {
      this.pointerX = Math.round(event.clientX)
      this.pointerY = Math.round(event.clientY)
    } else if (event instanceof TouchEvent) {
      this.pointerX = Math.round(event.touches[0].clientX)
      this.pointerY = Math.round(event.touches[0].clientY)
    }

    console.log('Validate', this.pointerX, this.pointerY)

    this.assignGlobalEvent('mousemove', this.handleDragUpdate, {
      context: document.documentElement
    })

    this.assignGlobalEvent('touchmove', this.handleDragUpdate, {
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

    if (!context) {
      return
    }

    if (!this.fullscreen) {
      this.previousX = context.offsetLeft
      this.previousY = context.offsetTop

      this.previousWidth = context.offsetWidth
      this.previousHeight = context.offsetHeight

      // if (!options) {
      context.removeAttribute('style')
      // }

      if (this.edgeX === 'left') {
        this.previousX = 0
      } else if (this.edgeX === 'right') {
        this.previousX = window.innerWidth - context.offsetWidth
      }

      if (this.edgeY === 'top') {
        this.previousY = 0
      } else if (this.edgeY === 'bottom') {
        this.previousY = window.innerHeight - context.offsetHeight
      }

      if (!this.edgeX && !this.edgeY) {
        context.style.top = `${this.edgeTop || 0}px`
        context.style.left = `${this.edgeLeft || 0}px`
        context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
        context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
      } else {
        if (this.edgeY === 'top') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
          context.style.left = `${this.edgeLeft || 0}px`
          context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
        } else if (this.edgeY === 'bottom') {
          context.style.top = `${window.innerHeight / 2}px`
          context.style.height = `${window.innerHeight / 2 - (this.edgeBottom || 0)}px`
          context.style.width = `${window.innerWidth - this.edgeLeft - this.edgeRight}px`
          context.style.left = `${this.edgeLeft || 0}px`
        }

        if (this.edgeX === 'left') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.left = `${this.edgeLeft || 0}px`
          context.style.width = `${window.innerWidth / 2 - this.edgeLeft}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
        } else if (this.edgeX === 'right') {
          context.style.top = `${this.edgeTop || 0}px`
          context.style.left = `${window.innerWidth / 2}px`
          context.style.width = `${window.innerWidth / 2 - this.edgeRight}px`
          context.style.height = `${window.innerHeight - this.edgeTop - this.edgeBottom}px`
        }
      }
    } else {
      context.style.top = `${this.previousY}px`
      context.style.left = `${this.previousX}px`

      // Restore the initial Window width & height
      if (this.previousWidth) {
        context.style.width = `${this.previousWidth}px`
      }

      if (this.previousHeight) {
        context.style.height = `${this.previousHeight}px`
      }

      // Restore the Window and remove any focus from it.
      this.throttle(this.handleCurrentElement)

      this.previousEdge = undefined

      context.style.width = this.width || undefined
      context.style.height = this.height || undefined
    }

    this.previousEdge = this.edgeX || this.edgeY || undefined
    this.edgeX = undefined
    this.edgeY = undefined

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
        <span
          class="window__handle"
          @mousedown="${this.handleDragStart}"
          @touchstart="${this.handleDragStart}"
        ></span>
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
