import { MakeElementDraggable } from "./formScript.js";
import { LanguageManager } from "./languageManager.js";
export var FormDialogStyle;
(function (FormDialogStyle) {
    FormDialogStyle[FormDialogStyle["Normal"] = 0] = "Normal";
    FormDialogStyle[FormDialogStyle["Wait"] = 1] = "Wait";
    FormDialogStyle[FormDialogStyle["Entry"] = 2] = "Entry";
    FormDialogStyle[FormDialogStyle["Select"] = 3] = "Select";
    FormDialogStyle[FormDialogStyle["Progress"] = 4] = "Progress";
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
        this.placeholder = "";
        this.entryType = "text";
        this.selectValues = [];
        this.createdDialogs = [];
        this.progressLines = 0;
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
        this.progressLines = [];
        if (template.style == FormDialogStyle.Entry || template.style == FormDialogStyle.Select) {
            //Setup entry
            this.inputElement = document.createElement("form-input");
            this.inputElement.setPlaceHolder(template.placeholder);
            this.inputElement.style.width = "500px";
            if (template.style == FormDialogStyle.Entry) {
                this.inputElement.setType(this.template.entryType);
            }
            else {
                this.inputElement.setType("select");
                this.inputElement.setIsScrictList(true);
                document;
            }
            this.inputElement.setListId(template.listId);
            let image = "";
            switch (this.template.entryType.toLowerCase()) {
                case "text": {
                    image = "textfields32.svg";
                    break;
                }
                case "color": {
                    image = "palette32.svg";
                    break;
                }
                case "password": {
                    image = "key32.svg";
                    break;
                }
                default: {
                    image = "textfields32.svg";
                    break;
                }
            }
            this.inputElement.setIcon("/formWebScripts/images/" + image);
        }
        if (template.style == FormDialogStyle.Progress) {
            //Setup progress
            for (let i = 0; i < template.progressLines; i++) {
                const line = document.createElement("div");
                const text = document.createElement("p");
                text.style.textAlign = "center";
                line.appendChild(text);
                const progress = document.createElement("progress");
                progress.classList.add("formProgress");
                line.appendChild(progress);
                this.progressLines.push(line);
            }
        }
        this.template.createdDialogs.push(this);
    }
    SetProgress(id, value, max = 100) {
        if (id >= this.progressLines.length) {
            return;
        }
        const element = this.progressLines[id].children.item(1);
        element.max = max;
        element.value = value;
    }
    SetMessage(id, message) {
        if (id >= this.progressLines.length) {
            return;
        }
        this.progressLines[id].children.item(0).innerText = message;
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
        this.languageManager = new LanguageManager("/formWebScripts/locales", null, false);
        const dialogHolder = document.createElement("div");
        dialogHolder.id = "formDialogHolder";
        document.body.appendChild(dialogHolder);
    }
    ShowTemplate(template) {
        if (template == null) {
            return null;
        }
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
        //Data
        const data = document.createElement("p");
        if (dialog.template.style == FormDialogStyle.Wait || dialog.template.style == FormDialogStyle.Progress) {
            data.classList.add("puslatingEffectFull");
        }
        data.innerText = dialog.template.content;
        holder.appendChild(data);
        //Entry
        if (dialog.template.style == FormDialogStyle.Entry || dialog.template.style == FormDialogStyle.Select) {
            holder.appendChild(dialog.inputElement);
        }
        //Progress
        if (dialog.template.style == FormDialogStyle.Progress) {
            for (let i = 0; i < dialog.progressLines.length; i++) {
                holder.appendChild(dialog.progressLines[i]);
            }
        }
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
                if (dialog.template.buttons[i] == null) {
                    continue;
                }
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
    ShowPrompt(title, content, cancelValue, onCloseEvent, entryType = "text", placeholder = "", openOverOthers = true, blockedOpenOver = true) {
        let dialog;
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog.inputElement.getValue());
                    return;
                }
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue),
            new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Entry, openOverOthers, blockedOpenOver);
        template.entryType = entryType;
        template.placeholder = placeholder;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    ShowAlert(title, content, onCloseEvent, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowTemplate(new FormDialogTemplate(title, content, null, (a, _b) => {
            if (onCloseEvent != null) {
                onCloseEvent();
            }
        }, [new FormDialogButton("center", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver));
    }
    ShowConfirm(title, content, onCloseEvent, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowTemplate(new FormDialogTemplate(title, content, false, (_, value) => {
            if (!onCloseEvent != null) {
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnNo", "No"), false),
            new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnYes", "Yes"), true)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver));
    }
    ShowSelect(title, content, cancelValue, onCloseEvent, selectValues, openOverOthers = true, blockedOpenOver = true) {
        let dialog;
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog.template.selectValues[dialog.inputElement.getValue()].GetValue());
                    return;
                }
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue),
            new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Select, openOverOthers, blockedOpenOver);
        template.selectValues = selectValues;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    ShowProgress(title, content, onCancelEvent, progressLines, allowCancel = true, openOverOthers = true, blockedOpenOver = true) {
        let dialog;
        const template = new FormDialogTemplate(title, content, false, (btn, value) => {
            if (onCancelEvent != null) {
                if (btn != -2) {
                    onCancelEvent();
                    return;
                }
            }
        }, [allowCancel ? new FormDialogButton("center", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), false) : null], FormDialogStyle.Progress, openOverOthers, blockedOpenOver);
        template.progressLines = progressLines;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    OpenPrompt(title, content, cancelValue, entryType = "text", placeholder = "", openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowPrompt(title, content, cancelValue, (value) => { resolve(value); }, entryType, placeholder, openOverOthers, blockedOpenOver);
        });
    }
    OpenAlert(title, content, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowAlert(title, content, () => { resolve(null); }, openOverOthers, blockedOpenOver);
        });
    }
    OpenConfirm(title, content, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowConfirm(title, content, (value) => { resolve(value); }, openOverOthers, blockedOpenOver);
        });
    }
    OpenSelect(title, content, cancelValue, selectValues, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowSelect(title, content, cancelValue, (value) => { resolve(value); }, selectValues, openOverOthers, blockedOpenOver);
        });
    }
}
//# sourceMappingURL=formDialogScript.js.map