import * as express from "express";
import { detectIntent } from "./dialogflowService";
import { google } from "@google-cloud/dialogflow/build/protos/protos";
import { TurnIncomingPayload, TurnIncomingMessageContact } from "./turnModels";
import { TurnService } from "./turnService";

//TODO: Move these to env variables
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT || "";
const PORT = Number(process.env.PORT) || 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const listener = app.listen(PORT, function () {
    console.log('Your server is listening on port ' + PORT);
});

app.post('/', async (req, resp) => {
    const body = req.body as TurnIncomingPayload;
    
    if(!body.contacts || body.contacts.length === 0){
      return resp.status(400).send("No contacts provided");
    }

    if(!body.messages || body.messages.length === 0){
      return resp.status(400).send("No messages provided");
    }

    const contact = body.contacts[0]; // no support for group messages
    for(const message of body.messages){
      const sessionId = message._vnd.v1.chat.uuid;

      if(!sessionId){
        return resp.status(400).send("No session id provided");
      }
    
      const lang = "en"; //TODO: Read off request
      const text =  message.text ?  message.text.body : "";
      
      TurnService.MarkAsRead$(message.id);

      const dialogflowResponse = (await detectIntent(PROJECT_ID, sessionId, text, [], lang));
      const response = sendMessage(contact, dialogflowResponse, body);
      
      console.log("response", JSON.stringify(response));
    }
      
    return resp.status(200).send({});
});

app.post('/dialog', async function (req, res) {
  const body = req.body;
  return res.send(body);
});
  
process.on('SIGTERM', () => {
  listener.close(async () => {
    console.log('Closing http server.');
    process.exit(0);
  });
});

async function sendMessage(contact: TurnIncomingMessageContact, intent: google.cloud.dialogflow.v2.IDetectIntentResponse, source: any) {
    var content = [];
    if(!intent.queryResult || !intent.queryResult.fulfillmentMessages) return;

    for(const message of intent.queryResult.fulfillmentMessages){
      if (!!message.text) {
        content.push(...(message.text.text || []).map(t => ({ text: t })));
            
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
      // else if (!!r.image) {
      //   content.push({
      //     media: {
      //       mediaName: r.image.imageUri,
      //       mediaUri: r.image.accessibilityText,
      //       mimeType: r.image.imageUri ? 'image/' + r.image.imageUri.replace(/^.*\.([^.]+)$/, "$1") : undefined
      //     }
      //   });
      // } 
      else {
        console.warn(JSON.stringify({ unsupportedMedia: message }));
      }
    };

    return;
}
  
