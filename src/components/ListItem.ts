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

  @property({ attribute: "list-type", type: String })
  listType = "default";

  constructor() {
    super();

    this.disableGlobalEvents = true;
  }

  render() {
    this.listType = this.term ? "dl" : this.listType;
    const classes = ["list-item", `list-item--is-${this.listType}`];

    const list = this.parent("[list-type]");
    if (!this.hasAttribute("list-type") && list) {
      this.listType = list.getAttribute("list-type");
    }

    switch (this.listType) {
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
