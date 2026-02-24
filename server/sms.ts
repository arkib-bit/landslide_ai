import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, message: string) {
    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to,
        });

        console.log("SMS Sent Successfully:", response.sid);
    } catch (error) {
        console.error("Twilio SMS Error:", error);
    }
}