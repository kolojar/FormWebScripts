import { GetFormIconPath } from "./formScript.js";
import { HTMLFormToggleElement } from "./formToggle.js";
import { ContainsText, FormatDateForDateTimeLocalInput, GenerateRandomColor, ValidateEmail } from "./sharedScripts.js";
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
            if (this.type == "email") {
                if (!ValidateEmail(this.value)) {
                    isValid = false;
                }
            }
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
        return new Promise((resolve, _) => { resolve([changed, isValid, validationMessage]); });
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
    get step() {
        return this.hasAttribute("step") ? this.getAttribute("step") : "1";
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
        if (maximum <= 0 || isNaN(maximum)) {
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
    /**
     * Sets date and time in valid format for input
     * @param datetime Converted from object to local time
     */
    SetDateTimeLocal(datetime) {
        this.value = FormatDateForDateTimeLocalInput(datetime);
        this.validate();
    }
}
HTMLFormInputElement.formAssociated = true;
HTMLFormInputElement.observedAttributes = ["disabled", "label", "type", "name", "value", "on-enter-press-click-element-id", "list", "placeholder", "icon", "is-strict-list", "is-case-sensitive-list", "original-value", "min", "max", "step", "raw-value", "minlength", "maxlength", "multiple", "allow-empty-file"];
customElements.define("form-input", HTMLFormInputElement);
//# sourceMappingURL=formInput.js.map