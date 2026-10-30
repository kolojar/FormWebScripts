import { GlobalLanguageManager, SendToast } from "./formScript.js";

/*
HTMLFormToggleElement element defition
*/
export class HTMLFormToggleElement extends HTMLElement {
	readonly labelBeforeElement: HTMLLabelElement;
	readonly holder: HTMLLabelElement;
	readonly input: HTMLInputElement;
	readonly slider: HTMLSpanElement;
	readonly labelAfterElement: HTMLLabelElement;
	private isRadioLocal: boolean;
	private silentValidation: number = 0;
	public disableEvents: boolean;
	public silenceValidation: number = 0;
	//public activeValue: any
	//public notActiveValue: any
	constructor() {
		super();
		this.isRadioLocal = false;
		this.disableEvents = false;

		//Create elements
		this.labelBeforeElement = document.createElement("label");
		this.holder = document.createElement("label");
    this.input = document.createElement("input");
    this.input.readOnly = true;
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
		this.addEventListener("keydown", (ev: KeyboardEvent) => {
			if (this.disabled) {
				return;
			}
			if (ev.code === "Space") {
				console.log("Click");
				this.checked = !this.checked
				this.input.dispatchEvent(new Event("change"))
				this.dispatchEvent(new Event("change"))
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
				this.attributeChangedCallback(attribute, "", this.getAttribute(attribute) as string);
			}
		}
		const indeterminate = this.indeterminate;
		this.originalChecked = (this.getAttribute("original-checked") as string) == "true";
		this.checked = this.hasAttribute("checked");
		this.isRadio = this.getAttribute("type") == "radio" || this.hasAttribute("is-radio");
		this.indeterminate = indeterminate;
	}

	updateSwitch() {
		//Switch color and do the animation
		//console.log("Switch", this.input.checked);
		if (this.input.checked) {
			this.holder.classList.add("formSwitchChecked");
		} else {
			this.holder.classList.remove("formSwitchChecked");
		}

		//Handle enables target document
		if (this.hasAttribute("enables")) {
			const enables = document.getElementById(this.getAttribute("enables") as string);
			if (enables != null) {
				if (!this.input.checked) {
					enables.setAttribute("disabled", "");
					//console.log("Disabled");
				} else {
					enables.removeAttribute("disabled");
					//console.log("Enable");
				}
			}
		}

		//Update this element
		//this.checked = this.input.checked
	}

	static observedAttributes = ["label-before", "label", "original-checked", "checked", "name", "is-radio", "value", "indeterminate"];
	attributeChangedCallback(name: string, oldValue: any, newValue: any) {
		//console.log(name, oldValue, newValue);
		if (oldValue == newValue) {
			return;
		}
		if (name == "label-before") {
			this.labelBefore = newValue;
		} else if (name == "label") {
			this.label = newValue;
		} else if (name == "original-checked") {
			this.originalChecked = (newValue as string) == "true";
		} else if (name == "checked") {
			this.checked = this.hasAttribute("checked");
		} else if (name == "name") {
			this.name = newValue;
		} else if (name == "is-radio") {
			this.isRadio = this.hasAttribute("is-radio");
		} else if (name == "value") {
			this.value = newValue;
		} else if (name == "indeterminate") {
			this.indeterminate = this.hasAttribute("indeterminate");
		}
	}

	public get checked(): boolean {
		return this.input.checked;
	}

	public set checked(checked: boolean) {
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
						if (element.checked && element != this) someChecked = true;
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
		} else {
			this.removeAttribute("checked");
		}
		if (!this.disableEvents) {
			this.input.dispatchEvent(new Event("change"));
			this.dispatchEvent(new Event("change"));
		}
		this.updateSwitch();
		this.validate();
	}

	public validate(): [changed: boolean, isValid: boolean, validationMessage: string] {
		const limiter = document.querySelector('[form-toggle-limiter="' + this.name + '"]');
		let valid = true;
		let validationMessage = "";
		if (limiter != null) {
			if (!limiter.hasAttribute("form-toggle-limiter-disabled")) {
				const min = limiter.getAttribute("min");
				const max = limiter.getAttribute("max");
				if (min != null || max != null) {
					const checked: HTMLFormToggleElement[] = [];
					const unchecked: HTMLFormToggleElement[] = [];
					for (const element of document.getElementsByName(this.name)) {
						if (element instanceof HTMLFormToggleElement) {
							element.disabled = false;
							if (element.checked) {
								checked.push(element);
							} else {
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

	public get originalChecked(): boolean {
		return this.getAttribute("original-checked") == "true";
	}

	public set originalChecked(originalChecked: boolean) {
		this.setAttribute("original-checked", originalChecked ? "true" : "false");
	}

	public get label(): string {
		return this.labelAfterElement.innerText;
	}

	public get labelBefore(): string {
		return this.labelBeforeElement.innerText;
	}

	public set label(label: string) {
		this.labelAfterElement.innerText = label;
	}

	public set labelBefore(label: string) {
		this.labelBeforeElement.innerText = label;
	}

	public get disabled(): boolean {
		return this.hasAttribute("disabled");
	}

	public set disabled(disabled: boolean) {
		if (disabled) {
			this.setAttribute("disabled", "");
		} else {
			this.removeAttribute("disabled");
		}
	}

	public get name(): string {
		return this.input.name;
	}

	public set name(name: string) {
		this.input.name = name;
		this.setAttribute("name", name);
	}

	public get isRadio(): boolean {
		return this.isRadioLocal;
	}

	public set isRadio(isRadio: boolean) {
		this.isRadioLocal = isRadio;
		if (isRadio) {
			this.setAttribute("is-radio", "");
		} else {
			this.removeAttribute("is-radio");
		}
	}

	public get value(): string {
		if (this.input.value != "") {
			return this.checked ? this.input.value : "";
		} else {
			return this.checked ? "on" : "";
		}
	}

	public set value(value: string) {
		if (this.value == "") {
			this.checked = false;
		} else if (this.value == "on") {
			this.checked = true;
		}
    this.input.value = value;
	}

	public get indeterminate(): boolean {
		return this.hasAttribute("indeterminate");
	}

	public set indeterminate(indeterminate: boolean) {
		if (indeterminate) {
			this.setAttribute("indeterminate", "");
		} else {
			this.removeAttribute("indeterminate");
		}
	}
}
customElements.define("form-toggle", HTMLFormToggleElement);
