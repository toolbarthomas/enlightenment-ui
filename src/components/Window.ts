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

  enableDocumentEvents: boolean = true

  @property({ type: String })
  title?: string

  @property({
    reflect: true,
    converter: (value) => Enlightenment.filterProperty(value, ['primary', 'secondary']),
    type: String
  })
  type?: string = 'primary'

  renderControls() {
    return html`
      <div class="window__controls">
        <button class="window__control window__control--exit"></button>
        <button class="window__control window__control--suspend"></button>
        <button class="window__control window__control--toggle"></button>
      </div>
    `
  }

  renderHeader() {
    if (this.type !== 'primary') {
      return nothing
    }

    return html`
      <header class="window__header">
        <span class="window__meta">${this.title}</span>
        ${this.renderControls()}
      </header>
    `
  }

  render() {
    const classes = ['window']

    if (this.type) {
      classes.push(`window--type-is-${this.type}`)
    }

    return html`
      <div ref="${ref(this.context)}" class="${classes.join(' ')}">
        ${this.renderHeader()}
        <div class="window__body">
          <aside class="window__aside">
            ${this.type === 'secondary' ? this.renderControls() : nothing}
          </aside>
          <main class="window__content"><slot></slot></main>
        </div>
        <footer class="window__footer"></footer>
      </div>
    `
  }
}
