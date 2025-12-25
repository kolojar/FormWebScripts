import { MakeElementDraggable } from "./formScript.js";
export var FormDialogStyle;
(function (FormDialogStyle) {
    FormDialogStyle[FormDialogStyle["Normal"] = 0] = "Normal";
    FormDialogStyle[FormDialogStyle["Wait"] = 1] = "Wait";
    FormDialogStyle[FormDialogStyle["Entry"] = 2] = "Entry";
})(FormDialogStyle || (FormDialogStyle = {}));
/**
 * Class for button in dialog
 */
export class FormDialogButton {
    constructor(location, color, text, valueOnClick) {
        this.location = location;
        this.color = color;
        this.valueOnClick = valueOnClick;
        this.text = text;
    }
}
/**
 * Dialog template class for creating dialog
 */
export class FormDialogTemplate {
    /**
     * Creates new dialog, do not modify any properties of element
     * @param title Title of dialog
     * @param content Text content of dialog
     * @param escapeCloseValue Value sended in onCloseEvent, when Escape key was pressed
     * @param onCloseEvent Event called when dialog is closed, -1 = Escape key, -2 = Close using function
     * @param buttons Array of buttons in dialog
     * @param style Style of dialog
     * @param openOverOthers Allow opening over other dialogs
     * @param blockOpenOver Will be the topmost dialog, no other dialog can open over this one
     */
    constructor(title, content, escapeCloseValue, onCloseEvent, buttons, style = FormDialogStyle.Normal, openOverOthers = false, blockOpenOver = false) {
        this.title = title;
        this.content = content;
        this.escapeCloseValue = escapeCloseValue;
        this.onCloseEvent = onCloseEvent;
        this.buttons = buttons;
        this.blockOpenOver = blockOpenOver;
        this.openOverOthers = openOverOthers;
        this.style = style;
        this.createdDialogs = [];
    }
    CloseChildrenDialogs() {
        for (let dialog of this.createdDialogs) {
            dialog.CloseDialog();
        }
    }
}
/**
 * Dialog class for creating dialog
 */
export class FormDialog {
    /**
     * Creates new dialog, do not modify any properties of element
     * @param template Template of dialog
     */
    constructor(template) {
        this.template = template;
        this.element = document.createElement("dialog");
        this.template.createdDialogs.push(this);
    }
    CloseDialog() {
        this.element.dispatchEvent(new Event("force-cancel"));
        this.closed = true;
        this.template.createdDialogs = this.template.createdDialogs.filter(item => item != this);
    }
}
/**
 * Class for managing dialogs
 */
export class FormDialogManager {
    constructor() {
        this.dialogs = [];
        this.opened = [];
        this.blockedOpenOver = false;
        const dialogHolder = document.createElement("div");
        dialogHolder.id = "formDialogHolder";
        document.body.appendChild(dialogHolder);
    }
    ShowTemplate(template) {
        const dialog = new FormDialog(template);
        if (this.ShowDialog(dialog)) {
            return dialog;
        }
        else {
            return null;
        }
    }
    ShowDialog(dialog) {
        //Check if dialog is valid
        if (dialog == null || dialog.template == null) {
            return false;
        }
        if (dialog.closed) {
            return false;
        }
        if ((dialog.template.buttons == null || dialog.template.buttons.length == 0) && dialog.template.style != FormDialogStyle.Wait) {
            return false;
        }
        //Sort out invalid openings
        if (this.blockedOpenOver) {
            this.dialogs.push(dialog);
            console.log("Dialog waiting - blocked open over");
            return true;
        }
        if (this.opened.length > 0 && !dialog.template.openOverOthers) {
            this.dialogs.push(dialog);
            console.log("Dialog waiting - other opened");
            return true;
        }
        //Set properties
        if (dialog.template.blockOpenOver) {
            this.blockedOpenOver = true;
        }
        this.opened.push(dialog);
        //Create dialog
        document.getElementById("formDialogHolder").appendChild(dialog.element);
        dialog.element.classList.add("formDialog");
        dialog.element.classList.add("formDialogFadeIn");
        if (dialog.template.style == FormDialogStyle.Wait) {
            dialog.element.style.cursor = "wait";
        }
        const holder = document.createElement("div");
        MakeElementDraggable(dialog.element, holder);
        dialog.element.appendChild(holder);
        //Title
        const title = document.createElement("p");
        title.classList.add("formHeader");
        title.innerText = dialog.template.title;
        holder.appendChild(title);
        if (dialog.template.style == FormDialogStyle.Entry) {
            alert("TODO ENTRY STYLE!");
            console.error("TODO ENTRY STYLE!");
            return;
        }
        //Data
        const data = document.createElement("p");
        if (dialog.template.style == FormDialogStyle.Wait) {
            data.classList.add("puslatingEffectFull");
        }
        data.innerText = dialog.template.content;
        holder.appendChild(data);
        //Button box holder
        const buttonBoxHolder = document.createElement("div");
        buttonBoxHolder.classList.add("formButtonBoxHolder");
        holder.appendChild(buttonBoxHolder);
        //Button box left
        const buttonBoxLeft = document.createElement("div");
        buttonBoxLeft.classList.add("formButtonBox", "formJustifyLeft");
        buttonBoxHolder.appendChild(buttonBoxLeft);
        //Button box center
        const buttonBoxCenter = document.createElement("div");
        buttonBoxCenter.classList.add("formButtonBox", "formCenter");
        buttonBoxHolder.appendChild(buttonBoxCenter);
        //Button box right
        const buttonBoxRight = document.createElement("div");
        buttonBoxRight.classList.add("formButtonBox", "formJustifyRight");
        buttonBoxHolder.appendChild(buttonBoxRight);
        //Close animation
        const manager = this;
        function closeDialog() {
            dialog.element.classList.add("is-hidden");
            dialog.element.addEventListener("animationend", (event) => {
                if (event.animationName == "fadeOut") {
                    dialog.element.classList.remove("is-hidden");
                    dialog.element.close();
                    dialog.element.remove();
                    if (dialog.template.blockOpenOver) {
                        manager.blockedOpenOver = false;
                    }
                    manager.opened = manager.opened.filter(item => item != dialog);
                    //Open next dialog
                    let tryOpen = true;
                    while (tryOpen) {
                        tryOpen = !manager.ShowDialog(manager.dialogs.pop());
                        if (manager.dialogs.length == 0) {
                            tryOpen = false;
                        }
                    }
                }
            });
        }
        //ESC key press
        dialog.element.addEventListener('cancel', (event) => {
            event.preventDefault();
            if (dialog.template.style == FormDialogStyle.Wait) {
                dialog.element.classList.remove("formDialogFadeIn");
                dialog.element.close();
                dialog.element.showModal();
                return;
            }
            closeDialog();
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-1, dialog.template.escapeCloseValue);
            }
        });
        //Close using close function
        dialog.element.addEventListener('force-cancel', (event) => {
            event.preventDefault();
            closeDialog();
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-2, dialog.template.escapeCloseValue);
            }
        });
        //Setup buttons
        if (dialog.template.buttons != null) {
            for (let i = 0; i < dialog.template.buttons.length; i++) {
                const button = document.createElement("button");
                button.classList.add("formButton");
                if (dialog.template.buttons[i].color == "ok") {
                    button.classList.add("formOkColor");
                }
                else if (dialog.template.buttons[i].color == "warn") {
                    button.classList.add("formWarnColor");
                }
                else if (dialog.template.buttons[i].color == "info") {
                    button.classList.add("formInfoColor");
                }
                else if (dialog.template.buttons[i].color == "error") {
                    button.classList.add("formErrorColor");
                }
                else if (dialog.template.buttons[i].color == "black") {
                    button.classList.add("formBlackColor");
                }
                button.onclick = () => {
                    closeDialog();
                    if (dialog.template.onCloseEvent != null) {
                        dialog.template.onCloseEvent(i, dialog.template.buttons[i].valueOnClick);
                    }
                };
                if (dialog.template.buttons[i].location == "left") {
                    buttonBoxLeft.appendChild(button);
                }
                else if (dialog.template.buttons[i].location == "center") {
                    buttonBoxCenter.appendChild(button);
                }
                else if (dialog.template.buttons[i].location == "right") {
                    buttonBoxRight.appendChild(button);
                }
                button.innerText = dialog.template.buttons[i].text;
            }
        }
        //Open dialog
        dialog.element.showModal();
        return true;
    }
    CloseTopDialog() {
        if (this.opened.length > 0) {
            this.opened[this.opened.length - 1].CloseDialog();
        }
    }
}
//# sourceMappingURL=formDialogScript.js.map