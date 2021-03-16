import {detectIntent, executeQueries} from "../dialogflowService";
import * as uuid from "uuid";

require('dotenv').config();

const PROJECT_ID = process.env.DIALOGFLOW_PROJECT || "";

describe("Test Detect Intent", () => {
    it("Hello = Default Welcome Intent", async() => {
        const sessionId = uuid.v4();
        const resp = await detectIntent(PROJECT_ID, sessionId, "hello", [], "en");
        console.log(resp);

        expect(resp).toBeDefined();

        if(resp){
            const intent = resp.queryResult?.intent?.displayName;
            expect(intent).toBe("Default Welcome Intent");
        }
    }, 30000);
});

describe("Test Execute Queries", () => {
    it("Has a response", async() => {
        const sessionId = uuid.v4();
        const responses = await executeQueries(PROJECT_ID, sessionId, ["hello"], "en");
        console.log(responses);

        expect(responses).toBeDefined();

        if(responses){
            console.log(responses);
            expect(responses[0].queryResult?.intent?.displayName).toBe("Default Welcome Intent");
        }
    }, 30000);
});