import { FormDialogButton, FormDialogStyle, FormDialogTemplate } from "./formDialogScript.js";
import { SendToast, SetWaitStatusForms } from "./formScript.js";
import { WebSocketConnection, WebSocketConnectionMessageType } from "./serverComunication.js";
//Do not forget to add formStyle.css and tableStyle.css
/*
Automatically connects to websocket and configures it with toasts and autoconnect, type is URL parameter
*/
export function SetupWebsocketWithToasts(type, dialogManager = null, newUrl = "/websocket") {
    const ws = new WebSocketConnection(type, newUrl);
    if (dialogManager != null) {
        ws.UserParams.connectingDialog = new FormDialogTemplate("Web Socket", "Connecting to Web Socket...", false, null, null, FormDialogStyle.Wait, true, true);
        ws.UserParams.reconnectingDialog = new FormDialogTemplate("Web Socket", "Reconnecting to Web Socket...", false, null, null, FormDialogStyle.Wait, true, true);
    }
    const listenerToWs = (type, data) => {
        switch (type) {
            case WebSocketConnectionMessageType.Connecting: {
                if (dialogManager != null) {
                    dialogManager.ShowTemplate(ws.UserParams.connectingDialog);
                }
                SetWaitStatusForms(true, "Connecting to Web Socket...");
                break;
            }
            case WebSocketConnectionMessageType.Open:
                //WebSocket opened
                if (dialogManager != null) {
                    ws.UserParams.connectingDialog.CloseChildrenDialogs();
                    ws.UserParams.reconnectingDialog.CloseChildrenDialogs();
                }
                SetWaitStatusForms(false, "");
                if (Number(data) > 0) {
                    SendToast("Web Socket", "Connection to client application established!", "ok");
                }
                break;
            case WebSocketConnectionMessageType.Close:
                //WebSocket closed, reconnecting
                if (data == "false") {
                    if (dialogManager != null) {
                        dialogManager.ShowTemplate(ws.UserParams.reconnectingDialog);
                    }
                    SetWaitStatusForms(true, "Connection lost, reconnecting...");
                    SendToast("Web Socket", "Connection to client application closed!", "error");
                }
                break;
            case WebSocketConnectionMessageType.TotalClose:
                //WebSocket closed
                if (dialogManager != null) {
                    ws.UserParams.connectingDialog.CloseChildrenDialogs();
                    ws.UserParams.reconnectingDialog.CloseChildrenDialogs();
                    dialogManager.ShowTemplate(new FormDialogTemplate("Web Socket", "Connection lost! Do you want to reload the page?", false, (id, value) => { if (value) {
                        window.location.reload();
                    } }, [new FormDialogButton("left", "error", "No", false), new FormDialogButton("right", "ok", "Yes", true)], FormDialogStyle.Normal, true, true));
                }
                SetWaitStatusForms(true, "Connection lost!");
                SendToast("Web Socket", "Could not reconnect to WebSocket!<br>Please check client application and reload the webside!", "error");
                break;
            default:
                break;
        }
    };
    ws.AddListener(listenerToWs);
    return ws;
}
//# sourceMappingURL=webSocketForms.js.map