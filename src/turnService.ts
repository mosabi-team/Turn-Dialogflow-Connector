import { TurnOutgoingMessage, TurnOutgoingMessageResponse } from "./turnModels";
import fetch from 'node-fetch';

const API_BASE = "https://whatsapp.turn.io/v1";
const MESSAGES_API_ENDPOINT = `${API_BASE}/messages`;
const MEDIA_API_ENDPOINT = `${API_BASE}/media`;
const ACCESS_TOKEN = process.env.TURN_ACCESS_TOKEN;

class TurnService {
    static async SendMessage$(message: TurnOutgoingMessage) {
        try{
            const resp = await fetch(`${MESSAGES_API_ENDPOINT}`, {
                method: 'post',
                body:    JSON.stringify(message),
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${ACCESS_TOKEN}`                
                }
            });

            if(resp.ok){
                return (await resp.json()) as TurnOutgoingMessageResponse;
            }
        }
        catch(ex){
            console.error(ex);
        }
        return undefined;
        
    }

    static async MarkAsRead$(messageId: string){
        const resp = await fetch(`${MESSAGES_API_ENDPOINT}/${messageId}`, {
                method: 'put',
                body:    JSON.stringify({status:"read"}),
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${ACCESS_TOKEN}`                
                }
            }
        );

        return resp.ok;
    }

    static async GetMediaById$(mediaId: string){
        return fetch(`${MEDIA_API_ENDPOINT}/${mediaId}`, {
            headers: { 
                "Authorization": `Bearer ${ACCESS_TOKEN}`                
            }
        })
        .then(resp => {
            return resp.ok ? resp.body : undefined;
        })
        .catch(e => {
            console.error(e);
        });
    }
}

export {TurnService};