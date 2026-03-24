# FormWebScripts
- Contains some scripts for creating nice forms and UIs
- The sources must be hosted in "/formWebScripts"
- Icons from: https://fonts.google.com/icons?icon.size=32&icon.color=%23000000

# Import
 - CSS: `formStyle.css`
 - JS: `formScript.js`

# Custom Elements

## Styled Inputs
 - Tag name: `inputfield`
 - Attribute `icon`: Icon path for image before field 
 - Attribute `inputType`:
   + textarea = multiple line text
   + Other input types as default input element
 - Attribute `valueId`: Id for value element
 - Attribute `placeholder`: Placeholder for input
 - Automatic password eye for password
 - Automatic random color generator for color input
 - Manual setup using function: `SetupTextInput`

## Styled Toggles
 - Tag name: `toggle`
 - Attribute `labelBefore`: Text label before toggle
 - Attribute `valueId`: Id for value element
 - Attribute `labelAfter`: Text label after toggle
 - Use function: `SwitchToggle` for switching toggles

## Dialog Forms
### Holder
 - Use this: ``` <div class="formBackground formCenter">```
 - This creates background and centers forms

### FormBox
 - Use: ```<div class="formBox">``` to create basic empty form box

### FormHeader
 - Use: ``` <p class="formHeader">HEADER_HERE</p>``` for form header

### FormRow
 - Tag name: `formrow`
 - Attribute `isfirst`: Should be set as first row to true, else it should not be presented

### FormButtonBoxHolder
 - Use: ` <div class="formButtonBoxHolder">` for holding button boxes
 - FormButtonBox should be placed in holder

### FormButtonBox
 - Use: ` <div class="formButtonBox">` for creating a formButtonBox
 - You can add `formJustifyLeft`, `formJustifyRight`

### Status Message
 - Set some element id to: `statusMessage` for status messages 
 - Use function `SetWaitStatusForms` for setting wait status
 - Use function `SetStatusMessageForms` for setting status

## Dialog Message
 - Use JS: `formDialogScript.js`
 - Create template using `FormDialogTemplate` class
 - Create new dialog manager using `FormDialogManager` class
 - **Functions:**
   + `ShowTemplate` renders template and shows dialog
   + `ShowDialog` just shows rendered dialog
   + `CloseTopDialog` closes top dialog
   + `ShowPrompt` opens promt dialog, returns value using closeFunction
   + `ShowAlert` shows alert
   + `ShowConfirm` opens confirm dialog, returns value using closeFunction
   + `ShowSelect` opens selection dialog, returns value using closeFunction
   + `ShowProgress` opens dialog with progress reporting
   + `OpenPrompt` calls `ShowPromt` with await for close
   + `OpenAlert` calls `ShowAlert` with await for close
   + `OpenConfirm` calls `ShowConfirm` with await for close
	  
# Classes
## FormButton
 - Class name: `formButton`
 - Create nice looking button

## Colors
 - Error color: `formErrorColor`
 - Warn color: `formWarnColor`
 - Info color: `formInfoColor`
 - Ok color: `formOkColor`
 
# Functions
 - Generate random color: `GenerateRandomColor`
 - Send toasts: `SendToast`
 - Makes element draggable: `MakeElementDraggable`

# TODO:
- Fix DIALOG on edges - condensed text