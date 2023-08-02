import { Enlightenment, html, property } from "@toolbarthomas/enlightenment";

@property("enlightenment-example")
class Example extends Enlightenment {
  render() {
    return html`Bar`;
  }
}
