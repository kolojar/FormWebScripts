import { HTMLFormInputElement } from "./formInput";
import { HTMLFormBoxElement, HTMLFormBoxStatusMessageElement } from "./formScript";
import { HTMLFormToggleElement } from "./formToggle";

declare global {
    interface HTMLElementTagNameMap {
        'form-box': HTMLFormBoxElement
        'form-status-message': HTMLFormBoxStatusMessageElement
        'form-toggle': HTMLFormToggleElement
        'form-input': HTMLFormInputElement
    }
}

export {};
