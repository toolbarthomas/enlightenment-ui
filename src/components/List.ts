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

  @property({ attribute: "list-type", type: String })
  listType = "ul";

  constructor() {
    super();

    this.disableGlobalEvents = true;
  }

  render() {
    const classes = ["list", `list--is-${this.listType}`];

    console.log("traverse", this.parents("[list-type]"));

    const list = this.parent("[list-type]");
    if (!this.hasAttribute("list-type") && list) {
      this.listType = list.getAttribute("list-type");
    }

    switch (this.listType) {
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
