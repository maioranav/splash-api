import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import NonceMiddleware from "../middleware/nonce.middleware";
import LiveService from "../services/live.service";

export default class LiveController implements Controller {
   public path = "/onair";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      // Use ad server-sent-events with x-fe-nonce in header
      this.router.get("/title", NonceMiddleware.verifyNonceInQueryParams, this.getOnAirTitle);
      this.router.get("/cover", NonceMiddleware.verifyNonceInQueryParams, this.getOnAirCover);
   }

   private getOnAirTitle = async (request: Request, response: Response) => {
      LiveService.instance.handleOnAirTitleClients(request, response);
   };

   private getOnAirCover = async (request: Request, response: Response) => {
      LiveService.instance.handleOnAirImageClients(request, response);
   };
}
