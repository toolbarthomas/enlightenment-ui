import {
  createRef,
  customElement,
  Enlightenment,
  html,
  property,
  ref
} from '@toolbarthomas/enlightenment'

import sprite from 'assets/svg/sprite.svg'

import styles from './Content.scss'

@customElement('ui-content')
class EnlightenmentButton extends Enlightenment {
  static styles = [styles]

  @property({ type: String })
  color = 'blank'

  @property({ type: String })
  layout = 'compact'

  @property({ type: String })
  label?: string

  header: Ref<Element> = createRef()
  main: Ref<Element> = createRef()

  render() {
    const classes = ['content', `content--is-${this.color}`, `content--is-${this.layout}`]

    if (this.isNested()) {
      classes.push('content--is-nested')
    }

    return html`
      <section ref="${ref(this.context)}" class="${classes.join(' ')}">
        <div class="content__wrapper">${this.renderSummary()} ${this.renderMain()}</div>
      </section>
    `
  }

  renderSummary() {
    const { summary } = this.slots || {}
    if (summary || this.label) {
      return html`
        <header class="content__header" ref="${ref(this.header)}">
          ${this.renderLabel()}
          <div class="content__summary">
            <slot name="summary"></slot>
          </div>
        </header>
      `
    }
  }

  /**
   * Renders the main content of the current element and wrap an optional
   * article element if the defined element is nested within the same element
   * type.
   */
  renderMain() {
    return html`
      <main class="content__main" ref="${ref(this.main)}">
        ${this.isNested()
          ? html`<slot></slot>`
          : html`
              <article>
                <slot></slot>
              </article
            `}
      </main>
    `
  }

  renderLabel(tag?: string) {
    switch (tag) {
      case 'h6':
        return html`<h6 class="content__label">${this.label}</h6>`

      case 'h5':
        return html`<h5 class="content__label">${this.label}</h5>`

      case 'h4':
        return html`<h4 class="content__label">${this.label}</h4>`

      case 'h3':
        return html`<h3 class="content__label">${this.label}</h3>`

      case 'h2':
        return html`<h2 class="content__label">${this.label}</h2>`

      default:
        return html`<h1 class="content__label">${this.label}</h1>`
    }
  }
}
