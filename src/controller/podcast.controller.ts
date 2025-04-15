import express, { Request, Response } from "express";
import { Controller } from "../types/main.type";
import AuthMiddleware from "../middleware/auth.middleware";
import NonceMiddleware from "../middleware/nonce.middleware";
import PodcastService from "../services/podcast.service";
import PodcastSessionService from "../services/podcastsession.service";

export default class PodcastController implements Controller {
   public path = "/podcast";
   public router = express.Router();

   constructor() {
      this.initRoutes();
   }

   private initRoutes() {
      // Podcast routes
      this.router.get("/", NonceMiddleware.verifyNonce, this.getAllPodcasts);
      this.router.get("/:id", NonceMiddleware.verifyNonce, this.findPodcastByID);
      this.router.post("/", AuthMiddleware.verifyToken, this.createPodcast);
      this.router.put("/:id", AuthMiddleware.verifyToken, this.updatePodcast);
      this.router.delete("/:id", AuthMiddleware.verifyToken, this.deletePodcast);

      // PodcastSession routes
      this.router.get("/sessions/all", NonceMiddleware.verifyNonce, this.getAllSessions);
      this.router.get(
         "/sessions/:podcastId",
         NonceMiddleware.verifyNonce,
         this.getSessionsByPodcast
      );
      this.router.post("/sessions", AuthMiddleware.verifyToken, this.createSession);
      this.router.put("/sessions/:id", AuthMiddleware.verifyToken, this.updateSession);
      this.router.delete("/sessions/:id", AuthMiddleware.verifyToken, this.deleteSession);
   }

   // Podcast handlers
   private getAllPodcasts = async (req: Request, res: Response) => {
      try {
         const podcasts = await PodcastService.getAll();
         res.status(200).json(podcasts);
      } catch (error) {
         res.status(500).json({ error });
      }
   };

   private findPodcastByID = async (req: Request, res: Response) => {
      try {
         const podcast = await PodcastService.findByID(req.params.id);
         res.status(200).json(podcast);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private createPodcast = async (req: Request, res: Response) => {
      try {
         const podcast = await PodcastService.create(req.body);
         res.status(200).json(podcast);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private updatePodcast = async (req: Request, res: Response) => {
      try {
         const podcast = await PodcastService.update(req.params.id, req.body);
         res.status(200).json(podcast);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private deletePodcast = async (req: Request, res: Response) => {
      try {
         await PodcastService.deleteByID(req.params.id);
         res.status(200).json({ message: "Podcast deleted successfully" });
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   // PodcastSession handlers
   private getAllSessions = async (req: Request, res: Response) => {
      try {
         const sessions = await PodcastSessionService.getAll();
         res.status(200).json(sessions);
      } catch (error) {
         res.status(500).json({ error });
      }
   };

   private getSessionsByPodcast = async (req: Request, res: Response) => {
      try {
         const sessions = await PodcastSessionService.findByPodcast(req.params.podcastId);
         res.status(200).json(sessions);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private createSession = async (req: Request, res: Response) => {
      try {
         const session = await PodcastSessionService.create(req.body);
         res.status(200).json(session);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private updateSession = async (req: Request, res: Response) => {
      try {
         const session = await PodcastSessionService.update(req.params.id, req.body);
         res.status(200).json(session);
      } catch (error) {
         res.status(400).json({ error });
      }
   };

   private deleteSession = async (req: Request, res: Response) => {
      try {
         await PodcastSessionService.deleteByID(req.params.id);
         res.status(200).json({ message: "Session deleted successfully" });
      } catch (error) {
         res.status(400).json({ error });
      }
   };
}
