import {
  createRef,
  customElement,
  Enlightenment,
  html,
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

  render() {
    return html`
      <div ref="${ref(this.context)}" class="window">
        <header class="window__header">
          <span class="window__meta">${this.title}</span>
          <div class="window__controls">
            <button class="window__control window__control--exit"></button>
            <button class="window__control window__control--suspend"></button>
            <button class="window__control window__control--toggle"></button>
          </div>
        </header>
        <div class="window__body">
          <aside class="window__aside">Body</aside>
          <main class="window__content"><slot></slot></main>
        </div>
        <footer class="window__footer"></footer>
      </div>
    `
  }
}
