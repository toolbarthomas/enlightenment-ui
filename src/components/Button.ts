import {
  customElement,
  Enlightenment,
  html,
  property,
} from "@toolbarthomas/enlightenment";

@customElement("ui-button")
class EnlightenmentButton extends Enlightenment {
  constructor() {
    super();
  }
  render() {
    return html`<button>Button</button>`;
  }
}
