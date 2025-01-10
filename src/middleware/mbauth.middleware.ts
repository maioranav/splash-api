import { NextFunction, Request, Response } from "express";
import { ftpConfig } from "../config/app.config";
import { debug } from "../utils/debug.util";

export default class MBAuthMiddleware {
   public static verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.header("Authorization");

      if (!authHeader) {
         debug("MBAuthentication Failed!", { data: "", status: "error" });
         return res.status(401).json({ error: "Authorization header missing" });
      }

      // Splitta il valore dell'intestazione
      const [type, token] = authHeader.split(" ");

      // Controlla che il tipo sia 'Basic'
      if (type !== "Basic") {
         debug("MBAuthentication Failed!", { data: "", status: "error" });
         return res.status(401).json({ error: "Unsupported authorization type" });
      }

      // Decodifica il token base64
      const credentials = Buffer.from(token, "base64").toString("utf-8");
      const [username, password] = credentials.split(":");

      // Esegui la validazione delle credenziali
      if (username !== ftpConfig.username || password !== ftpConfig.password) {
         debug("MBAuthentication Failed!", { data: "", status: "error" });
         return res.status(401).json({ error: "Invalid credentials" });
      }

      next();
   };
}
