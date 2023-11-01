import {HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export function getHub(url: string): HubConnection {
   const hub = new HubConnectionBuilder()
        .withUrl(url)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Debug)
        .build();

   hub.onreconnecting(() => console.info('Trying to reconnect to SignalR server'));
   hub.onreconnected(() => console.info('Successfully reconnected to SignalR server'));
   hub.onclose(() => console.info('SignalR connection closed'));

   return hub;
}
