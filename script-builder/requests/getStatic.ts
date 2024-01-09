import {SERVER_IP} from "../const";

export function getStatic(fileKey: string): Promise<Blob> {
    return fetch(`https://${SERVER_IP}/api/Statics/Download`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileKey
        })
    }).then(r => r.blob())
}
