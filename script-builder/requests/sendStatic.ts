import {SERVER_IP} from "../const";

export function sendStatic(data: FormData): Promise<string> {
    return fetch(`https://${SERVER_IP}/api/Statics/Upload`, {
        method: 'POST',
        body: data,
    })
        .then(r => r.json())
        .then(r => r.fileKey as string)
}
