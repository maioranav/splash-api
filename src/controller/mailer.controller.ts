import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import NonceMiddleware from "../middleware/nonce.middleware";
import { MailerService } from "../services/mailer.service";
import RecaptchaMiddleware from "../middleware/recaptcha.middleware";

export default class MailerController implements Controller {
   public path = "/mailer";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      this.router.post(
         "/",
         NonceMiddleware.verifyNonce,
         RecaptchaMiddleware.verifyRecaptcha,
         this.sendMailFromWeb
      );
   }

   private sendMailFromWeb = async (request: Request, response: Response) => {
      try {
         if (await MailerService.instance.sendMail(request.body))
            response.status(200).json({ status: "sent" });
         else response.status(500).json({ status: "unable to send message" });
      } catch (error: any) {
         response.status(400).json({ error: error.message });
      }
   };
}
