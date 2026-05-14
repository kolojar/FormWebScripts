//Do not forget to add formStyle.css and tableStyle.css
import { GeneratePassword } from "./sharedScripts.js";
/*
Disables element and all subelements without attribute disableRecursiveDisable
 */
export function RecursiveDisabler(target, disabled) {
    for (let index = 0; index < target.children.length; index++) {
        const element = target.children[index];
        RecursiveDisabler(element, disabled);
    }
    if (!target.hasAttribute("disableRecursiveDisable")) {
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
        const messageID = GeneratePassword(8, true, true);
        this.messageID = messageID;
        this.querySelectorAll("form-status-message").forEach(element => {
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
    document.querySelectorAll("form-box").forEach(form => {
        form.SetWaitStatusMessage(message);
    });
}
/**
 * Removes wait status from wall forms in document
 */
export function RemoveWaitStatusForms() {
    document.querySelectorAll("form-box").forEach(form => {
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
    //protected checked: boolean
    constructor() {
        super();
        this.originalValue = false;
        //this.checked = false
        //Create elements
        this.labelBefore = document.createElement("label");
        this.holder = document.createElement("label");
        this.input = document.createElement("input");
        this.slider = document.createElement("span");
        this.labelAfter = document.createElement("label");
        //Add classes
        this.classList.add("formSwitch");
        this.labelAfter.classList.add("labelBefore");
        this.holder.classList.add("toggle");
        this.slider.classList.add("slider");
        this.labelAfter.classList.add("labelAfter");
        //Move children
        this.appendChild(this.labelBefore);
        this.appendChild(this.holder);
        this.holder.appendChild(this.input);
        this.holder.appendChild(this.slider);
        this.holder.appendChild(this.labelAfter);
        //Setup basic events
        this.addEventListener("mousedown", () => {
            console.log("Click", this.input.checked);
            this.setValue(!this.getValue());
            this.input.dispatchEvent(new Event("change"));
            this.dispatchEvent(new Event("change"));
            this.updateSwitch();
        });
        this.addEventListener("keydown", (ev) => {
            if (ev.code === "Space") {
                console.log("Click");
                this.setValue(!this.getValue());
                this.input.dispatchEvent(new Event("change"));
                this.dispatchEvent(new Event("change"));
                this.updateSwitch();
            }
        });
        this.input.addEventListener("change", () => {
            this.updateSwitch();
        });
    }
    connectedCallback() {
        this.labelBefore.innerText = this.getAttribute("labelBefore");
        this.labelAfter.innerText = this.getAttribute("labelAfter");
        this.originalValue = this.getAttribute("original-value") == "true";
        this.setValue(this.getAttribute("checked") == "true");
    }
    updateSwitch() {
        //Switch color and do the animation
        let onColorClass = this.getAttribute("onColorClass");
        let offColorClass = this.getAttribute("offColorClass");
        if (this.input.checked) {
            this.slider.classList.add(onColorClass);
            this.slider.classList.remove(offColorClass);
            this.holder.classList.add("formSwitchChecked");
        }
        else {
            this.slider.classList.remove(onColorClass);
            this.slider.classList.add(offColorClass);
            this.holder.classList.remove("formSwitchChecked");
        }
        //Handle enables target document
        if (this.hasAttribute("enables")) {
            const enables = document.getElementById(this.getAttribute("enables"));
            if (enables != null) {
                if (!this.input.checked) {
                    enables.setAttribute("disabled", "");
                    console.log("Disabled");
                }
                else {
                    enables.removeAttribute("disabled");
                    console.log("Enable");
                }
            }
        }
        //Update this element
        //this.checked = this.input.checked
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue) {
            return;
        }
        if (name == "value") {
            this.setValue(newValue == "true");
        }
        else if (name == "labelBefore") {
            this.labelBefore.innerText = newValue;
        }
        else if (name == "labelAfter") {
            this.labelAfter.innerText = newValue;
        }
        else if (name == "original-value") {
            this.originalValue = newValue == "true";
        }
    }
    getValue() {
        return this.input.checked;
    }
    setValue(value) {
        this.setAttribute("value", value ? "true" : "false");
        this.input.checked = value;
        this.updateSwitch();
    }
    validate() {
        return [this.originalValue != this.getValue(), true];
    }
    getOriginalValue() {
        return this.originalValue;
    }
    getLabel(before = true) {
        if (before) {
            return this.labelBefore.innerText;
        }
        else {
            return this.labelAfter.innerText;
        }
    }
}
HTMLFormToggleElement.observedAttributes = ['value', 'labelBefore', 'labelAfter', 'original-value'];
/**
 * HTMLFormInputElement element defition.
 * Sends event validation-done on complete validation.
 */
export class HTMLFormInputElement extends HTMLElement {
    constructor(onEnterPressClickElementId, validationFunction, listId = "", strictList = false, doChangeCheck = false, originalValue = "", changeBorderClass = "formWarnBorderColor", invalidBorderClass = "formErrorBorderColor") {
        super();
        this.changeBorderClass = "formWarnBorderColor";
        this.invalidBorderClass = "formErrorBorderColor";
        this.listId = "";
        this.isStrictList = false;
        this.usingJSList = false;
        this.areOptionsVisible = false;
        this.onEnterPressClickElementId = onEnterPressClickElementId;
        this.type = "text";
        this.validationFunction = validationFunction;
        this.doChangeCheck = doChangeCheck;
        this.originalValue = originalValue;
        this.changeBorderClass = changeBorderClass;
        this.invalidBorderClass = invalidBorderClass;
        this.listId = listId;
        this.isStrictList = strictList;
        this.options = new Map();
        this.optionsTimestamp = new Date(0);
        this.isCaseSensitiveList = true;
        //Create elements
        this.holder = document.createElement("div");
        this.img = document.createElement("img");
        this.input = document.createElement("input");
        this.textArea = document.createElement("textarea");
        this.afterImg = document.createElement("img");
        this.listHolder = document.createElement("div");
        this.label = document.createElement("label");
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
        this.appendChild(this.label);
        this.appendChild(this.holder);
        this.appendChild(this.listHolder);
        //Setup basic events
        this.addEventListener("focusin", () => {
            console.log("Focus in");
            this.areOptionsVisible = true;
            this.renderList();
            if (!this.classList.contains("formInputFocus")) {
                this.classList.add("formInputFocus");
            }
            try {
                this.input.showPicker();
            }
            catch (error) {
                console.warn("Ignoring error: " + error);
            }
        });
        this.addEventListener("focusout", () => {
            console.log("Focus out");
            this.areOptionsVisible = false;
            this.listHolder.style.display = "none";
            if (this.classList.contains("formInputFocus")) {
                this.classList.remove("formInputFocus");
            }
            this.validate();
        });
        this.addEventListener("keydown", (ev) => {
            var _a;
            if (this.onEnterPressClickElementId == "") {
                return;
            }
            if (ev.key == "Enter") {
                (_a = document.getElementById(this.onEnterPressClickElementId)) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event("click"));
            }
        });
        this.addEventListener("click", () => {
            if (this.type == "textarea") {
                this.textArea.focus();
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
    }
    updateList() {
        //Clear list
        if (this.usingJSList) {
            return;
        }
        this.options.clear();
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
            }
        }
        this.renderList();
    }
    renderList() {
        console.log("Render list");
        if (this.options.size == 0 || !this.areOptionsVisible) {
            console.log("Render list cancel");
            return;
        }
        console.log(this.options);
        this.listHolder.style.display = "";
        //Clear list
        while (this.listHolder.lastChild != null) {
            this.listHolder.lastChild.remove();
            console.log("Clearing");
        }
        //Update list
        console.log("isCaseSensitive", this.isCaseSensitiveList);
        for (const value of this.options) {
            const contains = (this.isCaseSensitiveList ? value[0] : value[0].toLowerCase()).includes((this.isCaseSensitiveList ? this.getValueRaw() : this.getValueRaw().toLocaleLowerCase()));
            console.log(value, contains);
            if (contains) {
                const optionDiv = document.createElement("div");
                const option = document.createElement("p");
                option.innerText = value[0];
                optionDiv.addEventListener("mousedown", () => {
                    console.log("Clicked on: " + value);
                    this.setValueRaw(value[0]);
                    this.areOptionsVisible = false;
                    this.listHolder.style.display = "none";
                    //this.renderList()
                    console.log(this.listHolder.style.display);
                });
                optionDiv.appendChild(option);
                this.listHolder.appendChild(optionDiv);
            }
        }
    }
    updateInputType() {
        //Select input element based on type
        const focused = this.classList.contains("formInputFocus");
        if (this.input.parentElement == this) {
            this.holder.removeChild(this.input);
        }
        if (this.textArea.parentElement == this) {
            this.holder.removeChild(this.textArea);
        }
        if (this.afterImg.parentElement == this.holder) {
            this.holder.removeChild(this.afterImg);
        }
        if (this.type == "textarea") {
            this.holder.appendChild(this.textArea);
            if (focused) {
                this.textArea.focus();
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
            this.setIsScrictList(true);
        }
        this.holder.appendChild(this.afterImg);
        //Add specific use cases
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
        }
        else if (this.type == "color") {
            //Random color generator
            this.afterImg.src = "/formWebScripts/images/casino32.svg";
            this.afterImg.onclick = () => {
                this.input.value = GenerateRandomColor();
            };
        }
        else {
            this.afterImg.src = "";
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
        if (this.hasAttribute("do-change-check")) {
            this.doChangeCheck = this.getAttribute("do-change-check") == "true";
        }
        for (const attribute of HTMLFormInputElement.observedAttributes) {
            if (this.hasAttribute(attribute)) {
                this.setAttribute(attribute, this.getAttribute(attribute));
            }
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, oldValue, newValue);
        if (oldValue == newValue) {
            return;
        }
        if (name == "type") {
            this.type = newValue;
            this.updateInputType();
        }
        else if (name == "value") {
            this.setValue(newValue, true);
        }
        else if (name == "on-enter-press-click-element-id") {
            this.onEnterPressClickElementId = newValue;
        }
        else if (name == "placeholder") {
            this.setPlaceHolder(newValue);
        }
        else if (name == "icon") {
            this.setIcon(newValue);
        }
        else if (name == "is-strict-list") {
            this.setIsScrictList(newValue == "true");
        }
        else if (name == "list") {
            this.setListId(newValue);
        }
        else if (name == "is-case-sensitive-list") {
            this.setIsCaseSensitiveList(newValue == "true");
        }
        else if (name == 'original-value') {
            this.setOriginalValue(newValue);
        }
        else if (name == 'label') {
            this.setLabel(newValue);
        }
        else if (name == 'min') {
            this.setMinimum(newValue);
        }
        else if (name == 'max') {
            this.setMaximum(newValue);
        }
        else if (name == 'step') {
            this.setStep(newValue);
        }
        else if (name == 'raw-value') {
            this.setValueRaw(newValue, true);
        }
    }
    async validate() {
        this.setAttribute("value", this.getValueRaw());
        //Check for changes
        let changed = false;
        if (this.getValue() != this.originalValue && this.getValueRaw() != this.originalValue) {
            changed = true;
        }
        //Do validation
        let isValid = true;
        if (this.validationFunction != null) {
            isValid = await this.validationFunction(this.getValueRaw());
        }
        if (isValid && this.isStrictList) {
            console.log(this.options);
            console.log(this.getValue());
            isValid = this.options.has(this.getValueRaw());
        }
        //Check for validity
        if (!this.input.checkValidity()) {
            isValid = false;
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
        }
        else {
            this.holder.classList.add(this.invalidBorderClass);
        }
        this.dispatchEvent(new Event("validation-done"));
        return [changed, isValid];
    }
    getValueRaw() {
        if (this.type == "textarea") {
            return this.textArea.value;
        }
        else {
        }
        return this.input.value;
    }
    /**
     * Get value retuns value of input
     * @returns Value is pair value in select options or null when not found in strictList mode or the value typed inside, if it is generic input
     */
    getValue() {
        if (this.type == "file") {
            return this.input.files;
        }
        const raw = this.getValueRaw();
        //Check if is in select options
        if (this.options.has(raw)) {
            return this.options.get(raw);
        }
        if (this.isStrictList) {
            //Strict, but no value found
            return null;
        }
        //Normal value
        return raw;
    }
    setValue(value, calledFromProperty) {
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
        //Check if is in select options
        console.log("New value:", value, this.options);
        for (const element of this.options) {
            if (element[1] == value) {
                this.setValueRaw(element[0], calledFromProperty);
                return;
            }
        }
        this.setValueRaw(value, calledFromProperty);
    }
    setValueRaw(value, calledFromProperty = false) {
        if (this.type == "textarea") {
            this.textArea.value = value;
        }
        else {
            this.input.value = value;
        }
        if (!calledFromProperty) {
            this.setAttribute("value", value);
        }
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
        this.updateInputType();
        this.setAttribute("type", type);
    }
    getOriginalValueRaw() {
        return this.originalValue;
    }
    getOriginalValue() {
        return this.originalValue;
    }
    setOriginalValue(originalValue) {
        this.originalValue = originalValue;
        this.setAttribute("original-value", originalValue);
        this.validate();
    }
    getListId() {
        return this.listId;
    }
    setListId(listId) {
        this.listId = listId;
        this.usingJSList = false;
        this.updateList();
        this.setAttribute("list", listId);
    }
    getPlaceHolder() {
        if (this.type == "textarea") {
            return this.textArea.placeholder;
        }
        else {
            return this.input.placeholder;
        }
    }
    setPlaceHolder(placeholder) {
        if (this.type == "textarea") {
            this.textArea.placeholder = placeholder;
        }
        else {
            this.input.placeholder = placeholder;
        }
        this.setAttribute("placeholder", placeholder);
    }
    getIcon() {
        return this.img.src;
    }
    setIcon(icon) {
        this.img.src = icon;
        this.setAttribute("icon", icon);
    }
    getIsStrictList() {
        return this.isStrictList;
    }
    setIsScrictList(isStrictList) {
        if (this.type == "select") {
            isStrictList = true;
        }
        this.isStrictList = isStrictList;
        this.setAttribute("isStrictList", isStrictList ? "true" : "false");
        this.validate();
    }
    getOptions() {
        return this.options;
    }
    /**
     * Sets options for input field
     * @param options Map<label, value> -> label is displayed, value is returned | string[] -> used as values and labels
     * @param timestamp
     */
    setOptions(options, timestamp = null) {
        this.usingJSList = true;
        if (timestamp != null && timestamp > this.optionsTimestamp) {
            this.optionsTimestamp = timestamp;
            if (options instanceof Map) {
                this.options = options;
            }
            else {
                this.options.clear();
                for (const element of options) {
                    this.options.set(element, element);
                }
            }
            this.removeAttribute("list");
            this.renderList();
        }
    }
    getIsCaseSensitiveList() {
        return this.isCaseSensitiveList;
    }
    setIsCaseSensitiveList(isCaseSensitiveList) {
        this.isCaseSensitiveList = isCaseSensitiveList;
        this.setAttribute("isCaseSensitiveList", isCaseSensitiveList ? "true" : "false");
        this.renderList();
    }
    getLabel() {
        return this.label.innerText;
    }
    setLabel(label) {
        this.label.innerText = label;
        this.setAttribute("label", label);
    }
    setMinimum(minimum) {
        this.input.min = minimum;
        this.setAttribute("min", minimum);
        this.validate();
    }
    setMaximum(maximum) {
        this.input.max = maximum;
        this.setAttribute("max", maximum);
        this.validate();
    }
    getMinimum() {
        return this.input.min;
    }
    getMaximum() {
        return this.input.max;
    }
    setStep(step) {
        this.input.step = step;
        this.setAttribute("step", step);
        this.validate();
    }
}
HTMLFormInputElement.observedAttributes = ['label', 'type', 'value', 'on-enter-press-click-element-id', 'list', 'placeholder', 'icon', 'is-strict-list', 'is-case-sensitive-list', 'original-value', 'min', 'max', 'step', 'raw-value'];
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
const toastImages = new Map();
function SetupToasts() {
    const holder = document.createElement("div");
    holder.classList.add("formToastHolder");
    document.getElementsByTagName("body")[0].appendChild(holder);
    //Preload images
    const imgOk = new Image();
    imgOk.src = "/formWebScripts/images/checkCircle32.svg";
    toastImages.set("ok", imgOk);
    const imgInfo = new Image();
    imgInfo.src = "/formWebScripts/images/info32.svg";
    toastImages.set("info", imgInfo);
    const imgWarn = new Image();
    imgWarn.src = "/formWebScripts/images/warning32.svg";
    toastImages.set("warn", imgWarn);
    const imgError = new Image();
    imgError.src = "/formWebScripts/images/report32.svg";
    toastImages.set("error", imgError);
    //const head = document.getElementsByTagName("head")[0] as HTMLHeadElement
    //head.appendChild(createPreloadLink("/images/info32.svg"))
    //head.appendChild(createPreloadLink("/images/warning32.svg"))
    //head.appendChild(createPreloadLink("/images/report32.svg"))
    //head.appendChild(createPreloadLink("/images/checkCircle32.svg"))
}
let toastCounter = 0;
export function SendToast(title, message, type) {
    var _a;
    toastCounter++;
    let toastId = toastCounter;
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
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards";
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
    document.getElementsByClassName("formToastHolder")[0].appendChild(toast);
    //Timeout
    const timeout = document.createElement("div");
    timeout.classList.add("timeout");
    timeout.style.background = "color-mix(in srgb, #000000 20%, " + style.backgroundColor + " 100%)";
    timeout.addEventListener("animationend", function () {
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards";
    });
    toast.appendChild(timeout);
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
        img.src = (_a = toastImages.get(type)) === null || _a === void 0 ? void 0 : _a.src;
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
    toast.style.animation = "slideInFromRight 0.5s ease-out forwards";
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
        if (this.dragElement != this.movedElement) {
            this.dragElement.addEventListener("mouseup", this.dragEndEvent);
        }
        this.movedElement.addEventListener("mousemove", this.drag);
        if (this.dragElement != this.movedElement) {
            this.dragElement.addEventListener("mousemove", this.drag);
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
    constructor(movedElement, dragElement) {
        /**
         * Starts moving element based on mouse position
         * @param event Mouse event
         */
        this.dragStartEvent = (event) => {
            if (this.movedElement.getAttribute("formIsDragged") == "true") {
                return;
            }
            //Start drag
            this.movedElement.setAttribute("formIsDragged", "true");
            this.movedElement.setAttribute("formDragLastCursor", this.dragElement.style.cursor);
            this.dragElement.style.cursor = "move";
            this.movedElement.setAttribute("formDragLastX", event.clientX.toString());
            this.movedElement.setAttribute("formDragLastY", event.clientY.toString());
        };
        /**
        * Stops moving element based on mouse position
        * @param event Mouse event
        */
        this.dragEndEvent = (event) => {
            //End drag
            this.movedElement.removeAttribute("formIsDragged");
            if (this.dragElement != null) {
                this.dragElement.style.cursor = this.movedElement.getAttribute("formDragLastCursor");
            }
            this.movedElement.removeAttribute("formDragLastCursor");
            this.movedElement.removeAttribute("formDragLastX");
            this.movedElement.removeAttribute("formDragLastY");
        };
        /**
         * Sets position of element based on mouse cursor position
         * @param event Mouse event
         */
        this.drag = (event) => {
            //Drag
            if (this.movedElement.getAttribute("formIsDragged") != "true") {
                return;
            }
            let posX = Number(this.movedElement.getAttribute("formDragLastX")) - event.clientX;
            let posY = Number(this.movedElement.getAttribute("formDragLastY")) - event.clientY;
            this.movedElement.setAttribute("formDragLastX", event.clientX.toString());
            this.movedElement.setAttribute("formDragLastY", event.clientY.toString());
            this.movedElement.style.left = (this.movedElement.offsetLeft - posX) + "px";
            this.movedElement.style.top = (this.movedElement.offsetTop - posY) + "px";
        };
        this.movedElement = movedElement;
        if (dragElement == null) {
            dragElement = movedElement;
        }
        this.dragElement = dragElement;
        this.dragDisabled = false;
        this.EnableDrag();
    }
}
/**
 * Makes HTML element dragable
 * @param movedElement Moved element
 * @param dragElement Element that acts as dragger (topbar of window, ...)
 */
export function MakeElementDraggable(movedElement, dragElement) {
    return new DraggableElement(movedElement, dragElement);
}
SetupRows();
//SetupTextInputs()
//SetupToggles()
SetupToasts();
customElements.define("form-toggle", HTMLFormToggleElement);
customElements.define("form-input", HTMLFormInputElement);
//# sourceMappingURL=formScript.js.map