import { GlobalLanguageManager, SendToast } from "./formScript.js";
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
                console.log("Click");
                this.checked = !this.checked;
                this.input.dispatchEvent(new Event("change"));
                this.dispatchEvent(new Event("change"));
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
        for (const attribute of HTMLFormToggleElement.observedAttributes) {
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
customElements.define("form-toggle", HTMLFormToggleElement);
//# sourceMappingURL=formToggle.js.map