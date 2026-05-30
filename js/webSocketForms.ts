import { FormDialog, FormDialogButton, FormDialogManager, FormDialogStyle } from "./formDialogScript.js"
import { GlobalLanguageManager, RemoveWaitStatusForms, SendToast, SetWaitStatusForms } from "./formScript.js"
import { WebSocketConnection, WebSocketConnectionMessageType } from "./serverComunication.js"

//Do not forget to add formStyle.css and tableStyle.css

/*
Automatically connects to websocket and configures it with toasts and autoconnect, type is URL parameter
*/
export function SetupWebsocketWithToasts(type: string, dialogManager: FormDialogManager | null = null, newUrl = "/websocket",): WebSocketConnection {
    const ws = new WebSocketConnection(type, newUrl, GlobalLanguageManager)
    const connectingDialogs: (null | FormDialog<false>)[] = []
    const reconnectingDialogs: (null | FormDialog<false>)[] = []
    if (dialogManager != null) {
    }
    const listenerToWs = (type: WebSocketConnectionMessageType, data: string) => {
        switch (type) {
            case WebSocketConnectionMessageType.Connecting: {
                if (dialogManager != null) {
                    connectingDialogs.push(dialogManager.ShowProgress("Web Socket", GlobalLanguageManager.Translate("wsForms.connecting", "Connecting to Web Socket..."),() => {},0,false))
                }
                SetWaitStatusForms(GlobalLanguageManager.Translate("wsForms.connecting", "Connecting to Web Socket..."))
                break
            }
            case WebSocketConnectionMessageType.Open:
                //WebSocket opened
                if (dialogManager != null) {
                    for (const element of connectingDialogs) {
                        element?.CloseDialog();
                    }
                    for (const element of reconnectingDialogs) {
                        element?.CloseDialog();
                    }
                }
                RemoveWaitStatusForms()
                if (Number(data) > 0) {
                    SendToast("Web Socket", GlobalLanguageManager.Translate("wsForms.connected", "Connection to client application established!"), "ok")
                }
                break
            case WebSocketConnectionMessageType.Close:
                //WebSocket closed, reconnecting
                if (data == "false") {
                    if (dialogManager != null) {
                        reconnectingDialogs.push(dialogManager.ShowProgress("Web Socket", GlobalLanguageManager.Translate("wsForms.reconnecting", "Reconnecting to Web Socket..."), () => {}, 0,false))
                    }
                    SetWaitStatusForms(GlobalLanguageManager.Translate("wsForms.disconnectedReconnecting", "Connection lost, reconnecting..."))
                    SendToast("Web Socket", GlobalLanguageManager.Translate("wsForms.disconnected", "Connection to client application closed!"), "error")
                }
                break
            case WebSocketConnectionMessageType.TotalClose:
                //WebSocket closed
                if (dialogManager != null) {
                    ws.UserParams.connectingDialog.CloseChildrenDialogs()
                    if (ws.UserParams.reconnectingDialog != null) {
                        ws.UserParams.reconnectingDialog.CloseChildrenDialogs()
                    }
                    //dialogManager.ShowTemplate(new FormDialogTemplate("Web Socket", GlobalLanguageManager.Translate("wsForms.disconnectedRefresh", "Connection lost! Do you want to reload the page?"), false, (id: number, value: boolean) => { if (value) { window.location.reload() } }, [new FormDialogButton("left", "error", GlobalLanguageManager.Translate("wsForms.btnNo", "No"), false), new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("wsForms.btnYes", "Yes"), true)], FormDialogStyle.Normal))'
                    dialogManager.ShowConfirm("Web Socket", GlobalLanguageManager.Translate("wsForms.disconnectedRefresh"), (value: boolean) => {
                        if (value) {
                            window.location.reload()
                        }
                    })
                }
                SetWaitStatusForms(GlobalLanguageManager.Translate("wsForms.connectionLost", "Connection lost!"))
                SendToast("Web Socket", GlobalLanguageManager.Translate("wsForms.couldNotConnect", "Could not reconnect to Web Socket! Please reload the page."), "error")
                break
            default:
                break;
        }
    }
    ws.AddListener(listenerToWs)
    return ws
}