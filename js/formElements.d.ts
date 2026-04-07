import { HTMLFormBoxElement, HTMLFormBoxStatusMessageElement, HTMLFormToggleElement } from "./formScript";

declare global {
    interface HTMLElementTagNameMap {
        'form-box': HTMLFormBoxElement
        'form-status-message': HTMLFormBoxStatusMessageElement
        'form-toggle': HTMLFormToggleElement
    }
}

export {};