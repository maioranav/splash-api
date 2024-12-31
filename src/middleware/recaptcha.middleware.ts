import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { debug } from "../utils/debug.util";

export default class RecaptchaMiddleware {
   public static verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
      const clientToken = req.header("g-recaptcha-token");
      if (!clientToken) return res.status(401).json({ error: "Invalid reCAPTCHA token!" });

      try {
         const params = new URLSearchParams();
         params.append("secret", process.env.RECAPTCHA_SECRET_KEY || "");
         params.append("response", clientToken);
         const verify = await axios.post("https://www.google.com/recaptcha/api/siteverify", params);

         if (!verify.data.success) {
            debug("Invalid reCAPTCHA response", { data: verify.data, status: "error" });
            return res.status(401).json({ error: "Invalid reCAPTCHA response!" });
         }

         next();
      } catch (err) {
         debug("Error verifying reCAPTCHA", { status: "error" });
         res.status(500).json({ error: "Failed to verify reCAPTCHA!" });
      }
   };
}
