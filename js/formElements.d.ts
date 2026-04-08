import { HTMLFormBoxElement, HTMLFormBoxStatusMessageElement, HTMLFormInputElement, HTMLFormToggleElement } from "./formScript";

declare global {
    interface HTMLElementTagNameMap {
        'form-box': HTMLFormBoxElement
        'form-status-message': HTMLFormBoxStatusMessageElement
        'form-toggle': HTMLFormToggleElement
        'form-input': HTMLFormInputElement
    }
}

export {};