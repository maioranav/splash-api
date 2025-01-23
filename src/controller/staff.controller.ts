import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import StaffService from "../services/staff.service";
import AuthMiddleware from "../middleware/auth.middleware";
import NonceMiddleware from "../middleware/nonce.middleware";

export default class StaffController implements Controller {
   public path = "/staff";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      this.router.get("/all", NonceMiddleware.verifyNonce, this.getAll);
      this.router.get("/:id", NonceMiddleware.verifyNonce, this.findByID);
      this.router.delete("/:id", AuthMiddleware.verifyToken, this.deleteByID);
      this.router.put("/:id", AuthMiddleware.verifyToken, this.updateOne);
      this.router.post("/", AuthMiddleware.verifyToken, this.createOne);
   }

   /**
    * Controller service for forwarding a list of all Staff.
    *
    * @param {Request} request
    * @param {Response} response
    */
   private getAll = async (request: Request, response: Response) => {
      try {
         response.status(200).json(await StaffService.getAll());
      } catch (error) {
         response.status(500).json({ error });
      }
   };

   private findByID = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];
         response.status(200).json(await StaffService.findByID(id));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private deleteByID = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];
         response.status(200).json(await StaffService.deleteByID(id));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private createOne = async (request: Request, response: Response) => {
      try {
         response.status(200).json(await StaffService.create(request.body));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private updateOne = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];

         response.status(200).json(await StaffService.updateOne(id, request.body));
      } catch (error) {
         response.status(400).json({ error });
      }
   };
}
