import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import NonceMiddleware from "../middleware/nonce.middleware";
import LiveService from "../services/live.service";
import MBAuthMiddleware from "../middleware/mbauth.middleware";

export default class LiveController implements Controller {
   public path = "/onair";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      // Use as server-sent-events with x-fe-nonce in queryparams
      this.router.get("/title", NonceMiddleware.verifyNonceInQueryParams, this.getOnAirTitle);
      this.router.get("/cover", NonceMiddleware.verifyNonceInQueryParams, this.getOnAirCover);
      // Use basic auth for MBStudio compatibility
      this.router.post("/title", MBAuthMiddleware.verifyAuth, this.postOnAirTitle);
      this.router.post("/cover", MBAuthMiddleware.verifyAuth, this.postOnAirCover);
   }

   private getOnAirTitle = async (request: Request, response: Response) => {
      LiveService.instance.handleOnAirTitleClients(request, response);
   };

   private getOnAirCover = async (request: Request, response: Response) => {
      LiveService.instance.handleOnAirImageClients(request, response);
   };

   private postOnAirTitle = async (request: Request, response: Response) => {
      LiveService.instance.updateOnAirTitleClients(request, response);
   };

   private postOnAirCover = async (request: Request, response: Response) => {
      LiveService.instance.updateOnAirImageClients(request, response);
   };
}
