import { NextFunction, Request, Response } from "express";
import { debug } from "../utils/debug.util";
import MainConfService from "../services/mainconf.service";

export default class NonceMiddleware {
   public static verifyNonce = async (req: Request, res: Response, next: NextFunction) => {
      const nonce = req.header("x-fe-nonce");
      if (!nonce) return res.status(401).json({ error: "Invalid Nonce!" });

      try {
         const isNonceValid = await MainConfService.validateNonce(nonce);
         if (!isNonceValid) {
            res.status(403).json({ error: "Access denied" });
            return;
         }

         next();
      } catch (error) {
         debug("Authentication Error!", { data: "Invalid Nonce", status: "error" });
         res.status(401).json({ error });
      }
   };

   public static verifyNonceInQueryParams = async (
      req: Request,
      res: Response,
      next: NextFunction
   ) => {
      const nonce = req.query["nonce"];
      if (!nonce) return res.status(401).json({ error: "Invalid Nonce!" });

      try {
         const isNonceValid = await MainConfService.validateNonce(nonce as string);
         if (!isNonceValid) {
            res.status(403).json({ error: "Access denied" });
            return;
         }

         next();
      } catch (error) {
         debug("Authentication Error!", { data: "Invalid Nonce", status: "error" });
         res.status(401).json({ error });
      }
   };
}
