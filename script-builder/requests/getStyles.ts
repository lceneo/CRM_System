import {SERVER_IP} from "../const";

export function getStyles(): any {
    return fetch(`http://${SERVER_IP}/getStyles`)
        .then(r => r.json());
}
