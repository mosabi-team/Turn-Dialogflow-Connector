interface TurnIncomingPayload {
    contacts: TurnIncomingMessageContact[],
    messages: {
        context?: {
            from: string;
            group_id: string;
            id: string;
            mentions: string[];
        },
        _vnd: {
            v1:{
                author:{
                    id:string; //whatsappid
                    name: string;
                    type: string;
                },
                chat:{
                    assigned_to: string |null;
                    owner:string;
                    permalink:string;
                    state:string;
                    state_reason:string;
                    unread_count:number;
                    uuid:string;
                },
                direction:string;
                faq_uuid:string;
                in_reply_to:string;
                inserted_at:Date | null;
                labels:string[],
                rendered_content:string | null;
            }
        };
        from: string;
        group_id: string;
        id: string;
        timestamp: string;
        type: "audio" | "document" | "image" | "location" | "system" | "text" | "video" | "voice" | "contacts";

        errors?: any[];

        audio?: {
            file: string;
            id: string;
            link:string;
            mime_type: string;
            sha256: string;
        },

        document?: {
            file: string;
            id: string;
            link: string;
            mime_type: string;
            sha256: string;
            caption: string;
        },

        image?: {
            file: string;
            id: string;
            link: string;
            mime_type: string;
            sha256: string;
            caption: string;
        },

        location?: {
            address: string;
            latitude: string;
            longitude: string;
            name: string;
        },

        system?: {
            body: string;
        },

        text?: {
            body: string;
        },

        video?: {
            file: string;
            id: string;
            link: string;
            mime_type:string;
            sha256: string;
        },

        voice?: {
            file: string;
            id: string;
            link: string;
            mime_type: string;
            sha256: string;
        },
        contacts?: {
            addresses: [{
                city: string;
                country: string;
                country_code: string;
                state: string;
                street: string;
                type: string;
                zip: string;
            }],
            birthday: string;
            contact_image: string;
            emails: [{
                email: string;
                type: string;
            }],
            ims: [{
                service:string;
                user_id:string;
            }],
            name: {
                first_name: string;
                formatted_name: string;
                last_name: string;
            },
            org: {
                company: string;
            },
            phones: [{
                phone: string;
                type: string;
            }, {
                phone: string;
                type:string; 
                wa_id: string;
            }],
            urls: [{
                url: string;
                type: string;
            }]
        }[]
    }[]
};

interface TurnIncomingMessageContact {
    profile: {
        name: string;
    },
    wa_id: string;
};

interface TurnOutgoingMessage {
    recipient_type: "individual" | "group",
    to: string, //whatsapp-id | whatsapp-group-id,
    type: "text" | "audio" | "document" | "image" | "sticker",
    preview_url?: boolean,
    text?: {
        body: string;
    },
    audio?: {
        id: string;//your-media-id,
    }
    document?: {
        id: string; //your-media-id,
        caption: string; //your-document-caption
    }

    image?: {
        id: string; //your-media-id,
        caption: string //your-image-caption
    }

    sticker?: {
        id: string; //your-media-id
    }
};

interface TurnOutgoingMessageResponse {
    messages: {
      id: string;  
    }[]
}

export {TurnIncomingPayload, TurnIncomingMessageContact, TurnOutgoingMessage, TurnOutgoingMessageResponse};
