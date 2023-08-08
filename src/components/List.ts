import {
  customElement,
  Enlightenment,
  html,
  property,
} from "@toolbarthomas/enlightenment";

import styles from "./List.scss";

@customElement("ui-list")
class EnlightenmentList extends Enlightenment {
  static styles = [styles];

  @property({ type: String })
  type = "ul";

  constructor() {
    super();

    this.disableGlobalEvents = true;
  }

  render() {
    const classes = ["list", `list--is-${this.type}`];

    switch (this.type) {
      case "dl":
        return html`<dl class="${classes.join(" ")}"><slot></slot></dl>`;

      case "ol":
        return html`<ol class="${classes.join(" ")}">
          <slot></slot>
        </ol>`;

      default:
        return html`<ul class="${classes.join(" ")}">
          <slot></slot>
        </ul>`;
    }
  }
}
