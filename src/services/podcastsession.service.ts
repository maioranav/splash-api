import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { DeepPartial } from "typeorm";
import { PodcastSession } from "../model/PodcastSession";

export default class PodcastSessionService {
   public static getAll = async () => {
      const sessions = await AppDataSource.getRepository(PodcastSession).find({
         relations: {
            podcast: true
         }
      });
      return sessions;
   };

   public static findByPodcast = async (podcastId: string) => {
      const sessions = await AppDataSource.getRepository(PodcastSession).find({
         where: {
            podcast: { id: podcastId }
         },
         relations: {
            podcast: true
         },
         order: {
            num: "ASC"
         }
      });
      return sessions;
   };

   public static create = async (data: DeepPartial<PodcastSession>) => {
      const session = AppDataSource.getRepository(PodcastSession).create(data);
      const validationErrors = await validate(session);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(PodcastSession).save(session);
   };

   public static update = async (id: string, data: DeepPartial<PodcastSession>) => {
      const exists = await AppDataSource.getRepository(PodcastSession).findOneBy({ id });
      if (!exists) throw new Error("Podcast session not found");

      const session = AppDataSource.getRepository(PodcastSession).create(data);
      const validationErrors = await validate(session);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      session.id = id;
      return await AppDataSource.getRepository(PodcastSession).save(session);
   };

   public static deleteByID = async (id: string) => {
      const session = await AppDataSource.getRepository(PodcastSession).findOneBy({ id });
      if (!session) throw new Error("Podcast session not found");
      return await AppDataSource.getRepository(PodcastSession).delete({ id });
   };
}
