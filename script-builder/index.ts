import {getHub} from './signalR';
import {execute} from "./app";

const SERVER_IP = '@SERVER_IP';
const SIGNALR_IP = '@SIGNALR_IP';

const hub = getHub(SIGNALR_IP);

// configure events
hub.on('send', console.log);

console.log('Starting SignalR');
hub.start()
    .then(() => {
        console.log("Connected to SignalR server");
        execute(hub, SERVER_IP)
    })
    .catch(console.error)
    .finally(() => execute(hub, SERVER_IP))
