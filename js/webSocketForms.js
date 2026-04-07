import { FormDialogButton, FormDialogStyle, FormDialogTemplate } from "./formDialogScript.js";
import { RemoveWaitStatusForms, SendToast, SetWaitStatusForms } from "./formScript.js";
import { LanguageManager } from "./languageManager.js";
import { WebSocketConnection, WebSocketConnectionMessageType } from "./serverComunication.js";
//Do not forget to add formStyle.css and tableStyle.css
/*
Automatically connects to websocket and configures it with toasts and autoconnect, type is URL parameter
*/
export function SetupWebsocketWithToasts(type, dialogManager = null, newUrl = "/websocket") {
    const languageManager = new LanguageManager("/formWebScripts/locales", null, false);
    const ws = new WebSocketConnection(type, newUrl, languageManager);
    if (dialogManager != null) {
        ws.UserParams.connectingDialog = new FormDialogTemplate("Web Socket", languageManager.Translate("wsForms.connecting", "Connecting to Web Socket..."), false, null, null, FormDialogStyle.Wait, true, true);
        let func = async () => {
            ws.UserParams.reconnectingDialog = new FormDialogTemplate("Web Socket", await languageManager.AsyncTranslate("wsForms.reconnecting", "Reconnecting to Web Socket..."), false, null, null, FormDialogStyle.Wait, true, true);
        };
        func();
    }
    const listenerToWs = (type, data) => {
        switch (type) {
            case WebSocketConnectionMessageType.Connecting: {
                if (dialogManager != null) {
                    dialogManager.ShowTemplate(ws.UserParams.connectingDialog);
                }
                SetWaitStatusForms(languageManager.Translate("wsForms.connecting", "Connecting to Web Socket..."));
                break;
            }
            case WebSocketConnectionMessageType.Open:
                //WebSocket opened
                if (dialogManager != null) {
                    ws.UserParams.connectingDialog.CloseChildrenDialogs();
                    if (ws.UserParams.reconnectingDialog != null) {
                        ws.UserParams.reconnectingDialog.CloseChildrenDialogs();
                    }
                }
                RemoveWaitStatusForms();
                if (Number(data) > 0) {
                    SendToast("Web Socket", languageManager.Translate("wsForms.connected", "Connection to client application established!"), "ok");
                }
                break;
            case WebSocketConnectionMessageType.Close:
                //WebSocket closed, reconnecting
                if (data == "false") {
                    if (dialogManager != null) {
                        dialogManager.ShowTemplate(ws.UserParams.reconnectingDialog);
                    }
                    SetWaitStatusForms(languageManager.Translate("wsForms.disconnectedReconnecting", "Connection lost, reconnecting..."));
                    SendToast("Web Socket", languageManager.Translate("wsForms.disconnected", "Connection to client application closed!"), "error");
                }
                break;
            case WebSocketConnectionMessageType.TotalClose:
                //WebSocket closed
                if (dialogManager != null) {
                    ws.UserParams.connectingDialog.CloseChildrenDialogs();
                    if (ws.UserParams.reconnectingDialog != null) {
                        ws.UserParams.reconnectingDialog.CloseChildrenDialogs();
                    }
                    dialogManager.ShowTemplate(new FormDialogTemplate("Web Socket", languageManager.Translate("wsForms.disconnectedRefresh", "Connection lost! Do you want to reload the page?"), false, (id, value) => { if (value) {
                        window.location.reload();
                    } }, [new FormDialogButton("left", "error", languageManager.Translate("wsForms.btnNo", "No"), false), new FormDialogButton("right", "ok", languageManager.Translate("wsForms.btnYes", "Yes"), true)], FormDialogStyle.Normal, true, true));
                }
                SetWaitStatusForms(languageManager.Translate("wsForms.connectionLost", "Connection lost!"));
                SendToast("Web Socket", languageManager.Translate("wsForms.couldNotConnect", "Could not reconnect to Web Socket! Please reload the page."), "error");
                break;
            default:
                break;
        }
    };
    ws.AddListener(listenerToWs);
    return ws;
}
//# sourceMappingURL=webSocketForms.js.map