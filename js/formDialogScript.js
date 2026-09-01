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
export class FormDialog {
    /**
     * Cant be consturcted externally, use dialog manager - ShowDialog function
     * @param dialog Configuration
     */
    constructor(dialog) {
        this.dialog = dialog;
    }
    SetProgress(id, value, max = 100) {
        if (id >= this.dialog.progressLines.length || id < 0) {
            return;
        }
        const element = this.dialog.progressLines[id].children.item(1);
        element.max = max;
        element.value = value;
    }
    SetProgressMessage(id, message) {
        if (id >= this.dialog.progressLines.length || id < 0) {
            return;
        }
        this.dialog.progressLines[id].children.item(0).innerText = message;
    }
    CloseDialog() {
        this.dialog.CloseDialog();
    }
    AllowSelect(allowSelect) {
        this.dialog.AllowSelect(allowSelect);
    }
    GetInputValue() {
        var _c;
        return (_c = this.dialog.inputElement) === null || _c === void 0 ? void 0 : _c.value;
    }
    GetCheckboxHolderChildren() {
        var _c;
        return [...(_c = this.dialog.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children];
    }
}
/**
 * Dialog template class for creating dialog
 */
class FormDialogTemplate {
    constructor(title, content, escapeCloseValue, style, onCloseEvent, buttons, settings = {}) {
        var _c, _d, _e, _f, _g;
        this.element = null;
        this.holder = null;
        this.titleElement = null;
        this.contentElement = null;
        this.inputElement = null;
        this.checkboxesHolder = null;
        this.selectAllCheckbox = null;
        this.style = FormDialogStyle.Normal;
        this.closed = false;
        //Setup default settings
        this.title = title;
        this.content = content;
        this.escapeCloseValue = escapeCloseValue;
        this.onCloseEvent = onCloseEvent;
        this.buttons = buttons;
        this.settings = settings;
        this.style = style;
        this.settings.entryType = (_c = this.settings.entryType) !== null && _c !== void 0 ? _c : "text";
        this.settings.progressLines = (_d = this.settings.progressLines) !== null && _d !== void 0 ? _d : 0;
        this.settings.blockOpenOver = (_e = this.settings.blockOpenOver) !== null && _e !== void 0 ? _e : true;
        this.settings.openOverOthers = (_f = this.settings.openOverOthers) !== null && _f !== void 0 ? _f : true;
        this.settings.placeholder = (_g = this.settings.placeholder) !== null && _g !== void 0 ? _g : "";
        this.draggableElement = null;
        this.progressLines = [];
    }
    AllowSelect(allowSelect) {
        var _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let len = (_c = this.holder) === null || _c === void 0 ? void 0 : _c.children.length;
        if (len == undefined) {
            return;
        }
        if (allowSelect) {
            for (let i = 1; i < len; i++) {
                (_e = (_d = this.holder) === null || _d === void 0 ? void 0 : _d.children.item(i)) === null || _e === void 0 ? void 0 : _e.classList.add("allowSelect");
            }
            (_f = this.draggableElement) === null || _f === void 0 ? void 0 : _f.ChangeDragElement(this.titleElement);
            (_g = this.titleElement) === null || _g === void 0 ? void 0 : _g.classList.add("formDialogTitleDrag");
        }
        else {
            for (let i = 1; i < len; i++) {
                (_j = (_h = this.holder) === null || _h === void 0 ? void 0 : _h.children.item(i)) === null || _j === void 0 ? void 0 : _j.classList.remove("allowSelect");
            }
            (_k = this.draggableElement) === null || _k === void 0 ? void 0 : _k.ChangeDragElement(null);
            (_l = this.titleElement) === null || _l === void 0 ? void 0 : _l.classList.remove("formDialogTitleDrag");
        }
    }
    GetClosed() {
        return this.closed;
    }
    CloseDialog() {
        var _c;
        (_c = this.element) === null || _c === void 0 ? void 0 : _c.dispatchEvent(new Event("force-cancel"));
        this.closed = true;
    }
}
/**
 * Class for managing dialogs
 */
export class FormDialogManager {
    constructor() {
        this.dialogs = [];
        this.opened = [];
        this.blockOpenOver = false;
        this.dialogHolder = document.createElement("div");
        this.dialogHolder.id = "formDialogHolder";
        document.body.appendChild(this.dialogHolder);
    }
    ShowDialog(title, content, escapeCloseValue, style, onCloseEvent, buttons, settings) {
        const dialog = new FormDialogTemplate(title, content, escapeCloseValue, style, onCloseEvent, buttons, settings);
        if (this.RenderDialog(dialog)) {
            return new FormDialog(dialog);
        }
        else {
            return null;
        }
    }
    RenderDialog(dialog) {
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        //Check if dialog is valid
        if (dialog == null || dialog == undefined) {
            return false;
        }
        dialog = dialog;
        if (dialog.GetClosed()) {
            return false;
        }
        if ((dialog.buttons == null || dialog.buttons.length == 0) && dialog.style != FormDialogStyle.Wait) {
            return false;
        }
        //Sort out invalid openings
        if (this.blockOpenOver) {
            this.dialogs.push(dialog);
            console.log("Dialog waiting - blocked open over");
            return true;
        }
        if (this.opened.length > 0 && !dialog.settings.openOverOthers) {
            this.dialogs.push(dialog);
            console.log("Dialog waiting - other opened");
            return true;
        }
        if (!GlobalLanguageManager.GetIsReady()) {
            console.log("Dialog waiting - language manager is loading");
            setTimeout(() => {
                this.RenderDialog(dialog);
            }, 10);
            return true;
        }
        //Set properties
        if (dialog.settings.blockOpenOver) {
            this.blockOpenOver = true;
        }
        this.opened.push(dialog);
        //Create dialog element
        dialog.element = document.createElement("dialog");
        dialog.element.classList.add("formDialog");
        dialog.element.classList.add("formDialogFadeIn");
        if (dialog.style == FormDialogStyle.Wait) {
            dialog.element.style.cursor = "wait";
        }
        dialog.holder = document.createElement("div");
        dialog.element.appendChild(dialog.holder);
        this.dialogHolder.appendChild(dialog.element);
        //Title
        dialog.titleElement = document.createElement("p");
        dialog.titleElement.classList.add("formHeader");
        dialog.titleElement.innerText = dialog.title;
        dialog.holder.appendChild(dialog.titleElement);
        dialog.draggableElement = MakeElementDraggable(dialog.element, null);
        //Content
        const content = document.createElement("div");
        if (dialog.style == FormDialogStyle.Wait || dialog.style == FormDialogStyle.Progress) {
            content.classList.add("puslatingEffectFull");
        }
        content.innerHTML = dialog.content;
        dialog.holder.appendChild(content);
        //Setup specific styles
        if (dialog.style == FormDialogStyle.Entry || dialog.style == FormDialogStyle.Select) {
            //Setup entry
            dialog.inputElement = new HTMLFormInputElement("", null);
            if (dialog.settings.useMinMaxAsLen == true) {
                dialog.inputElement.minLength = parseInt((_c = dialog.settings.min) !== null && _c !== void 0 ? _c : "0");
                dialog.inputElement.maxLength = parseInt((_d = dialog.settings.max) !== null && _d !== void 0 ? _d : "-1");
            }
            else {
                dialog.inputElement.min = (_e = dialog.settings.min) !== null && _e !== void 0 ? _e : "";
                dialog.inputElement.max = (_f = dialog.settings.max) !== null && _f !== void 0 ? _f : "";
            }
            dialog.inputElement.step = (_g = dialog.settings.step) !== null && _g !== void 0 ? _g : "1";
            dialog.inputElement.value = (_h = dialog.settings.presetValue) !== null && _h !== void 0 ? _h : null;
            dialog.inputElement.placeholder = dialog.settings.placeholder;
            dialog.inputElement.addEventListener("mousedown", (ev) => {
                ev.stopImmediatePropagation();
            });
            if (dialog.style == FormDialogStyle.Entry) {
                dialog.inputElement.type = dialog.settings.entryType;
            }
            else {
                dialog.inputElement.type = "select";
                dialog.inputElement.isStrictList = true;
                if (dialog.settings.selectValues != undefined) {
                    dialog.inputElement.setOptions(dialog.settings.selectValues);
                }
                if (dialog.settings.alwaysShownOptions != undefined) {
                    dialog.inputElement.alwaysShownOptions = dialog.settings.alwaysShownOptions;
                }
            }
            let image = "";
            switch (dialog.settings.entryType) {
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
                case "search-realtime": {
                    image = "!filter";
                    break;
                }
                default: {
                    image = "textfields32.svg";
                    break;
                }
            }
            dialog.inputElement.icon = "/formWebScripts/images/" + image;
            dialog.holder.appendChild(dialog.inputElement);
        }
        else if (dialog.style == FormDialogStyle.Progress) {
            //Setup progress
            for (let i = 0; i < dialog.settings.progressLines; i++) {
                const line = document.createElement("div");
                const text = document.createElement("p");
                text.style.textAlign = "center";
                line.appendChild(text);
                const progress = document.createElement("progress");
                progress.classList.add("formProgress");
                line.appendChild(progress);
                dialog.progressLines.push(line);
                dialog.holder.appendChild(line);
            }
        }
        else if (dialog.style == FormDialogStyle.CheckBoxSelect) {
            //Setup search
            dialog.inputElement = new HTMLFormInputElement("", null);
            /*if (dialog.settings.selectValues != undefined) {
                      dialog.inputElement.setOptions([...dialog.settings.selectValues.keys()])
                  }*/
            dialog.inputElement.type = "search-realtime";
            dialog.inputElement.addEventListener("search", () => {
                var _c;
                if (dialog.checkboxesHolder == null) {
                    return;
                }
                dialog.checkboxesHolder.style.display = "none";
                for (const element of dialog.checkboxesHolder.children) {
                    const toggle = element;
                    toggle.style.display = ContainsText(toggle.label, (_c = dialog.inputElement) === null || _c === void 0 ? void 0 : _c.value, false, true) ? "" : "none";
                }
                dialog.checkboxesHolder.style.display = "";
                onChange();
            });
            dialog.holder.appendChild(dialog.inputElement);
            //Setup checkboxes area
            dialog.checkboxesHolder = document.createElement("fieldset");
            dialog.checkboxesHolder.classList.add("checkboxHolder");
            const name = "FormDialogToggleGroup-" + GeneratePassword(8, false, false);
            dialog.checkboxesHolder.setAttribute("form-toggle-limiter", name);
            dialog.checkboxesHolder.setAttribute("form-toggle-disabled", "");
            //Setup mins and maxes
            if (dialog.settings.checkboxSelectMinCount != undefined) {
                dialog.checkboxesHolder.setAttribute("min", dialog.settings.checkboxSelectMinCount.toString());
            }
            if (dialog.settings.checkboxSelectMaxCount != undefined) {
                dialog.checkboxesHolder.setAttribute("max", dialog.settings.checkboxSelectMaxCount.toString());
            }
            const isRadio = dialog.settings.checkboxSelectMinCount != undefined && dialog.settings.checkboxSelectMaxCount != undefined && dialog.settings.checkboxSelectMinCount == 1 && dialog.settings.checkboxSelectMaxCount == 1;
            if (isRadio) {
                dialog.checkboxesHolder.removeAttribute("max");
            }
            //On change
            const onChange = () => {
                var _c;
                if (isRadio) {
                    return;
                }
                const children = (_c = dialog.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children;
                let checked = 0;
                let childenCount = 0;
                for (const element of children) {
                    const toggle = element;
                    if (toggle.style.display == "none") {
                        continue;
                    }
                    childenCount++;
                    if (toggle.checked) {
                        checked++;
                    }
                }
                if (checked == 0) {
                    dialog.selectAllCheckbox.checked = false;
                }
                else if (checked == childenCount) {
                    dialog.selectAllCheckbox.checked = true;
                }
                else {
                    dialog.selectAllCheckbox.indeterminate = true;
                }
            };
            //Select all checkbox
            if (!isRadio) {
                dialog.selectAllCheckbox = new HTMLFormToggleElement();
                dialog.selectAllCheckbox.addEventListener("change", () => {
                    var _c, _d, _e, _f, _g;
                    //if (dialog.settings.checkboxSelectMaxCount != undefined) {
                    //    if(dialog.settings.checkboxSelectMaxCount < (dialog.checkboxesHolder?.children.length as number)) {
                    //        if(dialog.selectAllCheckbox != null) {
                    //            dialog.selectAllCheckbox.checked = false;
                    //        }
                    //    }
                    //}
                    const checked = ((_c = dialog.selectAllCheckbox) === null || _c === void 0 ? void 0 : _c.checked) == true;
                    for (const element of (_d = dialog.checkboxesHolder) === null || _d === void 0 ? void 0 : _d.children) {
                        const toggle = element;
                        if (toggle.style.display == "none") {
                            continue;
                        }
                        toggle.disableEvents = true;
                        toggle.silenceValidation++;
                        toggle.checked = checked;
                        toggle.silenceValidation--;
                        toggle.disableEvents = false;
                    }
                    if ((_f = (_e = dialog.checkboxesHolder) === null || _e === void 0 ? void 0 : _e.children.length) !== null && _f !== void 0 ? _f : 0 > 0) {
                        ((_g = dialog.checkboxesHolder) === null || _g === void 0 ? void 0 : _g.children.item(0)).validate();
                    }
                    onChange();
                });
                dialog.selectAllCheckbox.label = GlobalLanguageManager.Translate("dialog.selectAll");
            }
            //Generate HTML elements
            dialog.holder.appendChild(dialog.checkboxesHolder);
            if (!isRadio && dialog.selectAllCheckbox != null) {
                dialog.holder.appendChild(dialog.selectAllCheckbox);
            }
            if (dialog.settings.checkboxSelectValues != undefined) {
                for (const [key, val] of dialog.settings.checkboxSelectValues) {
                    const input = new HTMLFormToggleElement();
                    input.name = name;
                    input.isRadio = isRadio;
                    input.label = key;
                    input.value = key;
                    input.addEventListener("change", () => {
                        onChange();
                    });
                    input.silenceValidation++;
                    input.checked = (_j = val.checked) !== null && _j !== void 0 ? _j : false;
                    input.silenceValidation--;
                    dialog.checkboxesHolder.appendChild(input);
                }
            }
            onChange();
            //Calculate max width
            let bestWidth = 0;
            let currentLeft = NaN;
            for (let i = dialog.checkboxesHolder.children.length - 1; i >= 0; i--) {
                const child = dialog.checkboxesHolder.children.item(i);
                const left = child.getBoundingClientRect().left;
                let width = left + child.getBoundingClientRect().width;
                if (!isNaN(currentLeft) && currentLeft != left) {
                    break;
                }
                currentLeft = left;
                if (width > bestWidth) {
                    bestWidth = width;
                }
            }
            dialog.checkboxesHolder.style.minWidth = dialog.inputElement.getBoundingClientRect().width + "px";
            dialog.checkboxesHolder.style.width = bestWidth - dialog.checkboxesHolder.getBoundingClientRect().left + dialog.checkboxesHolder.scrollLeft + 20 + "px";
            dialog.checkboxesHolder.removeAttribute("form-toggle-disabled");
        }
        //Allow select
        dialog.AllowSelect((_k = dialog.settings.allowSelect) !== null && _k !== void 0 ? _k : (dialog.style == FormDialogStyle.CheckBoxSelect || dialog.style == FormDialogStyle.Entry || dialog.style == FormDialogStyle.Select));
        //Button box holder
        const buttonBoxHolder = document.createElement("div");
        buttonBoxHolder.classList.add("formButtonBoxHolder");
        dialog.holder.appendChild(buttonBoxHolder);
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
            var _c, _d, _e, _f;
            if (dialog == null || dialog == undefined) {
                return Promise.resolve(true);
            }
            if (dialog.style == FormDialogStyle.Select && !isCancel) {
                const [_a, valid, _b] = await dialog.inputElement.validate();
                if (!valid) {
                    SendToast(dialog.title, "Pole obsahuje neplatnou hodnotu.", "error");
                    return Promise.resolve(false);
                }
            }
            if (dialog.style == FormDialogStyle.CheckBoxSelect && !isCancel && ((_c = dialog.checkboxesHolder) === null || _c === void 0 ? void 0 : _c.children.length) != 0) {
                const [_a, valid, _b] = await ((_d = dialog.checkboxesHolder) === null || _d === void 0 ? void 0 : _d.children.item(0)).validate();
                if (!valid) {
                    return Promise.resolve(false);
                }
            }
            (_e = dialog.element) === null || _e === void 0 ? void 0 : _e.classList.add("is-hidden");
            (_f = dialog.element) === null || _f === void 0 ? void 0 : _f.addEventListener("animationend", (event) => {
                var _c, _d, _e;
                if (event.animationName == "fadeOut") {
                    (_c = dialog.element) === null || _c === void 0 ? void 0 : _c.classList.remove("is-hidden");
                    (_d = dialog.element) === null || _d === void 0 ? void 0 : _d.close();
                    (_e = dialog.element) === null || _e === void 0 ? void 0 : _e.remove();
                    if (dialog.settings.blockOpenOver) {
                        this.blockOpenOver = false;
                    }
                    this.opened = this.opened.filter((item) => item != dialog);
                    //Open next dialog
                    let tryOpen = true;
                    while (tryOpen) {
                        tryOpen = !this.RenderDialog(this.dialogs.pop());
                        if (this.dialogs.length == 0) {
                            tryOpen = false;
                        }
                    }
                }
            });
            return Promise.resolve(true);
        };
        //ESC key press
        dialog.element.addEventListener("cancel", async (event) => {
            var _c, _d, _e;
            event.preventDefault();
            if (dialog.style == FormDialogStyle.Wait) {
                (_c = dialog.element) === null || _c === void 0 ? void 0 : _c.classList.remove("formDialogFadeIn");
                (_d = dialog.element) === null || _d === void 0 ? void 0 : _d.close();
                (_e = dialog.element) === null || _e === void 0 ? void 0 : _e.showModal();
                return;
            }
            if (!(await closeDialog(true))) {
                return;
            }
            if (dialog.onCloseEvent != null) {
                dialog.onCloseEvent(-1, dialog.escapeCloseValue);
            }
        });
        //Close using close function
        dialog.element.addEventListener("force-cancel", async (event) => {
            event.preventDefault();
            if (!(await closeDialog(true))) {
                return;
            }
            if (dialog.onCloseEvent != null) {
                dialog.onCloseEvent(-2, dialog.escapeCloseValue);
            }
        });
        //Setup buttons
        if (dialog.buttons != null) {
            for (let i = 0; i < dialog.buttons.length; i++) {
                if (dialog.buttons[i] == undefined) {
                    continue;
                }
                const button = document.createElement("button");
                button.classList.add("formButton");
                if (((_l = dialog.buttons[i]) === null || _l === void 0 ? void 0 : _l.color) == "ok") {
                    button.classList.add("formOkColor");
                }
                else if (((_m = dialog.buttons[i]) === null || _m === void 0 ? void 0 : _m.color) == "warn") {
                    button.classList.add("formWarnColor");
                }
                else if (((_o = dialog.buttons[i]) === null || _o === void 0 ? void 0 : _o.color) == "info") {
                    button.classList.add("formInfoColor");
                }
                else if (((_p = dialog.buttons[i]) === null || _p === void 0 ? void 0 : _p.color) == "error") {
                    button.classList.add("formErrorColor");
                }
                else if (((_q = dialog.buttons[i]) === null || _q === void 0 ? void 0 : _q.color) == "black") {
                    button.classList.add("formBlackColor");
                }
                button.onclick = async () => {
                    var _c;
                    if (!(await closeDialog(dialog.buttons[i].isCancel))) {
                        return;
                    }
                    if (dialog.onCloseEvent != null) {
                        dialog.onCloseEvent(i, (_c = dialog.buttons[i]) === null || _c === void 0 ? void 0 : _c.valueOnClick);
                    }
                };
                if (((_r = dialog.buttons[i]) === null || _r === void 0 ? void 0 : _r.location) == "left") {
                    buttonBoxLeft.appendChild(button);
                }
                else if (((_s = dialog.buttons[i]) === null || _s === void 0 ? void 0 : _s.location) == "center") {
                    buttonBoxCenter.appendChild(button);
                }
                else if (((_t = dialog.buttons[i]) === null || _t === void 0 ? void 0 : _t.location) == "right") {
                    buttonBoxRight.appendChild(button);
                }
                const text = dialog.buttons[i].text;
                if (typeof text == "string") {
                    button.innerText = text;
                }
                else {
                    button.innerHTML = text();
                }
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
    /**
     * Shows prompt (asking for user input - text, number, ...)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param entryType Input field type, overwrites settings.entryType
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry
     * @argument settings.allowSelect Allow selection of text in dialog
     * @argument settings.selectValues Hinting values for entry, key is display value, value is returned
     * @returns Dialog or null
     */
    ShowPrompt(title, content, cancelValue, onCloseEvent, entryType = "text", settings = {}) {
        settings.entryType = entryType;
        const dialog = this.ShowDialog(title, content, cancelValue, FormDialogStyle.Entry, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog === null || dialog === void 0 ? void 0 : dialog.GetInputValue());
                    return;
                }
                onCloseEvent(value);
            }
        }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue), new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], settings);
        return dialog;
    }
    /**
     * Shows alert (informing about problem - only OK button)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowAlert(title, content, onCloseEvent, settings = {}) {
        return this.ShowDialog(title, content, null, FormDialogStyle.Normal, (_a, _b) => {
            if (onCloseEvent != null) {
                onCloseEvent();
            }
        }, [new FormDialogButton("center", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)], settings);
    }
    /**
     * Opens confirm (asking for user yes or no)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowConfirm(title, content, onCloseEvent, settings = {}) {
        return this.ShowDialog(title, content, false, FormDialogStyle.Normal, (_, value) => {
            if (!onCloseEvent != null) {
                onCloseEvent(value);
            }
        }, [
            new FormDialogButton("left", "error", () => {
                return GlobalLanguageManager.Translate("dialog.btnNo", "No");
            }, false, true),
            new FormDialogButton("right", "ok", () => {
                return GlobalLanguageManager.Translate("dialog.btnYes", "Yes");
            }, true),
        ], settings);
    }
    /**
     * Opens select dialog (asking for user choice of value)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param selectValues Values for selection, key is display value, value is returned, overwrites settings.selectValues
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowSelect(title, content, cancelValue, onCloseEvent, selectValues, settings = {}) {
        settings.selectValues = selectValues;
        const dialog = this.ShowDialog(title, content, cancelValue, FormDialogStyle.Select, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog === null || dialog === void 0 ? void 0 : dialog.GetInputValue());
                    return;
                }
                onCloseEvent(value);
            }
        }, [
            new FormDialogButton("left", "error", () => {
                return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel");
            }, cancelValue, true),
            new FormDialogButton("right", "ok", () => {
                return GlobalLanguageManager.Translate("dialog.btnOK", "OK");
            }, null),
        ], settings);
        return dialog;
    }
    /**
     * Opens progress (please wait dialogs or progress)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param onCloseEvent Event fired on close
     * @param progressLines Count of progressbars, overwrites settings.progressLines
     * @param allowCancel If you can cancel the progress dialog
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowProgress(title, content, onCancelEvent, progressLines, allowCancel, settings = {}) {
        settings.progressLines = progressLines;
        const dialog = this.ShowDialog(title, content, false, FormDialogStyle.Progress, (btn, value) => {
            if (onCancelEvent != null) {
                if (btn != -2) {
                    onCancelEvent();
                    return;
                }
            }
        }, [
            allowCancel
                ? new FormDialogButton("center", "error", () => {
                    return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel");
                }, false, true)
                : undefined,
        ], settings);
        return dialog;
    }
    /**
     * Opens checkbox select (allowing multiselect using checkboxes), if minimum and maximum argument set to 1, it will switch to radio buttons instead
     * @param title Title of dialog
     * @param content Content HTML before select field
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param checkboxSelectValues Values for selection, key is display value, value is returned, overwrites settings.checkboxSelectValues
     * @param settings More settings, not required:
     * @argument settings.checkboxSelectMinCount Minimum count of selectable options, set to undefined for unlimited
     * @argument settings.checkboxSelectMaxCount Maximum count of selectable options, set to undefined for unlimited
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowCheckboxSelect(title, content, cancelValue, onCloseEvent, checkboxSelectValues, settings = {}) {
        settings.checkboxSelectValues = checkboxSelectValues;
        const dialog = this.ShowDialog(title, content, cancelValue, FormDialogStyle.CheckBoxSelect, (btn, value) => {
            var _c;
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    const children = dialog === null || dialog === void 0 ? void 0 : dialog.GetCheckboxHolderChildren();
                    if (children != undefined) {
                        const values = [];
                        for (const element of children) {
                            const toggle = element;
                            if (toggle.checked) {
                                values.push((_c = checkboxSelectValues.get(toggle.value)) === null || _c === void 0 ? void 0 : _c.value);
                            }
                        }
                        onCloseEvent(values);
                        return;
                    }
                }
                onCloseEvent(value);
            }
        }, [
            new FormDialogButton("left", "error", () => {
                return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel");
            }, cancelValue, true),
            new FormDialogButton("right", "ok", () => {
                return GlobalLanguageManager.Translate("dialog.btnOK", "OK");
            }, null),
        ], settings);
        return dialog;
    }
    /**
     * Shows prompt (asking for user input - text, number, ...)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param entryType Input field type, overwrites settings.entryType
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry
     * @argument settings.allowSelect Allow selection of text in dialog
     * @argument settings.selectValues Hinting values for entry, key is display value, value is returned
     * @returns Result value
     */
    ShowPromptAsync(title, content, cancelValue, entryType = "text", settings = {}) {
        return new Promise((resolve) => {
            if (this.ShowPrompt(title, content, cancelValue, (value) => {
                resolve(value);
            }, entryType, settings) == null) {
                resolve(null);
            }
        });
    }
    /**
     * Shows alert (informing about problem - only OK button)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns True or null on failure
     */
    ShowAlertAsync(title, content, settings = {}) {
        return new Promise((resolve) => {
            if (this.ShowAlert(title, content, () => {
                resolve(true);
            }, settings) == null) {
                resolve(null);
            }
        });
    }
    /**
     * Opens confirm (asking for user yes or no)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns True or false or null on failure
     */
    ShowConfirmAsync(title, content, settings = {}) {
        return new Promise((resolve) => {
            if (this.ShowConfirm(title, content, (value) => {
                resolve(value);
            }, settings) == null) {
                resolve(null);
            }
        });
    }
    /**
     * Opens select dialog (asking for user choice of value)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param selectValues Values for selection, key is display value, value is returned, overwrites settings.selectValues
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Returns selected value or null on failure
     */
    ShowSelectAsync(title, content, cancelValue, selectValues, settings = {}) {
        return new Promise((resolve) => {
            if (this.ShowSelect(title, content, cancelValue, (value) => {
                resolve(value);
            }, selectValues, settings) == null) {
                resolve(null);
            }
        });
    }
    /**
     * Opens checkbox select (allowing multiselect using checkboxes), if minimum and maximum arguments are set to 1, it will switch to radio buttons instead
     * @param title Title of dialog
     * @param content Content HTML before select field
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param checkboxSelectValues Values for selection, key is display value, value is returned, overwrites settings.checkboxSelectValues
     * @param settings More settings, not required:
     * @argument settings.checkboxSelectMinCount Minimum count of selectable options, set to undefined for unlimited
     * @argument settings.checkboxSelectMaxCount Maximum count of selectable options, set to undefined for unlimited
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Array of values, one (cancel) value or null on failure
     */
    ShowCheckboxSelectAsync(title, content, cancelValue, checkboxSelectValues, settings = {}) {
        return new Promise((resolve) => {
            if (this.ShowCheckboxSelect(title, content, cancelValue, (value) => {
                resolve(value);
            }, checkboxSelectValues, settings) == null) {
                resolve(null);
            }
        });
    }
}
export const GlobalDialogManager = new FormDialogManager();
//# sourceMappingURL=formDialogScript.js.map