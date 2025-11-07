import { SendToast, SetWaitStatusForm } from "./formScript.js"
import { ConnectToWebSocket, UnpackStandard, WebSocketConnection, WebSocketConnectionMessageType } from "./serverComunication.js"

//Do not forget to add formStyle.css and tableStyle.css

/*
Automatically connects to websocket and configures it with toasts and autoconnect
*/
export function SetupWebsocketWithToasts(type: string, newUrl = "/"): WebSocketConnection {
    const ws = new WebSocketConnection(type, newUrl)
    ws.AddListener(listenerToWs)
    return ws
}

function listenerToWs(type: WebSocketConnectionMessageType, command: string, params: any) {
    switch (type) {
        case WebSocketConnectionMessageType.Connecting: {
            SetWaitStatusForm(true, "Connecting to Web Socket...")
            break
        }
        case WebSocketConnectionMessageType.Open:
            //WebSocket opened
            SetWaitStatusForm(false, "")
            if (Number(command) > 0) {
                SendToast("Web Socket", "Connection to client application established!", "ok")
            }
            break
        case WebSocketConnectionMessageType.Close:
            //WebSocket closed, reconnecting
            if (command == "false") {
                SetWaitStatusForm(true, "Connection lost, reconnecting...")
                SendToast("Web Socket", "Connection to client application closed!", "error")
            }
            break
        case WebSocketConnectionMessageType.TotalClose:
            //WebSocket closed
            SetWaitStatusForm(true, "Connection lost!")
            SendToast("Web Socket", "Could not reconnect to WebSocket!<br>Please check client application and reload the webside!", "error")
            break
        default:
            break;
    }
}