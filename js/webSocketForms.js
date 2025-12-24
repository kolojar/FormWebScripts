import { SendToast, SetWaitStatusForms } from "./formScript.js";
import { WebSocketConnection, WebSocketConnectionMessageType } from "./serverComunication.js";
//Do not forget to add formStyle.css and tableStyle.css
/*
Automatically connects to websocket and configures it with toasts and autoconnect, type is URL parameter
*/
export function SetupWebsocketWithToasts(type, newUrl = "/websocket") {
    const listenerToWs = (type, data) => {
        switch (type) {
            case WebSocketConnectionMessageType.Connecting: {
                SetWaitStatusForms(true, "Connecting to Web Socket...");
                break;
            }
            case WebSocketConnectionMessageType.Open:
                //WebSocket opened
                SetWaitStatusForms(false, "");
                if (Number(data) > 0) {
                    SendToast("Web Socket", "Connection to client application established!", "ok");
                }
                break;
            case WebSocketConnectionMessageType.Close:
                //WebSocket closed, reconnecting
                if (data == "false") {
                    SetWaitStatusForms(true, "Connection lost, reconnecting...");
                    SendToast("Web Socket", "Connection to client application closed!", "error");
                }
                break;
            case WebSocketConnectionMessageType.TotalClose:
                //WebSocket closed
                SetWaitStatusForms(true, "Connection lost!");
                SendToast("Web Socket", "Could not reconnect to WebSocket!<br>Please check client application and reload the webside!", "error");
                break;
            default:
                break;
        }
    };
    const ws = new WebSocketConnection(type, newUrl);
    ws.AddListener(listenerToWs);
    return ws;
}
//# sourceMappingURL=webSocketForms.js.map