import { GMHMapWrapper } from "./GMHMapWrapper";

const TAGNAME = "gmh-map-wrapper"
customElements.define(TAGNAME, GMHMapWrapper)

declare global {
    interface HTMLElementTagNameMap {
        [TAGNAME]: GMHMapWrapper
    }
}