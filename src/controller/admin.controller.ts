import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import AdminService from "../services/admin.service";
import { debug } from "../utils/debug.util";
import RecaptchaMiddleware from "../middleware/recaptcha.middleware";
import AuthMiddleware from "../middleware/auth.middleware";

export default class AdminController implements Controller {
   public path = "/admin";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      this.router.post("/apilogin", this.login); // TODO: remove afert deployment
      this.router.post("/login", RecaptchaMiddleware.verifyRecaptcha, this.login);
      this.router.get("/validate", AuthMiddleware.verifyToken, this.validateToken);
   }

   private login = async (request: Request, response: Response) => {
      try {
         const username = request.body.username;
         const password = request.body.password;
         if (!username || !password) throw new Error("Missing fields");

         const user = await AdminService.findByUserName(username);
         if (!user) {
            debug("User does not exist", { data: username, status: "error" });
            throw new Error("Not authorized");
         }

         const match = await AdminService.passwordMatch(password, user);
         if (!match) {
            debug("Wrong password", { data: username, status: "error" });
            throw new Error("Not Authorized");
         }

         debug("User authenticated", { data: username, status: "success" });

         response.status(200).json({ token: AdminService.generateToken(user.id) });
      } catch (error: any) {
         response.status(403).json({ error: error.message });
      }
   };

   private validateToken = async (request: Request, response: Response) => {
      response.status(200).json({ status: true });
   };
}
