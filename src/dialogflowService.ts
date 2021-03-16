import * as dialogflow from "@google-cloud/dialogflow";
import * as credentials_file from './auth/gcloudserviceaccount.json';

//const credentials_file_path = ;
const sessionClient = new dialogflow.v2beta1.SessionsClient({
  credentials: credentials_file
});

console.log("CREDS FILE: " + credentials_file);

export async function detectIntent(
  projectId: string,
  sessionId: string,
  query: string,
  contexts: dialogflow.protos.google.cloud.dialogflow.v2beta1.IContext[] | null | undefined,
  languageCode: string,
  mediaUrl?: string
): Promise<dialogflow.protos.google.cloud.dialogflow.v2beta1.IDetectIntentResponse> {
  console.log("PROJECT: " + projectId);
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request: dialogflow.protos.google.cloud.dialogflow.v2beta1.IDetectIntentRequest = {
    session: sessionPath,
    queryParams: {
      payload: {
        fields: {
          mediaUrl: {stringValue: mediaUrl || ""}
        }
      }
    },
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    }
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

export async function executeQueries(projectId: string, sessionId: string, queries: string[], languageCode: string): Promise<dialogflow.protos.google.cloud.dialogflow.v2beta1.IDetectIntentResponse[] | undefined> {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context: dialogflow.protos.google.cloud.dialogflow.v2beta1.IContext[] | null | undefined;
  const intentResponses: dialogflow.protos.google.cloud.dialogflow.v2beta1.IDetectIntentResponse[] = [];
  for (const query of queries) {
    try {
      console.log(`Sending Query: ${query}`);
      const intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode
      );
      intentResponses.push(intentResponse);
      if(intentResponse && intentResponse.queryResult){
        console.log('Detected intent');
        console.log(
            `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
        );
        // Use the context from this response for next queries
        context = intentResponse.queryResult.outputContexts;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return intentResponses;
}