import { MobxLitElement } from "@adobe/lit-mobx";
import { css, html } from "lit";

export class GMHMapWrapper extends MobxLitElement {
    static styles = css`
    .body {
        min-width: 100vw;
        min-height: 100vh;
        background-color: var(--spectrum-gray-50);
        position: absolute;
        top: 0;
        left: 0;
        }
    #toolbar-wrapper {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: row;
    }
    `;

    constructor() {
        super();
    }

    render() {
        return html`
        <div>
            this is a class
        </div>
        `;
    }
}
