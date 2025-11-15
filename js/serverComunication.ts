export enum WebSocketConnectionMessageType {
    Message,
    Open,
    Close,
    Error,
    TotalClose,
    Connecting
}
export type WebSocketConnectionMessageFunc = (type: WebSocketConnectionMessageType, data: string) => void;

/*
Web Socket connection
*/
export class WebSocketConnection {
    private type: string
    private url: string
    ws: WebSocket
    messageFuncs: WebSocketConnectionMessageFunc[]
    private closing: boolean = false
    private connectionCouter = -1
    private isReconnecting: boolean =false

    constructor(type: string, url = "/") {
        this.type = type
        this.url = url
        this.messageFuncs = []
    }

    /*
    Adds listener to this WebSocket
    */
    AddListener(func: WebSocketConnectionMessageFunc) {
        this.messageFuncs.push(func)
    }

    /*
    Disconnects from WebSocket
    */
    Disconnect() {
        this.closing = true
        this.ws.close()
    }

    /*
    Tries to connect to WebSocket
    */
    Connect() {
        const wsc = this
        wsc.connectionCouter++
        //console.log(wsc.connectionCouter);
        if (wsc.connectionCouter > 10) {
            //Could not connect to WebSocket
            this.messageFuncs.forEach(element => {
                element(WebSocketConnectionMessageType.TotalClose, null)
            });
            return
        }

        //Send message about connecting
        this.messageFuncs.forEach(element => {
                element(WebSocketConnectionMessageType.Connecting, null)
            });

        //Try to connect
        try {
            const webSocket = new WebSocket(this.url + "?" + encodeURIComponent("type") + "=" + encodeURIComponent(this.type))
            this.isReconnecting = false
            
            //Add event on message (data)
            webSocket.addEventListener("message", function (event) {
                //const [command, params] = UnpackStandard(event.data)
                //console.log(command);
                //console.log(params);
                //wsc.messageFuncs.forEach(element => {
                //    element(WebSocketConnectionMessageType.Message, command, params)
                //});
                console.log(event.data);
                if (event.data == "INVALID_WEB_SOCKET_INSTANCE") {
                    webSocket.onerror(new Event("invalid cookies"))
                    return
                }
                wsc.messageFuncs.forEach(element => {
                    element(WebSocketConnectionMessageType.Message, event.data)
                });
            });
           
            //Add event on open
            webSocket.onopen = function () {
                console.log("Connected to WebSocket server");
                wsc.messageFuncs.forEach(element => {
                    element(WebSocketConnectionMessageType.Open, String(wsc.connectionCouter))
                });
                wsc.connectionCouter = 0
            };
            
            //Add event on close
            webSocket.onerror = function (error) {
                console.error("WebSocket error: ", error);
                if (!wsc.closing) {
                    wsc.messageFuncs.forEach(element => {
                        element(WebSocketConnectionMessageType.Error, null)
                    });
                }
                wsc.ws.close()
            };
           
            //Add event on close
            webSocket.onclose = function () {
                console.log("WebSocket connection closed");
                wsc.messageFuncs.forEach(element => {
                    element(WebSocketConnectionMessageType.Close, String(wsc.closing))
                });
                if (!wsc.closing && !wsc.isReconnecting) {
                    //Reconnect
                    wsc.isReconnecting = true
                    setTimeout(() => {
                        wsc.Connect()
                    }, 1000)
                }
            };
            
            //Set WebSocket
            this.ws = webSocket
        } catch {
            return
        }
    }

    /*
    Sends data with standart do WebSocket
    */
    SendData(command: string, params: any) {
        if (this.ws != null && this.ws.readyState === 1) {
            //WebSocket OK -> Sending
            this.ws.send(PackStandard(command, params))
        } else {
            //WebSocket not ready
            if (this.ws != null && (this.ws.readyState == 2 || this.ws.readyState == 3)) {
                //WebSocket not ready - Ended -> stop loop
                return
            }
            const wsc = this
            
            //Wait for ready
            setTimeout(function () {
                wsc.SendData(command, params)
            }, 500)
        }
    }
}

export type XHRServerResponceFunc = (message: string) => void

/*
Sends POST request to server
*/
export function SendPOSTToServer(url: string,message: string, responceFunc: XHRServerResponceFunc = null) {
    console.log("Sending request...");

    //Create request
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
    
    //Get responce (lots of time none)
    xhr.addEventListener("load", () => {
        if (xhr.readyState == 4 && xhr.status == 201) {
            //console.log(JSON.parse(xhr.responseText));
            const responce = xhr.responseText
             console.log(responce);
            if (responceFunc != null) {
                responceFunc(responce)
            }
        } else {
            console.log(`Error: ${xhr.status}`);
             if (responceFunc != null) {
                responceFunc(null)
            }
        }
    });
    
    //Send data
    xhr.send(message);
}

export function UnpackStandard(message: string): [string, any] {
    const split = message.split("?")
    const command = split[0]
    const paramsUrl = new URLSearchParams(split[1])
    let paramsResult = {}
    paramsUrl.forEach((value, key) => {
        paramsResult[key] = value
    })
    return [command, paramsResult]
}

export function PackStandard(command: string, params: any) {
    return command + "?" + new URLSearchParams(params).toString()
}

export function ConnectToWebSocket(type: string, newUrl = "/"): WebSocket {
    try {
        const webSocket = new WebSocket(newUrl + "websocket?" + encodeURIComponent("type") + "=" + encodeURIComponent(type))
        //const webSocket = new WebSocket("/websocket")
        webSocket.addEventListener("message", function (event) {
            const [command, params] = UnpackStandard(event.data)
            console.log(command, params);
        });
        webSocket.onopen = function () {
            console.log("Connected to WebSocket server");
        };
        webSocket.onerror = function (error) {
            console.error("WebSocket error: ", error);
        };
        webSocket.onclose = function () {
            console.log("WebSocket connection closed");
        };
        return webSocket
    } catch {
        return null
    }
}

export function SendDataToWebSocket(websocket: WebSocket, command: string, params: any) {
    if (websocket.readyState === 1) {
        websocket.send(PackStandard(command, params))
    } else {
        if (websocket.readyState == 2 || websocket.readyState == 3) {
            //WebSocket not ready -> stop loop
            return
        }
        //Wait for ready
        setTimeout(function () {
            SendDataToWebSocket(websocket, command, params)
        }, 500)
    }
}

export function HighlightRowsByID(table: HTMLTableElement, ids: string[]) {
    //Clear old highlights
    for (let index = 0; index < table.rows.length; index++) {
        table.rows[index].classList.remove("trHighlight")
    }

    //Do not highlight any
    if (ids == null) {
        return;
    }

    //Highlight specified cells
    for (let index = 0; index < table.rows.length; index++) {
        const row = table.rows[index];
        const value = row.cells[0].innerHTML
        if (ids.indexOf(value) != -1) {
            row.classList.add("trHighlight")
        }
    }
}
