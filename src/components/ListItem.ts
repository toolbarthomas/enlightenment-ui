import {
  customElement,
  Enlightenment,
  html,
  property,
} from "@toolbarthomas/enlightenment";

import styles from "./ListItem.scss";

@customElement("ui-list-item")
class EnlightenmentListItem extends Enlightenment {
  static styles = [styles];

  @property({ type: String })
  term?: string;

  @property({ type: String })
  type = "default";

  constructor() {
    super();

    this.disableGlobalEvents = true;
  }

  render() {
    this.type = this.term ? "dl" : this.type;
    const classes = ["list-item", `list-item--is-${this.type}`];

    const list = this.closest("[type]") || this.parentElement.closest("[type]");
    if (list) {
      this.type = list.getAttribute("type");
    }

    switch (this.type) {
      case "dl":
        return html` ${this.term &&
          html`<dt class="list-item-term">${this.term}</dt>`}
          <dd class="list-item list-item-definition">
            <slot></slot>
          </dd>`;

      default:
        return html`<li class="${classes.join(" ")}">
          <slot></slot>
        </li>`;
    }
  }
}
