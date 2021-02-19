import { TurnOutgoingMessage, TurnOutgoingMessageResponse } from "./turnModels";
import fetch from 'node-fetch';

const API_ENDPOINT = "https://whatsapp.turn.io/v1/messages";
const ACCESS_TOKEN = process.env.TURN_ACCESS_TOKEN || "";

class TurnService {
    static async SendMessage$(message: TurnOutgoingMessage) {
        try{
            const resp = await fetch(`${API_ENDPOINT}`, {
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
        const resp = await fetch(`${API_ENDPOINT}/${messageId}`, {
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
}

export {TurnService};