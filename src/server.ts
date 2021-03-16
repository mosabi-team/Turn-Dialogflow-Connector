import express = require('express');
import { detectIntent } from "./dialogflowService";
import { google } from "@google-cloud/dialogflow/build/protos/protos";
import { TurnIncomingPayload, TurnIncomingMessageContact } from "./turnModels";
import { TurnService } from "./turnService";

require('dotenv').config();

//TODO: Move these to env variables
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT || "";

const PORT = Number(process.env.PORT) || 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, resp) => {
  resp.status(200).send("Turn Connector");
});

app.post('/TurnDialogflowConnector', async (req, resp) => {
    const body = req.body as TurnIncomingPayload;

    if(!!body.statuses){
      return resp.status(200).send(); //Ignore status updates
    }

    if(!body.contacts || body.contacts.length === 0){
      return resp.status(400).send("No contacts provided");
    }

    if(!body.messages || body.messages.length === 0){
      return resp.status(400).send("No messages provided");
    }

    const contact = body.contacts[0]; // no support for group messages
    for(const message of body.messages){
      const sessionId = message._vnd.v1.chat.uuid;
      console.log("Processing message id: " + message.id);

      if(!sessionId){
        return resp.status(400).send("No session id provided");
      }

      if(message.errors){
        message.errors.map(e => console.error(e));
        return resp.status(200).send("Errors found in payload");
      }
    
      const lang = "en"; //TODO: Read off request
      const text =  message.text ?  message.text.body : "";
      const mediaId = message.image ? message.image.id:
                    message.audio ? message.audio.id :
                    message.document ? message.document.id :
                    message.voice ? message.voice.id : 
                    message.video ? message.video.id : undefined;
      
      TurnService.MarkAsRead$(message.id);

      let mediaUrl: string | undefined;
      if(mediaId){
        //TODO: Implement Media
        //const mediaInfo = await TurnService.GetMediaById$(mediaId);
        // if(mediaInfo){
        //   mediaUrl = mediaInfo.url;
        // }
      }

      const dialogflowResponse = (await detectIntent(PROJECT_ID, sessionId, text, [], lang, mediaUrl));
      await sendMessageToTurn(contact, dialogflowResponse, body);
    }
      
    return resp.status(200).send();
});
  
async function sendMessageToTurn(contact: TurnIncomingMessageContact, intent: google.cloud.dialogflow.v2beta1.IDetectIntentResponse, source: any) {
    if(!intent.queryResult || !intent.queryResult.fulfillmentMessages) return;

    for(const message of intent.queryResult.fulfillmentMessages){
      if (!!message.text) {
        for(const text of message.text.text || []){
          //SEND MESSAGE TO Turn.IO
          await TurnService.SendMessage$({
            recipient_type: "individual",
            type: "text",
            text: {
              body: text
            },
            to: contact.wa_id
          });
        }
      } 
      else {
        console.warn(JSON.stringify({ unsupportedMedia: message }));
      }
    };

    return;
}


const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

module.exports = server;