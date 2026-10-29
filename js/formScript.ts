//Do not forget to add formStyle.css

import { HTMLFormInputElement } from "./formInput.js";
import { LanguageManager } from "./languageManager.js";
import { ContainsText, ConvertDateTimeToLocal, FormatDateForDateTimeLocalInput, GeneratePassword, ValidateEmail as ValidateEmail } from "./sharedScripts.js";
export const GlobalLanguageManager = new LanguageManager();

/*
Disables element and all subelements without attribute disableRecursiveDisable
 */
export function RecursiveDisabler(target: HTMLElement, disabled: boolean) {
	for (let index = 0; index < target.children.length; index++) {
		const element = target.children[index] as HTMLElement;
		if (target instanceof HTMLFormInputElement) {
			target.disabled = disabled;
		} else {
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
	private messageID: string;
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
	SetStatusMessage(blink: boolean, message: string, cleanAfterMs: number = 0) {
		//Set message
		const messageID = GeneratePassword(8, false, false);
		this.messageID = messageID;
		this.querySelectorAll("form-status-message").forEach((element) => {
			let status = element as HTMLParagraphElement; //TODO: FIX
			status.innerText = message;

			//Set blinking
			if (blink) {
				if (!status.classList.contains("puslatingEffectFull")) {
					status.classList.add("puslatingEffectFull");
				}
			} else {
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
	SetWaitStatusMessage(message: string) {
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
export function SetWaitStatusForms(message: string) {
	document.querySelectorAll("form-box").forEach((form) => {
		(form as HTMLFormBoxElement).SetWaitStatusMessage(message);
	});
}

/**
 * Removes wait status from wall forms in document
 */
export function RemoveWaitStatusForms() {
	document.querySelectorAll("form-box").forEach((form) => {
		(form as HTMLFormBoxElement).RemoveWaitStatusMessage();
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
export function SendToast(title: string, message: string, type: "ok" | "warn" | "info" | "error" | "black", timeout: number = -7): number {
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
	} else if (type == "warn") {
		colorDiv.classList.add("formWarnColor");
	} else if (type == "info") {
		colorDiv.classList.add("formInfoColor");
	} else if (type == "error") {
		colorDiv.classList.add("formErrorColor");
	} else if (type == "black") {
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
		} else {
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
	} else {
		const before = toastHolder.children.item(0);
		if (before == null) {
			toastHolder.appendChild(toast);
		} else {
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
	const img = document.createElement("img") as HTMLImageElement;
	if (type == "black") {
		//colorDiv.classList.add("formBlackColor")
		console.error("Undefined icon!");
	} else {
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
			(element as HTMLElement).style.marginTop = "0px";
		}

		//Move all elements
		const holder = document.createElement("div");
		holder.classList.add("formFlexRow");
		while (element.lastChild != null) {
			const child = element.childNodes[0];
			if ((child as HTMLElement).tagName == "INPUTFIELD") {
				(child as HTMLElement).style.flexGrow = "1";
			}
			element.removeChild(child);
			holder.appendChild(child);
		}

		//Create label
		if (element.hasAttribute("label")) {
			const label = document.createElement("p");
			label.innerHTML = element.getAttribute("label") as string;
			element.appendChild(label);
		}
		element.appendChild(holder);
	}
}

export class DraggableElement {
	private dragDisabled: boolean;
	private isDragging: boolean;
	private movedElement: HTMLElement;
	private dragElement: HTMLElement;
	private moveAtBody: boolean;
	private lastDragX: number;
	private lastDragY: number;
	private lastCursor: string;

	/**
	 * Starts moving element based on mouse position
	 * @param event Mouse event
	 */
	private readonly dragStartEvent = (event: MouseEvent | TouchEvent) => {
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
		} else {
			this.lastDragX = event.touches[0].clientX;
			this.lastDragY = event.touches[0].clientY;
		}
	};

	/**
	 * Stops moving element based on mouse position
	 * @param event Mouse event
	 */
	private readonly dragEndEvent = (event: MouseEvent | TouchEvent) => {
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
	private drag = (event: MouseEvent | TouchEvent) => {
		//Drag
		if (!this.isDragging) {
			return;
		}
		let posX = 0;
		let posY = 0;
		if (event instanceof MouseEvent) {
			posX = this.lastDragX - event.clientX;
			posY = this.lastDragY - event.clientY;
		} else {
			posX = this.lastDragX - event.touches[0].clientX;
			posY = this.lastDragY - event.touches[0].clientY;
		}
		if (event instanceof MouseEvent) {
			this.lastDragX = event.clientX;
			this.lastDragY = event.clientY;
		} else {
			this.lastDragX = event.touches[0].clientX;
			this.lastDragY = event.touches[0].clientY;
		}
		this.movedElement.style.left = this.movedElement.offsetLeft - posX + "px";
		this.movedElement.style.top = this.movedElement.offsetTop - posY + "px";
	};

	/**
	 * Stops element from active dragging when dragged
	 */
	public StopDrag() {
		this.dragEndEvent(new MouseEvent("mouseup"));
	}

	/**
	 * Disables dragging from selected element(s)
	 */
	public DisableDrag() {
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
	public EnableDrag() {
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
	public ChangeMovedElement(movedElement: HTMLElement, sameDragElement: boolean) {
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
	public ChangeDragElement(dragElement: HTMLElement | null) {
		this.DisableDrag();
		if (dragElement == null) {
			this.dragElement = this.movedElement;
		} else {
			this.dragElement = dragElement;
		}
		this.EnableDrag();
	}

	constructor(movedElement: HTMLElement, dragElement: HTMLElement | null, moveAtBody: boolean = false) {
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
export function MakeElementDraggable(movedElement: HTMLElement, dragElement: HTMLElement | null, moveAtBody: boolean = false): DraggableElement {
	return new DraggableElement(movedElement, dragElement, moveAtBody);
}

/**
 * FormIconsDB is map for internal icons, you can use !iconName for automatic translation using this DB.
 * It loads internal DB file and external specified in meta: <meta name="form-icons-db" content="path">
 */
export let formIconsDB: Map<string, string> = new Map();

let ranSetupFormIcons = false;
async function SetupFormIcons() {
	if (ranSetupFormIcons) {
		return;
	}
	const loadDB = async (dbFile: string) => {
		const split = dbFile.split("/");
		const path = dbFile.substring(0, dbFile.length - split[split.length - 1].length);
		const request = await fetch(dbFile);
		if (request.status != 200) {
			console.error("Missing " + dbFile + " DB!");
		} else {
			const db = await request.json();
			for (const key in db) {
				formIconsDB.set(key, path + db[key]);
			}
		}
	};

	//Load DB main
	const metaElement1 = document.querySelector('meta[name="form-icons-main-db"]');
	if (metaElement1 != null) {
		await loadDB((metaElement1 as HTMLMetaElement).content);
	} else {
		console.warn("No FormWebScripts icons DB provided!");
	}

	//Load DB meta
	const metaElement2 = document.querySelector('meta[name="form-icons-db"]');
	if (metaElement2 != null) {
		await loadDB((metaElement2 as HTMLMetaElement).content);
	}
	console.log("Registered icons:", formIconsDB);

	//Setup function
	const update = (target: HTMLElement) => {
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
			const img = document.createElement("img") as HTMLImageElement;
			img.setAttribute("form-icon-holder", "");
			img.src = GetFormIconPath(target.getAttribute("form-icon") as string);
			if (target instanceof HTMLButtonElement || target instanceof HTMLTableCellElement) {
				if (target.children.length == 0) {
					target.appendChild(img);
				} else {
					target.insertBefore(img, target.children.item(0));
				}
			} else {
				target.parentElement?.insertBefore(img, target);
			}
		} else {
			(holder as HTMLImageElement).src = GetFormIconPath(target.getAttribute("form-icon") as string);
		}
	};

	//Setup observer
	const formIconObserver = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "attributes" && mutation.attributeName === "form-icon") {
				const target = mutation.target as HTMLElement;
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
		update(element as HTMLElement);
	}
	const inputs = document.querySelectorAll("form-input");
	for (const element of inputs) {
		const input = element as HTMLFormInputElement;
		input.icon = input.icon;
	}
	ranSetupFormIcons = true;
}

/**
 * GetFormIcon gets icon
 * @param path If path starts with !, it will be used as name for DB, else it is used as path
 * @returns Path for img src
 */
export function GetFormIconPath(path: string | undefined): string {
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
SetupFormIcons();
SetupToasts();
SetupRows();
