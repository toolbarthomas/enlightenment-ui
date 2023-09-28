import { customElement, Enlightenment, html, property } from '@toolbarthomas/enlightenment'

import styles from './Paragraph.scss'

@customElement('ui-paragraph')
class EnlightenmentParagraph extends Enlightenment {
  static styles = [styles]

  @property({ type: String })
  text?: string

  constructor() {
    super()
  }

  render() {
    const classes = ['paragraph']

    return html`<p class="${classes.join(' ')}">${this.text ? this.text : html`<slot></slot>`}</p>`
  }
}
