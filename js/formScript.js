//Do not forget to add formStyle.css
import { LanguageManager } from "./languageManager.js";
import { ContainsText, GeneratePassword } from "./sharedScripts.js";
export const GlobalLanguageManager = new LanguageManager();
/*
Disables element and all subelements without attribute disableRecursiveDisable
 */
export function RecursiveDisabler(target, disabled) {
    for (let index = 0; index < target.children.length; index++) {
        const element = target.children[index];
        if (target instanceof HTMLFormInputElement) {
            target.disabled = disabled;
        }
        else {
            RecursiveDisabler(element, disabled);
        }
    }
    if (!target.hasAttribute("disableRecursiveDisable") && !(target instanceof HTMLFormInputElement)) {
        target.setAttribute("disabled", String(disabled));
        if (!disabled) {
            target.removeAttribute("disabled");
        }
    }
}
/*
HTMLFormBoxElement element defition
*/
export class HTMLFormBoxElement extends HTMLElement {
    constructor() {
        super();
        this.messageID = "";
    }
    /**
     * Disables form box
     */
    Disable() {
        RecursiveDisabler(this, true);
    }
    /**
     * Enables form box
     */
    Enable() {
        RecursiveDisabler(this, false);
    }
    /**
     * Sets Status message to form box
     * @param blink Should status message blink
     * @param message Message
     * @param cleanAfterMs Clean after timeout
     */
    SetStatusMessage(blink, message, cleanAfterMs = 0) {
        //Set message
        const messageID = GeneratePassword(8, false, false);
        this.messageID = messageID;
        this.querySelectorAll("form-status-message").forEach((element) => {
            let status = element; //TODO: FIX
            status.innerText = message;
            //Set blinking
            if (blink) {
                if (!status.classList.contains("puslatingEffectFull")) {
                    status.classList.add("puslatingEffectFull");
                }
            }
            else {
                if (status.classList.contains("puslatingEffectFull")) {
                    status.classList.remove("puslatingEffectFull");
                }
            }
            //Clean if needed
            if (cleanAfterMs > 0) {
                setTimeout(() => {
                    if (this.messageID == messageID) {
                        status.innerText = "";
                        this.messageID = "";
                    }
                }, cleanAfterMs);
            }
        });
    }
    /**
     * Sets waiting status to form box + disables it
     * @param message Message
     */
    SetWaitStatusMessage(message) {
        this.Disable();
        this.style.cursor = "wait";
        this.SetStatusMessage(true, message, 0);
    }
    /**
     * Removes waiting status from form box + enables it
     */
    RemoveWaitStatusMessage() {
        this.SetStatusMessage(false, "", 0);
        this.style.cursor = "";
        this.Enable();
    }
}
/**
 * Sets wait status to all forms in document
 * @param message Message
 */
export function SetWaitStatusForms(message) {
    document.querySelectorAll("form-box").forEach((form) => {
        form.SetWaitStatusMessage(message);
    });
}
/**
 * Removes wait status from wall forms in document
 */
export function RemoveWaitStatusForms() {
    document.querySelectorAll("form-box").forEach((form) => {
        form.RemoveWaitStatusMessage();
    });
}
/*
HTMLFormBoxStatusMessageElement element defition
*/
export class HTMLFormBoxStatusMessageElement extends HTMLParagraphElement {
    constructor() {
        super();
    }
}
/*
HTMLFormToggleElement element defition
*/
export class HTMLFormToggleElement extends HTMLElement {
    //public activeValue: any
    //public notActiveValue: any
    constructor() {
        super();
        this.silentValidation = 0;
        this.silenceValidation = 0;
        this.isRadioLocal = false;
        this.disableEvents = false;
        //Create elements
        this.labelBeforeElement = document.createElement("label");
        this.holder = document.createElement("label");
        this.input = document.createElement("input");
        this.slider = document.createElement("span");
        this.labelAfterElement = document.createElement("label");
        //Add classes
        this.classList.add("formSwitch");
        this.labelBeforeElement.classList.add("labelBefore");
        this.holder.classList.add("toggle");
        this.slider.classList.add("slider");
        this.labelAfterElement.classList.add("labelAfter");
        //Move children
        this.appendChild(this.labelBeforeElement);
        this.appendChild(this.holder);
        this.holder.appendChild(this.input);
        this.holder.appendChild(this.slider);
        this.appendChild(this.labelAfterElement);
        //Setup basic events
        this.addEventListener("mousedown", () => {
            if (this.disabled) {
                return;
            }
            //console.log("Click", this.checked);
            this.checked = !this.checked;
            //console.log("After", this.checked);
        });
        this.addEventListener("keydown", (ev) => {
            if (this.disabled) {
                return;
            }
            if (ev.code === "Space") {
                //console.log("Click");
                //this.checked = !this.checked
                //this.input.dispatchEvent(new Event("change"))
                //this.dispatchEvent(new Event("change"))
            }
        });
        //this.addEventListener("change", () => {
        //    this.updateSwitch()
        //})
        //this.input.addEventListener("change", () => {
        //    this.updateSwitch()
        //})
    }
    connectedCallback() {
        for (const attribute of HTMLFormInputElement.observedAttributes) {
            if (this.hasAttribute(attribute)) {
                this.attributeChangedCallback(attribute, "", this.getAttribute(attribute));
            }
        }
        const indeterminate = this.indeterminate;
        this.originalChecked = this.getAttribute("original-checked") == "true";
        this.checked = this.hasAttribute("checked");
        this.isRadio = this.getAttribute("type") == "radio" || this.hasAttribute("is-radio");
        this.indeterminate = indeterminate;
    }
    updateSwitch() {
        //Switch color and do the animation
        //console.log("Switch", this.input.checked);
        if (this.input.checked) {
            this.holder.classList.add("formSwitchChecked");
        }
        else {
            this.holder.classList.remove("formSwitchChecked");
        }
        //Handle enables target document
        if (this.hasAttribute("enables")) {
            const enables = document.getElementById(this.getAttribute("enables"));
            if (enables != null) {
                if (!this.input.checked) {
                    enables.setAttribute("disabled", "");
                    //console.log("Disabled");
                }
                else {
                    enables.removeAttribute("disabled");
                    //console.log("Enable");
                }
            }
        }
        //Update this element
        //this.checked = this.input.checked
    }
    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(name, oldValue, newValue);
        if (oldValue == newValue) {
            return;
        }
        if (name == "label-before") {
            this.labelBefore = newValue;
        }
        else if (name == "label") {
            this.label = newValue;
        }
        else if (name == "original-checked") {
            this.originalChecked = newValue == "true";
        }
        else if (name == "checked") {
            this.checked = this.hasAttribute("checked");
        }
        else if (name == "name") {
            this.name = newValue;
        }
        else if (name == "is-radio") {
            this.isRadio = this.hasAttribute("is-radio");
        }
        else if (name == "value") {
            this.value = newValue;
        }
        else if (name == "indeterminate") {
            this.indeterminate = this.hasAttribute("indeterminate");
        }
    }
    get checked() {
        return this.input.checked;
    }
    set checked(checked) {
        this.indeterminate = false;
        if (checked == this.checked) {
            return;
        }
        //this.input.checked = checked;
        if (this.isRadio) {
            let someChecked = false;
            for (const element of document.querySelectorAll('[name="' + this.name + '"][is-radio]')) {
                if (element instanceof HTMLFormToggleElement) {
                    if (element.isRadio) {
                        if (element.checked && element != this)
                            someChecked = true;
                        element.input.checked = false;
                        element.updateSwitch();
                    }
                }
            }
            if (!someChecked) {
                checked = true;
            }
        }
        //console.log("New state: ", checked);
        //console.log("Current state: ", this.input.checked);
        this.input.checked = checked;
        if (checked) {
            this.setAttribute("checked", "");
        }
        else {
            this.removeAttribute("checked");
        }
        if (!this.disableEvents) {
            this.input.dispatchEvent(new Event("change"));
            this.dispatchEvent(new Event("change"));
        }
        this.updateSwitch();
        this.validate();
    }
    validate() {
        const limiter = document.querySelector('[form-toggle-limiter="' + this.name + '"]');
        let valid = true;
        let validationMessage = "";
        if (limiter != null) {
            if (!limiter.hasAttribute("form-toggle-limiter-disabled")) {
                const min = limiter.getAttribute("min");
                const max = limiter.getAttribute("max");
                if (min != null || max != null) {
                    const checked = [];
                    const unchecked = [];
                    for (const element of document.getElementsByName(this.name)) {
                        if (element instanceof HTMLFormToggleElement) {
                            element.disabled = false;
                            if (element.checked) {
                                checked.push(element);
                            }
                            else {
                                unchecked.push(element);
                            }
                            element.silentValidation++;
                        }
                    }
                    this.silentValidation = 0;
                    if (min != null) {
                        const minNum = parseInt(min);
                        if (minNum > checked.length) {
                            validationMessage = GlobalLanguageManager.Translate("formToggle.min", "formToggle.min: {x}").replace("{x}", min.toString());
                            if (this.silenceValidation == 0) {
                                SendToast(GlobalLanguageManager.Translate("formInput.invalidValue"), validationMessage, "error");
                            }
                            valid = false;
                        }
                    }
                    if (max != null) {
                        const maxNum = parseInt(max);
                        if (maxNum <= checked.length) {
                            for (const element2 of unchecked) {
                                element2.disabled = true;
                            }
                        }
                        if (maxNum < checked.length) {
                            validationMessage = GlobalLanguageManager.Translate("formToggle.max", "formToggle.max: {x}").replace("{x}", maxNum.toString());
                            if (this.silenceValidation == 0) {
                                SendToast(GlobalLanguageManager.Translate("formInput.invalidValue"), validationMessage, "error");
                            }
                            valid = false;
                        }
                    }
                    for (const element2 of checked) {
                        element2.silentValidation--;
                    }
                    for (const element2 of unchecked) {
                        element2.silentValidation--;
                    }
                }
            }
        }
        return [this.originalChecked != this.checked, valid, this.label + " - " + this.labelBefore + ": " + validationMessage];
    }
    get originalChecked() {
        return this.getAttribute("original-checked") == "true";
    }
    set originalChecked(originalChecked) {
        this.setAttribute("original-checked", originalChecked ? "true" : "false");
    }
    get label() {
        return this.labelAfterElement.innerText;
    }
    get labelBefore() {
        return this.labelBeforeElement.innerText;
    }
    set label(label) {
        this.labelAfterElement.innerText = label;
    }
    set labelBefore(label) {
        this.labelBeforeElement.innerText = label;
    }
    get disabled() {
        return this.hasAttribute("disabled");
    }
    set disabled(disabled) {
        if (disabled) {
            this.setAttribute("disabled", "");
        }
        else {
            this.removeAttribute("disabled");
        }
    }
    get name() {
        return this.input.name;
    }
    set name(name) {
        this.input.name = name;
        this.setAttribute("name", name);
    }
    get isRadio() {
        return this.isRadioLocal;
    }
    set isRadio(isRadio) {
        this.isRadioLocal = isRadio;
        if (isRadio) {
            this.setAttribute("is-radio", "");
        }
        else {
            this.removeAttribute("is-radio");
        }
    }
    get value() {
        if (this.input.value != "") {
            return this.checked ? this.input.value : "";
        }
        else {
            return this.checked ? "on" : "";
        }
    }
    set value(value) {
        if (this.value == "") {
            this.checked = false;
        }
        else if (this.value == "on") {
            this.checked = true;
        }
        this.input.value = value;
    }
    get indeterminate() {
        return this.hasAttribute("indeterminate");
    }
    set indeterminate(indeterminate) {
        if (indeterminate) {
            this.setAttribute("indeterminate", "");
        }
        else {
            this.removeAttribute("indeterminate");
        }
    }
}
HTMLFormToggleElement.observedAttributes = ["label-before", "label", "original-checked", "checked", "name", "is-radio", "value", "indeterminate"];
/**
 * HTMLFormInputElement element defition.
 * Sends event validation-done on complete validation.
 */
export class HTMLFormInputElement extends HTMLElement {
    constructor(onEnterPressClickElementId, validationFunction, listId = "", strictList = false, doChangeCheck = false, originalValue = "", changeBorderClass = "formWarnBorderColor", invalidBorderClass = "formErrorBorderColor") {
        super();
        this.changeBorderClass = "formWarnBorderColor";
        this.invalidBorderClass = "formErrorBorderColor";
        this.usingJSList = false;
        this.areOptionsVisible = false;
        this.setIconFromCode = 0;
        this.selectedListItemWithKeyboard = -1;
        this.allowNullFile = false;
        //this.internals = this.attachInternals();
        this.onEnterPressClickElementId = onEnterPressClickElementId;
        this.typ = "text";
        this.validationFunction = validationFunction;
        this.doChangeCheck = doChangeCheck;
        this.changeBorderClass = changeBorderClass;
        this.invalidBorderClass = invalidBorderClass;
        this.optionsLocal = new Map();
        this.optionsReverse = new Map();
        this.optionsTimestamp = new Date(0);
        this.alwaysShownOptionsLocal = new Map();
        this.listId = listId;
        this.isCaseSensitiveList = false;
        this.realtimeSearchTimeout = -1;
        //Create elements
        this.holder = document.createElement("div");
        this.img = document.createElement("img");
        this.input = document.createElement("input");
        this.inputCheckbox = new HTMLFormToggleElement();
        this.textArea = document.createElement("textarea");
        this.afterImg = document.createElement("img");
        this.listHolder = document.createElement("div");
        this.labelElement = document.createElement("label");
        //Add classes
        this.afterImg.style.cursor = "pointer";
        this.listHolder.classList.add("listHolder");
        //Set attributes
        this.input.setAttribute("disableRecursiveDisable", "true");
        this.textArea.setAttribute("disableRecursiveDisable", "true");
        this.input.tabIndex = this.tabIndex;
        this.textArea.tabIndex = this.tabIndex;
        this.tabIndex = -1;
        this.listHolder.style.display = "none";
        //Move children
        this.holder.appendChild(this.img);
        this.holder.appendChild(this.afterImg);
        this.appendChild(this.labelElement);
        this.appendChild(this.holder);
        this.appendChild(this.listHolder);
        //Setup basic events
        this.addEventListener("focusin", () => {
            //console.log("Focus in");
            this.areOptionsVisible = true;
            this.renderList();
            if (!this.classList.contains("formInputFocus")) {
                this.classList.add("formInputFocus");
            }
            try {
                this.input.focus();
            }
            catch (error) {
                console.warn("Ignoring error: " + error);
            }
        });
        this.addEventListener("focusout", () => {
            //console.log("Focus out");
            this.areOptionsVisible = false;
            this.listHolder.style.display = "none";
            if (this.classList.contains("formInputFocus")) {
                this.classList.remove("formInputFocus");
            }
            this.validate();
        });
        this.addEventListener("keydown", (ev) => {
            var _a, _b, _c, _d;
            if (this.onEnterPressClickElementId == "") {
                return;
            }
            if (this.type != "textarea") {
                if (this.selectedListItemWithKeyboard != -1) {
                    (_a = this.listHolder.children.item(this.selectedListItemWithKeyboard)) === null || _a === void 0 ? void 0 : _a.classList.remove("hover");
                }
                if (ev.key == "ArrowUp" && !isNaN(this.selectedListItemWithKeyboard)) {
                    if (this.selectedListItemWithKeyboard >= 0) {
                        this.selectedListItemWithKeyboard--;
                    }
                }
                if (ev.key == "ArrowDown" && !isNaN(this.selectedListItemWithKeyboard)) {
                    if (this.selectedListItemWithKeyboard < this.listHolder.children.length - 1) {
                        this.selectedListItemWithKeyboard++;
                    }
                }
                if (ev.key == "Enter" && !isNaN(this.selectedListItemWithKeyboard)) {
                    (_b = this.listHolder.children.item(this.selectedListItemWithKeyboard)) === null || _b === void 0 ? void 0 : _b.dispatchEvent(new Event("click"));
                }
                if (this.selectedListItemWithKeyboard != -1 && !isNaN(this.selectedListItemWithKeyboard)) {
                    (_c = this.listHolder.children.item(this.selectedListItemWithKeyboard)) === null || _c === void 0 ? void 0 : _c.classList.add("hover");
                }
            }
            if (ev.key == "Enter") {
                (_d = document.getElementById(this.onEnterPressClickElementId)) === null || _d === void 0 ? void 0 : _d.dispatchEvent(new Event("click"));
            }
        });
        this.addEventListener("click", () => {
            if (this.type == "textarea") {
                this.textArea.focus();
            }
            else if (this.type == "checkbox" || this.type == "radio") {
                this.inputCheckbox.focus();
            }
            else {
                this.input.focus();
            }
        });
        this.addEventListener("input", () => {
            this.areOptionsVisible = true;
            this.renderList();
            this.validate();
        });
        this.addEventListener("resize", () => {
            //this.areOptionsVisible = true;
            this.renderList();
        });
        this.originalValue = originalValue;
        this.isStrictList = strictList;
    }
    updateList() {
        //Clear list
        if (this.usingJSList) {
            return;
        }
        this.alwaysShownOptionsLocal.clear();
        this.optionsLocal.clear();
        this.optionsReverse.clear();
        //Updates hint list under the selection
        if (this.listId == "") {
            return;
        }
        const list = document.getElementById(this.listId);
        if (list == null) {
            return;
        }
        for (let i = 0; i < list.children.length; i++) {
            const child = list.children[i];
            if (child.tagName == "OPTION") {
                const optionChild = child;
                this.options.set(optionChild.label.length != 0 ? optionChild.label : optionChild.value, optionChild.value);
                if (optionChild.hasAttribute("always-shown") || optionChild.hasAttribute("always-show")) {
                    this.alwaysShownOptionsLocal.set(optionChild.label.length != 0 ? optionChild.label : optionChild.value, true);
                }
                this.optionsReverse.set(optionChild.value, optionChild.label.length != 0 ? optionChild.label : optionChild.value);
            }
        }
        this.renderList();
    }
    renderList() {
        this.selectedListItemWithKeyboard = -1;
        //console.log("Render list");
        //console.log(this.options);
        if (this.options.size == 0 || !this.areOptionsVisible) {
            //console.log("Render list cancel");
            return;
        }
        this.listHolder.style.display = "";
        //Clear list
        while (this.listHolder.lastChild != null) {
            this.listHolder.lastChild.remove();
            //console.log("Clearing");
        }
        //Update list
        //console.log("isCaseSensitive", this.isCaseSensitiveList);
        for (const value of this.optionsLocal) {
            //console.log(value, contains);
            if (this.alwaysShownOptionsLocal.has(value[0]) || ContainsText(value[0], this.valueRaw.toString(), this.isCaseSensitiveList, true)) {
                const optionDiv = document.createElement("div");
                const option = document.createElement("p");
                option.innerText = value[0];
                optionDiv.addEventListener("click", () => {
                    //console.log("Clicked on: " + value);
                    this.valueRaw = value[0];
                    this.areOptionsVisible = false;
                    this.listHolder.style.display = "none";
                    this.validate();
                    //this.renderList()
                    //console.log(this.listHolder.style.display);
                });
                optionDiv.addEventListener("mousedown", () => {
                    //console.log("Clicked on: " + value);
                    this.valueRaw = value[0];
                    this.areOptionsVisible = false;
                    this.listHolder.style.display = "none";
                    this.validate();
                    //this.renderList()
                    //console.log(this.listHolder.style.display);
                });
                const clearMouse = () => {
                    var _a;
                    if (this.selectedListItemWithKeyboard != -1) {
                        (_a = this.listHolder.children.item(this.selectedListItemWithKeyboard)) === null || _a === void 0 ? void 0 : _a.classList.remove("hover");
                    }
                    this.selectedListItemWithKeyboard = -1;
                };
                optionDiv.addEventListener("mouseenter", () => {
                    clearMouse();
                    this.selectedListItemWithKeyboard = NaN;
                });
                optionDiv.addEventListener("mouseleave", () => {
                    clearMouse();
                });
                optionDiv.addEventListener("mousemove", () => {
                    clearMouse();
                    this.selectedListItemWithKeyboard = NaN;
                });
                optionDiv.appendChild(option);
                this.listHolder.appendChild(optionDiv);
            }
        }
    }
    updateInputType() {
        //Clear parents
        const focused = this.classList.contains("formInputFocus");
        if (this.img.parentElement == this.holder) {
            this.holder.removeChild(this.img);
        }
        if (this.input.parentElement == this.holder) {
            this.holder.removeChild(this.input);
        }
        if (this.textArea.parentElement == this.holder) {
            this.holder.removeChild(this.textArea);
        }
        if (this.inputCheckbox.parentElement == this.holder) {
            this.holder.removeChild(this.inputCheckbox);
        }
        if (this.afterImg.parentElement == this.holder) {
            this.holder.removeChild(this.afterImg);
        }
        //Special img usecases
        //if (this.type == "search-realtime") {
        //    this.setIconFromCode++;
        //    this.icon = "!filter"
        //    this.setIconFromCode--;
        //}
        if (this.img.getAttribute("path") != "") {
            this.holder.appendChild(this.img);
        }
        //Select input element based on type
        if (this.type == "textarea") {
            this.holder.appendChild(this.textArea);
            if (focused) {
                this.textArea.focus();
            }
        }
        else if (this.type == "checkbox" || this.type == "radio") {
            this.holder.appendChild(this.inputCheckbox);
            this.inputCheckbox.isRadio = this.type == "radio";
            if (focused) {
                this.inputCheckbox.focus();
            }
        }
        else {
            this.holder.appendChild(this.input);
            this.input.type = this.type;
            if (focused) {
                this.input.focus();
            }
        }
        if (this.type == "select") {
            this.isStrictList = true;
        }
        //Add specific use cases for inputs
        const realtimeSeachEvent = () => {
            if (this.realtimeSearchTimeout) {
                clearTimeout(this.realtimeSearchTimeout);
            }
            this.realtimeSearchTimeout = setTimeout(() => {
                this.dispatchEvent(new Event("search"));
            }, 100);
        };
        if (this.type == "search-realtime") {
            this.addEventListener("input", realtimeSeachEvent);
        }
        else {
            this.removeEventListener("input", realtimeSeachEvent);
        }
        //Add specific use cases for afterImg
        if (this.type == "password") {
            //Make password eye
            const updatePasswordEye = () => {
                if (this.input.type == "password") {
                    this.afterImg.src = "/formWebScripts/images/visibilityoff32.svg";
                }
                else {
                    this.afterImg.src = "/formWebScripts/images/visibility32.svg";
                }
            };
            updatePasswordEye();
            this.afterImg.onclick = () => {
                if (this.input.type == "password") {
                    this.input.type = "text";
                }
                else {
                    this.input.type = "password";
                }
                updatePasswordEye();
            };
            this.holder.appendChild(this.afterImg);
        }
        else if (this.type == "color") {
            //Random color generator
            this.afterImg.src = "/formWebScripts/images/casino32.svg";
            this.afterImg.onclick = () => {
                this.input.value = GenerateRandomColor();
            };
            this.holder.appendChild(this.afterImg);
        }
        else {
            this.afterImg.removeAttribute("src");
        }
    }
    connectedCallback() {
        //if (this.hasAttribute("type")) {
        //    //Sort input type
        //this.type = this.getAttribute("type") as HTMLFormInputType
        //this.updateInputType()
        //}
        //if (this.hasAttribute("value")) {
        //    this.setValue(this.getAttribute("value"))
        //}
        // if (this.hasAttribute("onEnterPressClickElementId")) {
        //    this.onEnterPressClickElementId = this.getAttribute("onEnterPressClickElementId")
        //}
        // if (this.hasAttribute("list")) {
        //    this.setListId(this.getAttribute("list"))
        //}
        // if (this.hasAttribute("placeholder")) {
        //    this.setPlaceHolder(this.getAttribute("placeholder"))
        //}
        // if (this.hasAttribute("icon")) {
        //    this.setIcon(this.getAttribute("icon"))
        //}
        // if (this.hasAttribute("isStrictList")) {
        //    this.setIsScrictList(this.getAttribute("isStrictList") == "true")
        //}
        this.updateInputType();
        this.doChangeCheck = this.hasAttribute("do-change-check");
        for (const attribute of HTMLFormInputElement.observedAttributes) {
            if (this.hasAttribute(attribute)) {
                this.attributeChangedCallback(attribute, "", this.getAttribute(attribute));
            }
        }
        if (!this.hasAttribute("minlength")) {
            this.minLength = 0;
        }
        if (!this.hasAttribute("maxlength")) {
            this.maxLength = -1;
        }
        this.disabled = this.hasAttribute("disabled");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        //console.log(name, oldValue, newValue);
        if (oldValue == newValue) {
            return;
        }
        if (name == "type") {
            this.type = newValue;
            this.updateInputType();
        }
        else if (name == "value") {
            this.value = newValue;
        }
        else if (name == "on-enter-press-click-element-id") {
            this.onEnterPressClickElementId = newValue;
        }
        else if (name == "placeholder") {
            this.placeholder = newValue;
        }
        else if (name == "icon") {
            this.icon = newValue;
        }
        else if (name == "is-strict-list") {
            this.isStrictList = this.hasAttribute("is-strict-list");
        }
        else if (name == "list") {
            this.listId = newValue;
        }
        else if (name == "is-case-sensitive-list") {
            this.isCaseSensitiveList = this.hasAttribute("is-case-sensitive-list");
        }
        else if (name == "original-value") {
            this.originalValue = newValue;
        }
        else if (name == "label") {
            this.label = newValue;
        }
        else if (name == "min") {
            this.min = newValue;
        }
        else if (name == "max") {
            this.max = newValue;
        }
        else if (name == "step") {
            this.step = newValue;
        }
        else if (name == "raw-value") {
            this.valueRaw = newValue;
        }
        else if (name == "name") {
            this.name = newValue;
        }
        else if (name == "minlength") {
            this.minLength = newValue;
        }
        else if (name == "maxlength") {
            this.maxLength = newValue;
        }
        else if (name == "multiple") {
            this.multiple = this.hasAttribute("multiple");
        }
        else if (name == "allow-empty-file") {
            this.allowNullFile = this.hasAttribute("allow-empty-file");
        }
    }
    get disabled() {
        return this.hasAttribute("disabled");
    }
    set disabled(disabled) {
        if (disabled) {
            this.setAttribute("disabled", "");
        }
        else {
            this.removeAttribute("disabled");
        }
        this.input.disabled = disabled;
        this.textArea.disabled = disabled;
        this.inputCheckbox.disabled = disabled;
        if (disabled) {
            this.img.setAttribute("disabled", "");
            this.afterImg.setAttribute("disabled", "");
        }
        else {
            this.img.removeAttribute("disabled");
            this.afterImg.removeAttribute("disabled");
        }
    }
    /*public checkValidity() {
        return this.internals.checkValidity();
    }

    public reportValidity() {
        return this.internals.reportValidity();
    }*/
    async validate() {
        var _a;
        this.setAttribute("value", this.valueRaw.toString());
        //Check for changes
        let changed = false;
        let validationMessage = "";
        if (this.value != this.originalValue && this.valueRaw != this.originalValue) {
            changed = true;
        }
        //Do validation
        let isValid = true;
        if (this.validationFunction != null) {
            isValid = await this.validationFunction(this.valueRaw);
        }
        if (isValid && this.isStrictList) {
            //console.log(this.options);
            //console.log(this.value);
            isValid = this.options.has(this.valueRaw.toString());
        }
        if (this.valueRaw.toString().length < this.minLength) {
            isValid = false;
        }
        if (this.valueRaw.toString().length > this.maxLength) {
            isValid = false;
        }
        //Check for validity
        if (this.type == "checkbox" || this.type == "radio") {
            const [changedLocal, validOk, validationMessageLocal] = this.inputCheckbox.validate();
            if (!validOk) {
                isValid = false;
                validationMessage = validationMessageLocal;
            }
            changed = changedLocal;
        }
        else if (this.type == "textarea") {
            if (!this.textArea.checkValidity()) {
                validationMessage = this.label + ": " + this.textArea.validationMessage;
                isValid = false;
                //this.internals.setValidity(this.textArea.validity,this.textArea.validationMessage,this.textArea)
            }
        }
        else {
            if (!this.input.checkValidity()) {
                if (!(this.type == "file" && ((_a = this.input.files) === null || _a === void 0 ? void 0 : _a.length) == 0 && this.allowNullFile)) {
                    isValid = false;
                    validationMessage = this.label + ": " + this.input.validationMessage;
                }
                //this.internals.setValidity(this.input.validity,this.input.validationMessage,this.input)
            }
        }
        //Add styles
        if (this.doChangeCheck) {
            if (changed) {
                this.holder.classList.add(this.changeBorderClass);
            }
            else {
                this.holder.classList.remove(this.changeBorderClass);
            }
        }
        if (isValid) {
            this.holder.classList.remove(this.invalidBorderClass);
            this.dispatchEvent(new Event("change"));
        }
        else {
            this.holder.classList.add(this.invalidBorderClass);
        }
        validationMessage = validationMessage.replace("::", ":");
        this.dispatchEvent(new Event("validation-done"));
        return [changed, isValid, validationMessage];
    }
    get valueRaw() {
        if (this.type == "textarea") {
            return this.textArea.value;
        }
        else if (this.type == "checkbox" || this.type == "radio") {
            return this.inputCheckbox.checked;
            //FIX
        }
        else {
            return this.input.value;
        }
    }
    /**
     * Get value retuns value of input
     * @returns Value is pair value in select options or null when not found in strictList mode or the value typed inside, if it is generic input
     */
    get value() {
        var _a;
        if (this.type == "file") {
            if (((_a = this.input.files) === null || _a === void 0 ? void 0 : _a.length) == 0) {
                return this.input.files.item(0);
            }
            return this.input.files;
        }
        const raw = this.type == "checkbox" || this.type == "radio" ? this.inputCheckbox.checked : this.valueRaw;
        //Check if is in select options
        if (this.options.has(raw.toString())) {
            return this.options.get(raw.toString());
        }
        if (this.isStrictList) {
            //Strict, but no value found
            return null;
        }
        //Normal value
        return raw;
    }
    set value(value) {
        if (this.type == "file") {
            if (value == null) {
                this.input.files = null;
                return;
            }
            else if (value instanceof FileList) {
                this.input.files = value;
                return;
            }
            else if (value == "") {
                this.input.value = "";
                return;
            }
            else {
                return;
            }
        }
        if (value == null) {
            this.value = "";
            return;
        }
        //!!!!! TODO: Add this.internals.setFormValue()
        //Check if is in select options
        //console.log("New value:", value, this.options);
        for (const element of this.options) {
            if (element[1] == (value === null || value === void 0 ? void 0 : value.toString())) {
                this.valueRaw = element[0];
                return;
            }
        }
        this.valueRaw = value === null || value === void 0 ? void 0 : value.toString();
    }
    set name(value) {
        this.input.name = "";
        this.textArea.name = "";
        this.inputCheckbox.name = "";
        if (this.type == "textarea") {
            this.textArea.name = value;
        }
        else if (this.type == "checkbox" || this.type == "radio") {
            this.inputCheckbox.name = value;
        }
        else {
            this.input.name = value;
        }
    }
    set valueRaw(value) {
        //const doChange = value != this.valueRaw
        if (this.type == "textarea") {
            this.textArea.value = value;
        }
        else if (this.type == "checkbox" || this.type == "radio") {
            this.inputCheckbox.checked = value == "true";
        }
        else {
            this.input.value = value;
        }
        this.setAttribute("value", value);
    }
    get type() {
        return this.typ;
    }
    set type(type) {
        this.typ = type;
        this.updateInputType();
        this.setAttribute("type", type);
    }
    get originalValueRaw() {
        const raw = this.originalValue;
        //Check if is in select options
        if (this.optionsReverse.has(raw)) {
            return this.optionsReverse.get(raw);
        }
        if (this.isStrictList) {
            //Strict, but no value found
            return null;
        }
        //Normal value
        return raw;
    }
    get originalValue() {
        return this.getAttribute("original-value");
    }
    set originalValue(originalValue) {
        if (this.type == "checkbox" || this.type == "radio") {
            this.inputCheckbox.originalChecked = originalValue == "true";
        }
        this.setAttribute("original-value", originalValue);
        this.validate();
    }
    get listId() {
        return this.getAttribute("list");
    }
    set listId(listId) {
        this.usingJSList = false;
        this.updateList();
        if (listId == null || listId == "") {
            this.removeAttribute("list");
        }
        else {
            this.setAttribute("list", listId);
        }
    }
    get placeholder() {
        if (this.type == "textarea") {
            return this.textArea.placeholder;
        }
        else {
            return this.input.placeholder;
        }
    }
    set placeholder(placeholder) {
        if (this.type == "textarea") {
            this.textArea.placeholder = placeholder;
        }
        else {
            this.input.placeholder = placeholder;
        }
        this.setAttribute("placeholder", placeholder);
    }
    get icon() {
        return this.img.hasAttribute("path") ? this.img.getAttribute("path") : "";
    }
    set icon(icon) {
        this.img.setAttribute("path", icon);
        this.img.src = GetFormIconPath(icon);
        this.setAttribute("icon", icon);
        if (this.setIconFromCode == 0) {
            this.updateInputType();
        }
    }
    get isStrictList() {
        return this.hasAttribute("is-strict-list");
    }
    set isStrictList(isStrictList) {
        if (this.type == "select") {
            isStrictList = true;
        }
        if (isStrictList) {
            this.setAttribute("is-strict-list", "");
        }
        else {
            this.removeAttribute("is-strict-list");
        }
        this.validate();
    }
    get options() {
        return this.optionsLocal;
    }
    /**
     * Sets options for input field
     * @param options Map<label, value> -> label is displayed, value is returned | string[] -> used as values and labels
     * @param timestamp
     */
    setOptions(options, timestamp = null) {
        this.usingJSList = true;
        if (timestamp != null) {
            if (timestamp <= this.optionsTimestamp) {
                return;
            }
            this.optionsTimestamp = timestamp;
        }
        if (options instanceof Map) {
            this.optionsLocal = options;
        }
        else {
            this.optionsLocal.clear();
            for (const element of options) {
                this.optionsLocal.set(element, element);
            }
        }
        this.removeAttribute("list");
        this.renderList();
    }
    get alwaysShownOptions() {
        return [...this.alwaysShownOptionsLocal.keys()];
    }
    set alwaysShownOptions(keys) {
        for (const key of keys) {
            this.alwaysShownOptionsLocal.set(key, true);
        }
        this.renderList();
    }
    get isCaseSensitiveList() {
        return this.hasAttribute("is-case-sensitive-list");
    }
    set isCaseSensitiveList(isCaseSensitiveList) {
        if (isCaseSensitiveList) {
            this.setAttribute("is-case-sensitive-list", "");
        }
        else {
            this.removeAttribute("is-case-sensitive-list");
        }
        this.renderList();
    }
    get label() {
        return this.labelElement.innerText;
    }
    set label(label) {
        this.labelElement.innerText = label;
        this.setAttribute("label", label);
    }
    set min(minimum) {
        this.input.min = minimum;
        this.setAttribute("min", minimum);
        this.validate();
    }
    set max(maximum) {
        this.input.max = maximum;
        this.setAttribute("max", maximum);
        this.validate();
    }
    get min() {
        return this.input.min;
    }
    get max() {
        return this.input.max;
    }
    set step(step) {
        this.input.step = step;
        this.setAttribute("step", step);
        this.validate();
    }
    set minLength(minimum) {
        if (minimum <= 0) {
            minimum = 0;
        }
        this.input.minLength = minimum;
        this.setAttribute("minlength", minimum.toString());
        this.validate();
    }
    set maxLength(maximum) {
        if (maximum <= 0) {
            this.input.removeAttribute('maxLength');
            this.validate();
            this.removeAttribute('maxlength');
            return;
        }
        this.input.maxLength = maximum;
        this.setAttribute("maxlength", maximum.toString());
        this.validate();
    }
    get minLength() {
        return this.input.minLength;
    }
    get maxLength() {
        return this.input.hasAttribute("maxLength") ? this.input.maxLength : Number.MAX_SAFE_INTEGER;
    }
    get multiple() {
        return this.input.multiple;
    }
    set multiple(multiple) {
        this.multiple = multiple;
    }
}
HTMLFormInputElement.formAssociated = true;
HTMLFormInputElement.observedAttributes = ["disabled", "label", "type", "name", "value", "on-enter-press-click-element-id", "list", "placeholder", "icon", "is-strict-list", "is-case-sensitive-list", "original-value", "min", "max", "step", "raw-value", "minlength", "maxlength", "multiple", "allow-empty-file"];
export function GenerateRandomColor() {
    const colorLetters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += colorLetters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//function createPreloadLink(resource: string): HTMLLinkElement {
//    const link = document.createElement("link")
//    link.rel = "preload"
//    link.href = resource
//    link.as = "image"
//    link.crossOrigin = "anonymous"
//    return link
//}
//const toastImages = new Map<string, HTMLImageElement>()
function SetupToasts() {
    const holder = document.createElement("div");
    holder.classList.add("formToastHolder");
    document.getElementsByTagName("body")[0].appendChild(holder);
    //Preload images
    //const imgOk = new Image()
    //imgOk.src = "/formWebScripts/images/checkCircle32.svg"
    //toastImages.set("ok", imgOk)
    //const imgInfo = new Image()
    //imgInfo.src = "/formWebScripts/images/info32.svg"
    //toastImages.set("info", imgInfo)
    //const imgWarn = new Image()
    //imgWarn.src = "/formWebScripts/images/warning32.svg"
    //toastImages.set("warn", imgWarn)
    //const imgError = new Image()
    //imgError.src = "/formWebScripts/images/report32.svg"
    //toastImages.set("error", imgError)
    //const head = document.getElementsByTagName("head")[0] as HTMLHeadElement
    //head.appendChild(createPreloadLink("/images/info32.svg"))
    //head.appendChild(createPreloadLink("/images/warning32.svg"))
    //head.appendChild(createPreloadLink("/images/report32.svg"))
    //head.appendChild(createPreloadLink("/images/checkCircle32.svg"))
}
let toastCounter = 0;
/**
 * Shows Toast based on parameters
 * @param title Title of Toast
 * @param message Content HTML message for Toast
 * @param type Type (color) of Toast
 * @param timeout Timeout for showing in seconds (10 = stays on screen for 10 seconds), set it to negative for letters per second (-7 for 7 letters per second)
 * @returns Id of Toast
 */
export function SendToast(title, message, type, timeout = -7) {
    toastCounter++;
    let toastId = toastCounter;
    if (timeout < 0) {
        timeout = Math.ceil((title.length + message.length) / -timeout);
    }
    timeout = Math.max(timeout, 10);
    //Get target color
    const colorDiv = document.createElement("div");
    if (type == "ok") {
        colorDiv.classList.add("formOkColor");
    }
    else if (type == "warn") {
        colorDiv.classList.add("formWarnColor");
    }
    else if (type == "info") {
        colorDiv.classList.add("formInfoColor");
    }
    else if (type == "error") {
        colorDiv.classList.add("formErrorColor");
    }
    else if (type == "black") {
        colorDiv.classList.add("formBlackColor");
    }
    colorDiv.style.width = "1px";
    colorDiv.style.height = "1px";
    colorDiv.style.position = "absolute";
    colorDiv.style.zIndex = "-100";
    document.getElementsByTagName("body")[0].appendChild(colorDiv);
    const style = getComputedStyle(colorDiv);
    //console.log(style)
    //Toast holder
    const toast = document.createElement("div");
    toast.classList.add("formToast");
    //toast.style.background = style.background
    toast.style.background = "color-mix(in srgb, #FFFFFF 20%, " + style.backgroundColor + " 100%)";
    //console.log(colorDiv.classList);
    //console.log(style.background)
    toast.setAttribute("toastId", String(toastId));
    toast.setAttribute("animationPart", "0");
    toast.addEventListener("click", function () {
        //console.log("click");
        toast.classList.add("remove");
        toast.setAttribute("animationPart", "2");
    });
    toast.addEventListener("animationend", function () {
        if (toast.getAttribute("animationPart") == "0" || toast.getAttribute("animationPart") == "1") {
            toast.setAttribute("animationPart", String(Number(toast.getAttribute("animationPart")) + 1));
        }
        else {
            toast.remove();
        }
    });
    const toastHolder = document.getElementsByClassName("formToastHolder")[0];
    if (toastHolder == null) {
        console.warn("No toast holder found, skipping toast.");
        return -1;
    }
    if (toastHolder.children.length == 0) {
        toastHolder.appendChild(toast);
    }
    else {
        const before = toastHolder.children.item(0);
        if (before == null) {
            toastHolder.appendChild(toast);
        }
        else {
            toastHolder.insertBefore(toast, before);
        }
    }
    //Timeout
    const timeoutElement = document.createElement("div");
    timeoutElement.classList.add("timeout");
    timeoutElement.style.background = "color-mix(in srgb, #000000 20%, " + style.backgroundColor + " 100%)";
    timeoutElement.style.animationDuration = timeout + "s";
    timeoutElement.addEventListener("animationend", function () {
        toast.classList.add("remove");
    });
    toast.appendChild(timeoutElement);
    //Title
    const titleEl = document.createElement("p");
    titleEl.classList.add("formHeader");
    titleEl.innerHTML = title;
    toast.appendChild(titleEl);
    //Content holder
    const content = document.createElement("div");
    content.classList.add("content");
    toast.appendChild(content);
    //Image holder
    const imgHolder = document.createElement("div");
    imgHolder.classList.add("formCenter");
    content.appendChild(imgHolder);
    //Image
    const img = document.createElement("img");
    if (type == "black") {
        //colorDiv.classList.add("formBlackColor")
        console.error("Undefined icon!");
    }
    else {
        img.src = GetFormIconPath("!status" + type[0].toUpperCase() + type.substring(1));
    }
    imgHolder.appendChild(img);
    //Text holder
    const pHolder = document.createElement("div");
    content.appendChild(pHolder);
    //Text
    const p = document.createElement("p");
    p.classList.add("contentText");
    p.innerHTML = message;
    pHolder.appendChild(p);
    colorDiv.remove();
    return toastId;
}
/*
Setups rows of form
*/
export function SetupRows() {
    const elements = document.getElementsByTagName("formrow");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.classList.add("formFlexColumn");
        if (element.hasAttribute("isFirst")) {
            element.style.marginTop = "0px";
        }
        //Move all elements
        const holder = document.createElement("div");
        holder.classList.add("formFlexRow");
        while (element.lastChild != null) {
            const child = element.childNodes[0];
            if (child.tagName == "INPUTFIELD") {
                child.style.flexGrow = "1";
            }
            element.removeChild(child);
            holder.appendChild(child);
        }
        //Create label
        if (element.hasAttribute("label")) {
            const label = document.createElement("p");
            label.innerHTML = element.getAttribute("label");
            element.appendChild(label);
        }
        element.appendChild(holder);
    }
}
export class DraggableElement {
    /**
     * Stops element from active dragging when dragged
     */
    StopDrag() {
        this.dragEndEvent(new MouseEvent("mouseup"));
    }
    /**
     * Disables dragging from selected element(s)
     */
    DisableDrag() {
        if (this.dragDisabled) {
            return;
        }
        this.dragDisabled = true;
        this.StopDrag();
        this.dragElement.removeEventListener("mousedown", this.dragStartEvent);
        this.movedElement.removeEventListener("mouseup", this.dragEndEvent);
        if (this.dragElement != this.movedElement) {
            this.dragElement.removeEventListener("mouseup", this.dragEndEvent);
        }
        this.movedElement.removeEventListener("mousemove", this.drag);
        if (this.dragElement != this.movedElement) {
            this.dragElement.removeEventListener("mousemove", this.drag);
        }
        if (this.moveAtBody) {
            document.body.removeEventListener("mousemove", this.drag);
            document.body.removeEventListener("touchmove", this.drag);
        }
    }
    /**
     * Enables dragging from selected element(s)
     */
    EnableDrag() {
        if (!this.dragDisabled) {
            return;
        }
        this.dragDisabled = false;
        this.dragElement.addEventListener("mousedown", this.dragStartEvent);
        this.movedElement.addEventListener("mouseup", this.dragEndEvent);
        this.dragElement.addEventListener("touchstart", this.dragStartEvent);
        this.movedElement.addEventListener("touchend", this.dragEndEvent);
        if (this.dragElement != this.movedElement) {
            this.dragElement.addEventListener("mouseup", this.dragEndEvent);
            this.dragElement.addEventListener("touchend", this.dragEndEvent);
        }
        this.movedElement.addEventListener("mousemove", this.drag);
        this.movedElement.addEventListener("touchmove", this.drag);
        if (this.dragElement != this.movedElement) {
            this.dragElement.addEventListener("mousemove", this.drag);
            this.dragElement.addEventListener("touchmove", this.drag);
        }
        if (this.moveAtBody) {
            document.body.addEventListener("mousemove", this.drag);
            document.body.addEventListener("touchmove", this.drag);
        }
    }
    /**
     * Changes moved element
     * @param movedElement Target element
     * @param sameDragElement If target element should start dragging
     */
    ChangeMovedElement(movedElement, sameDragElement) {
        this.DisableDrag();
        this.movedElement = movedElement;
        if (sameDragElement) {
            this.dragElement = movedElement;
        }
        this.EnableDrag();
    }
    /**
     * Chnages drag element
     * @param dragElement What element starts dragging, null = uses same as movedElement
     */
    ChangeDragElement(dragElement) {
        this.DisableDrag();
        if (dragElement == null) {
            this.dragElement = this.movedElement;
        }
        else {
            this.dragElement = dragElement;
        }
        this.EnableDrag();
    }
    constructor(movedElement, dragElement, moveAtBody = false) {
        /**
         * Starts moving element based on mouse position
         * @param event Mouse event
         */
        this.dragStartEvent = (event) => {
            if (this.isDragging) {
                return;
            }
            //Start drag
            this.isDragging = true;
            this.lastCursor = this.dragElement.style.cursor;
            this.dragElement.style.cursor = "move";
            if (event instanceof MouseEvent) {
                this.lastDragX = event.clientX;
                this.lastDragY = event.clientY;
            }
            else {
                this.lastDragX = event.touches[0].clientX;
                this.lastDragY = event.touches[0].clientY;
            }
        };
        /**
         * Stops moving element based on mouse position
         * @param event Mouse event
         */
        this.dragEndEvent = (event) => {
            //End drag
            this.isDragging = false;
            if (this.dragElement != null) {
                this.dragElement.style.cursor = this.lastCursor;
            }
            this.lastDragX = 0;
            this.lastDragY = 0;
            this.lastCursor = "";
        };
        /**
         * Sets position of element based on mouse cursor position
         * @param event Mouse event
         */
        this.drag = (event) => {
            //Drag
            if (!this.isDragging) {
                return;
            }
            let posX = 0;
            let posY = 0;
            if (event instanceof MouseEvent) {
                posX = this.lastDragX - event.clientX;
                posY = this.lastDragY - event.clientY;
            }
            else {
                posX = this.lastDragX - event.touches[0].clientX;
                posY = this.lastDragY - event.touches[0].clientY;
            }
            if (event instanceof MouseEvent) {
                this.lastDragX = event.clientX;
                this.lastDragY = event.clientY;
            }
            else {
                this.lastDragX = event.touches[0].clientX;
                this.lastDragY = event.touches[0].clientY;
            }
            this.movedElement.style.left = this.movedElement.offsetLeft - posX + "px";
            this.movedElement.style.top = this.movedElement.offsetTop - posY + "px";
        };
        this.movedElement = movedElement;
        this.moveAtBody = moveAtBody;
        if (dragElement == null) {
            dragElement = movedElement;
        }
        this.dragElement = dragElement;
        this.dragDisabled = true;
        this.isDragging = false;
        this.lastCursor = "";
        this.lastDragX = 0;
        this.lastDragY = 0;
        this.EnableDrag();
    }
}
/**
 * Makes HTML element dragable
 * @param movedElement Moved element
 * @param dragElement Element that acts as dragger (topbar of window, ...)
 */
export function MakeElementDraggable(movedElement, dragElement, moveAtBody = false) {
    return new DraggableElement(movedElement, dragElement, moveAtBody);
}
/**
 * FormIconsDB is map for internal icons, you can use !iconName for automatic translation using this DB.
 * It loads internal DB file and external specified in meta: <meta name="form-icons-db" content="path">
 */
export let formIconsDB = new Map();
let ranSetupFormIcons = false;
async function SetupFormIcons() {
    if (ranSetupFormIcons) {
        return;
    }
    const loadDB = async (dbFile) => {
        const split = dbFile.split("/");
        const path = dbFile.substring(0, dbFile.length - split[split.length - 1].length);
        const request = await fetch(dbFile);
        if (request.status != 200) {
            console.error("Missing " + dbFile + " DB!");
        }
        else {
            const db = await request.json();
            for (const key in db) {
                formIconsDB.set(key, path + db[key]);
            }
        }
    };
    //Load DB main
    const metaElement1 = document.querySelector('meta[name="form-icons-main-db"]');
    if (metaElement1 != null) {
        await loadDB(metaElement1.content);
    }
    else {
        console.warn("No FormWebScripts icons DB provided!");
    }
    //Load DB meta
    const metaElement2 = document.querySelector('meta[name="form-icons-db"]');
    if (metaElement2 != null) {
        await loadDB(metaElement2.content);
    }
    console.log("Registered icons:", formIconsDB);
    //Setup function
    const update = (target) => {
        var _a;
        const holder = target.querySelector(":scope > [form-icon-holder]");
        if (!target.hasAttribute("form-icon") || target.getAttribute("form-icon") == "") {
            //Empty icon = delete
            if (holder != null) {
                holder.remove();
                return;
            }
            return;
        }
        //Create or update
        if (holder == null) {
            //Create element
            const img = document.createElement("img");
            img.setAttribute("form-icon-holder", "");
            img.src = GetFormIconPath(target.getAttribute("form-icon"));
            if (target instanceof HTMLButtonElement || target instanceof HTMLTableCellElement) {
                if (target.children.length == 0) {
                    target.appendChild(img);
                }
                else {
                    target.insertBefore(img, target.children.item(0));
                }
            }
            else {
                (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(img, target);
            }
        }
        else {
            holder.src = GetFormIconPath(target.getAttribute("form-icon"));
        }
    };
    //Setup observer
    const formIconObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "attributes" && mutation.attributeName === "form-icon") {
                const target = mutation.target;
                update(target);
            }
        }
    });
    formIconObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["form-icon"],
        subtree: true,
    });
    //Setup existing
    const elements = document.querySelectorAll("[form-icon]");
    for (const element of elements) {
        update(element);
    }
    const inputs = document.querySelectorAll("form-input");
    for (const element of inputs) {
        const input = element;
        input.icon = input.icon;
    }
    ranSetupFormIcons = true;
}
/**
 * GetFormIcon gets icon
 * @param path If path starts with !, it will be used as name for DB, else it is used as path
 * @returns Path for img src
 */
function GetFormIconPath(path) {
    //Get real path
    if (path == undefined) {
        return "";
    }
    if (path.startsWith("!")) {
        path = formIconsDB.get(path.substring(1));
    }
    if (path == undefined) {
        return "";
    }
    return path;
}
//SetupTextInputs()
//SetupToggles()
customElements.define("form-box", HTMLFormBoxElement);
customElements.define("form-toggle", HTMLFormToggleElement);
customElements.define("form-input", HTMLFormInputElement);
SetupFormIcons();
SetupToasts();
SetupRows();
//# sourceMappingURL=formScript.js.map