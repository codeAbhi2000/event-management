import { errorLogger } from "./logger";
import logger from "./logger";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
}

export const sendEmail = async ({ to, subject, text }: EmailOptions): Promise<void> => {
    // In a real application, you would use nodemailer or a similar library here.
    // For this assignment, we will mock the email sending by logging to the console.
    
    return new Promise((resolve) => {
        setTimeout(() => {
            logger.info(`
            ---------------------------------------------------
            [MOCK EMAIL SERVICE]
            To: ${to}
            Subject: ${subject}
            Body:
            ${text}
            ---------------------------------------------------
            `);
            resolve();
        }, 100); // Simulate network delay
    });
};
