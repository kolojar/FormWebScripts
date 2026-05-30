import { GlobalLanguageManager, HTMLFormInputElement, HTMLFormToggleElement, MakeElementDraggable, SendToast } from "./formScript.js";
import { ContainsText, GeneratePassword } from "./sharedScripts.js";
export var FormDialogStyle;
(function (FormDialogStyle) {
    FormDialogStyle[FormDialogStyle["Normal"] = 0] = "Normal";
    FormDialogStyle[FormDialogStyle["Wait"] = 1] = "Wait";
    FormDialogStyle[FormDialogStyle["Entry"] = 2] = "Entry";
    FormDialogStyle[FormDialogStyle["Select"] = 3] = "Select";
    FormDialogStyle[FormDialogStyle["Progress"] = 4] = "Progress";
    FormDialogStyle[FormDialogStyle["CheckBoxSelect"] = 5] = "CheckBoxSelect";
})(FormDialogStyle || (FormDialogStyle = {}));
/**
 * Class for button in dialog
 */
export class FormDialogButton {
    constructor(location, color, text, valueOnClick, isCancel = false) {
        this.isCancel = false;
        this.location = location;
        this.color = color;
        this.valueOnClick = valueOnClick;
        this.text = text;
        this.isCancel = isCancel;
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
        this.selectValues = new Map;
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
        this.inputElement = null;
        this.checkboxesHolder = null;
        this.progressLabels = [];
        this.selectAllCheckbox = null;
        this.closed = false;
        this.template = template;
        this.draggableElement = null;
        this.element = document.createElement("dialog");
        this.progressLines = [];
        if (template.style == FormDialogStyle.Entry || template.style == FormDialogStyle.Select) {
            //Setup entry
            this.inputElement = new HTMLFormInputElement("", null);
            this.inputElement.placeholder = template.placeholder;
            this.inputElement.addEventListener("mousedown", (ev) => {
                ev.stopImmediatePropagation();
            });
            if (template.style == FormDialogStyle.Entry) {
                this.inputElement.type = this.template.entryType;
            }
            else {
                this.inputElement.type = "select";
                this.inputElement.isStrictList = true;
                this.inputElement.setOptions(template.selectValues);
            }
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
            this.inputElement.icon = "/formWebScripts/images/" + image;
        }
        else if (template.style == FormDialogStyle.Progress) {
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
        else if (template.style == FormDialogStyle.CheckBoxSelect) {
            //Setup search
            this.inputElement = new HTMLFormInputElement("", null);
            this.inputElement.setOptions([...this.template.selectValues.keys()]);
            this.inputElement.type = "search-realtime";
            this.inputElement.addEventListener("search", () => {
                var _c, _d;
                for (const element of (_c = this.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children) {
                    const toggle = element;
                    toggle.style.display = ContainsText(toggle.label, (_d = this.inputElement) === null || _d === void 0 ? void 0 : _d.value, false, true) ? "" : "none";
                }
            });
            //Setup checkboxes area
            this.checkboxesHolder = document.createElement("fieldset");
            this.checkboxesHolder.classList.add("checkboxHolder");
            const name = "FormDialogToggleGroup-" + GeneratePassword(8, false, false);
            this.checkboxesHolder.setAttribute("form-toggle-limiter", name);
            for (const [key, _] of this.template.selectValues) {
                const input = new HTMLFormToggleElement();
                input.name = name;
                input.label = key;
                input.value = key;
                input.addEventListener("change", () => {
                    onChange(input);
                });
                this.checkboxesHolder.appendChild(input);
            }
            //Select all checkbox
            this.selectAllCheckbox = new HTMLFormToggleElement();
            this.selectAllCheckbox.addEventListener("change", () => {
                var _c, _d;
                const checked = ((_c = this.selectAllCheckbox) === null || _c === void 0 ? void 0 : _c.checked) == true;
                for (const element of (_d = this.checkboxesHolder) === null || _d === void 0 ? void 0 : _d.children) {
                    const toggle = element;
                    toggle.disableEvents = true;
                    toggle.checked = checked;
                    toggle.disableEvents = false;
                }
            });
            this.selectAllCheckbox.label = GlobalLanguageManager.Translate("dialog.selectAll");
            //On change            
            const onChange = (checkbox) => {
                var _c;
                const children = (_c = this.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children;
                let checked = 0;
                for (const element of children) {
                    if (element.checked) {
                        checked++;
                    }
                }
                if (checked == 0) {
                    this.selectAllCheckbox.checked = false;
                }
                else if (checked == children.length) {
                    this.selectAllCheckbox.checked = true;
                }
                else {
                    this.selectAllCheckbox.indeterminate = true;
                }
            };
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
    AllowSelect(allowSelect) {
        var _c, _d, _e, _f;
        const holder = this.element.children.item(0);
        const title = holder.children.item(0);
        if (allowSelect) {
            for (let i = 1; i < holder.children.length; i++) {
                (_c = holder.children.item(i)) === null || _c === void 0 ? void 0 : _c.classList.add("allowSelect");
            }
            (_d = this.draggableElement) === null || _d === void 0 ? void 0 : _d.ChangeDragElement(title);
            title.classList.add("formDialogTitleDrag");
        }
        else {
            for (let i = 1; i < holder.children.length; i++) {
                (_e = holder.children.item(i)) === null || _e === void 0 ? void 0 : _e.classList.remove("allowSelect");
            }
            (_f = this.draggableElement) === null || _f === void 0 ? void 0 : _f.ChangeDragElement(null);
            title.classList.remove("formDialogTitleDrag");
        }
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
        var _c, _d, _e, _f, _g, _h, _j, _k, _l;
        //Check if dialog is valid
        if (dialog == null || dialog == undefined || dialog.template == null) {
            return false;
        }
        dialog = dialog;
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
        (_c = document.getElementById("formDialogHolder")) === null || _c === void 0 ? void 0 : _c.appendChild(dialog.element);
        dialog.element.classList.add("formDialog");
        dialog.element.classList.add("formDialogFadeIn");
        if (dialog.template.style == FormDialogStyle.Wait) {
            dialog.element.style.cursor = "wait";
        }
        const holder = document.createElement("div");
        dialog.element.appendChild(holder);
        //Title
        const title = document.createElement("p");
        title.classList.add("formHeader");
        title.innerText = dialog.template.title;
        holder.appendChild(title);
        dialog.draggableElement = MakeElementDraggable(dialog.element, title);
        dialog.AllowSelect(false);
        //Data
        const data = document.createElement("div");
        if (dialog.template.style == FormDialogStyle.Wait || dialog.template.style == FormDialogStyle.Progress) {
            data.classList.add("puslatingEffectFull");
        }
        data.innerHTML = dialog.template.content;
        holder.appendChild(data);
        //Entry
        if (dialog.template.style == FormDialogStyle.Entry || dialog.template.style == FormDialogStyle.Select || dialog.template.style == FormDialogStyle.CheckBoxSelect) {
            holder.appendChild(dialog.inputElement);
        }
        //Progress
        if (dialog.template.style == FormDialogStyle.Progress) {
            for (let i = 0; i < dialog.progressLines.length; i++) {
                holder.appendChild(dialog.progressLines[i]);
            }
        }
        //CheckBoxSelect
        if (dialog.template.style == FormDialogStyle.CheckBoxSelect) {
            const checkboxes = dialog.checkboxesHolder;
            holder.appendChild(checkboxes);
            const lastChild = checkboxes.children.item(checkboxes.children.length - 1);
            if (lastChild != null) {
                checkboxes.style.width = ((lastChild.getBoundingClientRect().right + lastChild.getBoundingClientRect().width) - checkboxes.getBoundingClientRect().left + checkboxes.scrollLeft + 20) + "px";
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
        const closeDialog = async (isCancel) => {
            if (dialog == null || dialog == undefined) {
                return Promise.resolve(true);
            }
            if (dialog.template.style == FormDialogStyle.Select && !isCancel) {
                const [_, valid] = await dialog.inputElement.validate();
                if (!valid) {
                    SendToast(dialog.template.title, "Pole obsahuje neplatnou hodnotu.", "error");
                    return Promise.resolve(false);
                }
            }
            dialog.element.classList.add("is-hidden");
            dialog.element.addEventListener("animationend", (event) => {
                if (event.animationName == "fadeOut") {
                    dialog.element.classList.remove("is-hidden");
                    dialog.element.close();
                    dialog.element.remove();
                    if (dialog.template.blockOpenOver) {
                        this.blockedOpenOver = false;
                    }
                    this.opened = this.opened.filter(item => item != dialog);
                    //Open next dialog
                    let tryOpen = true;
                    while (tryOpen) {
                        tryOpen = !this.ShowDialog(this.dialogs.pop());
                        if (this.dialogs.length == 0) {
                            tryOpen = false;
                        }
                    }
                }
            });
            return Promise.resolve(true);
        };
        //ESC key press
        dialog.element.addEventListener('cancel', async (event) => {
            event.preventDefault();
            if (dialog.template.style == FormDialogStyle.Wait) {
                dialog.element.classList.remove("formDialogFadeIn");
                dialog.element.close();
                dialog.element.showModal();
                return;
            }
            if (!await closeDialog(true)) {
                return;
            }
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-1, dialog.template.escapeCloseValue);
            }
        });
        //Close using close function
        dialog.element.addEventListener('force-cancel', async (event) => {
            event.preventDefault();
            if (!await closeDialog(true)) {
                return;
            }
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-2, dialog.template.escapeCloseValue);
            }
        });
        //Setup buttons
        if (dialog.template.buttons != null) {
            for (let i = 0; i < dialog.template.buttons.length; i++) {
                if (dialog.template.buttons[i] == undefined) {
                    continue;
                }
                const button = document.createElement("button");
                button.classList.add("formButton");
                if (((_d = dialog.template.buttons[i]) === null || _d === void 0 ? void 0 : _d.color) == "ok") {
                    button.classList.add("formOkColor");
                }
                else if (((_e = dialog.template.buttons[i]) === null || _e === void 0 ? void 0 : _e.color) == "warn") {
                    button.classList.add("formWarnColor");
                }
                else if (((_f = dialog.template.buttons[i]) === null || _f === void 0 ? void 0 : _f.color) == "info") {
                    button.classList.add("formInfoColor");
                }
                else if (((_g = dialog.template.buttons[i]) === null || _g === void 0 ? void 0 : _g.color) == "error") {
                    button.classList.add("formErrorColor");
                }
                else if (((_h = dialog.template.buttons[i]) === null || _h === void 0 ? void 0 : _h.color) == "black") {
                    button.classList.add("formBlackColor");
                }
                button.onclick = async () => {
                    var _c;
                    if (!await closeDialog(dialog.template.buttons[i].isCancel)) {
                        return;
                    }
                    if (dialog.template.onCloseEvent != null) {
                        dialog.template.onCloseEvent(i, (_c = dialog.template.buttons[i]) === null || _c === void 0 ? void 0 : _c.valueOnClick);
                    }
                };
                if (((_j = dialog.template.buttons[i]) === null || _j === void 0 ? void 0 : _j.location) == "left") {
                    buttonBoxLeft.appendChild(button);
                }
                else if (((_k = dialog.template.buttons[i]) === null || _k === void 0 ? void 0 : _k.location) == "center") {
                    buttonBoxCenter.appendChild(button);
                }
                else if (((_l = dialog.template.buttons[i]) === null || _l === void 0 ? void 0 : _l.location) == "right") {
                    buttonBoxRight.appendChild(button);
                }
                button.innerText = dialog.template.buttons[i].text;
            }
        }
        //Open dialog
        dialog.element.showModal();
        dialog.element.scroll({ top: 0, behavior: "instant" });
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
            var _c;
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent((_c = dialog.inputElement) === null || _c === void 0 ? void 0 : _c.value);
                    return;
                }
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue),
            new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Entry, openOverOthers, blockedOpenOver);
        template.entryType = entryType;
        template.placeholder = placeholder;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    ShowAlert(title, content, onCloseEvent, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowTemplate(new FormDialogTemplate(title, content, null, (_a, _b) => {
            if (onCloseEvent != null) {
                onCloseEvent();
            }
        }, [new FormDialogButton("center", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver));
    }
    ShowConfirm(title, content, onCloseEvent, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowTemplate(new FormDialogTemplate(title, content, false, (_, value) => {
            if (!onCloseEvent != null) {
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnNo", "No"), false, true),
            new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnYes", "Yes"), true)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver));
    }
    ShowSelect(title, content, cancelValue, onCloseEvent, selectValues, openOverOthers = true, blockedOpenOver = true) {
        let dialog;
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog.inputElement.value);
                    return;
                }
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue, true),
            new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Select, openOverOthers, blockedOpenOver);
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
        }, [allowCancel ? new FormDialogButton("center", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), false, true) : undefined], FormDialogStyle.Progress, openOverOthers, blockedOpenOver);
        template.progressLines = progressLines;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    ShowCheckboxSelect(title, content, cancelValue, onCloseEvent, selectValues, openOverOthers = true, blockedOpenOver = true) {
        let dialog;
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            var _c;
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    const values = [];
                    for (const element of [...(_c = dialog.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children]) {
                        const toggle = element;
                        if (toggle.checked) {
                            values.push(selectValues.get(toggle.value));
                        }
                    }
                    onCloseEvent(values);
                    return;
                }
                onCloseEvent([value]);
            }
        }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue, true),
            new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.CheckBoxSelect, openOverOthers, blockedOpenOver);
        template.selectValues = selectValues;
        dialog = this.ShowTemplate(template);
        return dialog;
    }
    ShowPromptAsync(title, content, cancelValue, entryType = "text", placeholder = "", openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowPrompt(title, content, cancelValue, (value) => { resolve(value); }, entryType, placeholder, openOverOthers, blockedOpenOver);
        });
    }
    ShowAlertAsync(title, content, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowAlert(title, content, () => { resolve(null); }, openOverOthers, blockedOpenOver);
        });
    }
    ShowConfirmAsync(title, content, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowConfirm(title, content, (value) => { resolve(value); }, openOverOthers, blockedOpenOver);
        });
    }
    ShowSelectAsync(title, content, cancelValue, selectValues, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowSelect(title, content, cancelValue, (value) => { resolve(value); }, selectValues, openOverOthers, blockedOpenOver);
        });
    }
    ShowCheckboxSelectAsync(title, content, cancelValue, selectValues, openOverOthers = true, blockedOpenOver = true) {
        return new Promise(resolve => {
            this.ShowCheckboxSelect(title, content, cancelValue, (value) => { resolve(value); }, selectValues, openOverOthers, blockedOpenOver);
        });
    }
    OpenPrompt(title, content, cancelValue, entryType = "text", placeholder = "", openOverOthers = true, blockedOpenOver = true) {
        return this.ShowPromptAsync(title, content, cancelValue, entryType, placeholder, openOverOthers, blockedOpenOver);
    }
    OpenAlert(title, content, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowAlertAsync(title, content, openOverOthers, blockedOpenOver);
    }
    OpenConfirm(title, content, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowConfirmAsync(title, content, openOverOthers, blockedOpenOver);
    }
    OpenSelect(title, content, cancelValue, selectValues, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowSelectAsync(title, content, cancelValue, selectValues, openOverOthers, blockedOpenOver);
    }
    OpenCheckboxSelect(title, content, cancelValue, selectValues, openOverOthers = true, blockedOpenOver = true) {
        return this.ShowCheckboxSelectAsync(title, content, cancelValue, selectValues, openOverOthers, blockedOpenOver);
    }
}
//# sourceMappingURL=formDialogScript.js.map