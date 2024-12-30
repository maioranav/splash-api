import * as nodemailer from "nodemailer";
import { SendMailFromWeb } from "../types/mail.dto.type";
import { mailConfig } from "../config/app.config";

export class MailerService {
   private static _instance: MailerService;
   private transporter?: nodemailer.Transporter;

   private constructor() {
      this.initializeTransporter();
   }

   public static get instance(): MailerService {
      if (!this._instance) {
         this._instance = new MailerService();
      }

      return this._instance;
   }

   private initializeTransporter = () => {
      this.transporter = nodemailer.createTransport(mailConfig);

      // Verifica il trasporto SMTP
      this.transporter.verify((error, success) => {
         if (error) {
            this.transporter = undefined;
            console.error("Errore nella configurazione SMTP:", error);
         } else {
            console.log("SMTP configurato correttamente:", success);
         }
      });
   };

   public sendMail({ email, message, name, object }: SendMailFromWeb): Promise<boolean> {
      if (!this.transporter) throw new Error("SMTP Transporter not initialized");

      if (!email || !message || !name) {
         throw new Error("Elementi mancanti per l'invio della mail");
      }

      if (!object) object = "";

      return new Promise((res, rej) =>
         this.transporter?.sendMail(
            {
               from: `"radiosplash.it" <${mailConfig.auth.user}>`,
               to: mailConfig.auth.user,
               replyTo: email,
               subject: "Messaggio dal sito: " + object,
               text: message
            },
            (error) => {
               if (error) rej(false);
               else res(true);
            }
         )
      );
   }
}
