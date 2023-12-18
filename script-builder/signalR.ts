/*
import { HttpClient, HttpRequest, HttpResponse, HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { STATE } from "./index";

export
}

class MyClient extends HttpClient {
    send(request: HttpRequest): Promise<HttpResponse> {
        return (fetch as (a: any, b: any) => Promise<{ json(): any }>)(request.url, {
            ...request,
            mode: 'cors',
            headers: request.headers,
            credentials: 'include'
        })
            .then(r => r.json())
            .then(res => new HttpResponse(res.status, res.statusText, res.body))
    }

}
*/
