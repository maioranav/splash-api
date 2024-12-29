import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import AuthMiddleware from "../middleware/auth.middleware";
import AppuntamentoService from "../services/appuntamento.service";
import NonceMiddleware from "../middleware/nonce.middleware";

export default class AppuntamentoController implements Controller {
   public path = "/appuntamenti";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      this.router.get("/all", NonceMiddleware.verifyNonce, this.getAll);
      this.router.get("/programma/:id", AuthMiddleware.verifyToken, this.getAllByProgramma);
      this.router.delete("/:id", AuthMiddleware.verifyToken, this.deleteByID);
      this.router.post("/", AuthMiddleware.verifyToken, this.createOne);
      this.router.put("/:id", AuthMiddleware.verifyToken, this.updateOne);
   }

   /**
    * Controller service for forwarding a list of all Staff.
    *
    * @param {Request} request
    * @param {Response} response
    */
   private getAll = async (request: Request, response: Response) => {
      try {
         response.status(200).json(await AppuntamentoService.getAll());
      } catch (error) {
         response.status(500).json({ error });
      }
   };

   private getAllByProgramma = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];
         response.status(200).json(await AppuntamentoService.findByProgramma(id));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private deleteByID = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];
         response.status(200).json(await AppuntamentoService.deleteByID(id));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private createOne = async (request: Request, response: Response) => {
      try {
         response.status(200).json(await AppuntamentoService.create(request.body));
      } catch (error) {
         response.status(400).json({ error });
      }
   };

   private updateOne = async (request: Request, response: Response) => {
      try {
         const id = request.params["id"];
         response.status(200).json(await AppuntamentoService.update(id, request.body));
      } catch (error) {
         response.status(400).json({ error });
      }
   };
}
