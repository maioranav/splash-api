import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { DeepPartial } from "typeorm";
import { Podcast } from "../model/Podcast";

export default class PodcastService {
   public static getAll = async () => {
      const podcasts = await AppDataSource.getRepository(Podcast).find({
         relations: {
            programma: true,
            sessioni: true
         }
      });
      return podcasts;
   };

   public static findByID = async (id: string) => {
      const podcast = await AppDataSource.getRepository(Podcast).findOne({
         where: { id },
         relations: {
            programma: true,
            sessioni: true
         }
      });
      return podcast;
   };

   public static create = async (data: DeepPartial<Podcast>) => {
      const podcast = AppDataSource.getRepository(Podcast).create(data);
      const validationErrors = await validate(podcast);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(Podcast).save(podcast);
   };

   public static update = async (id: string, data: DeepPartial<Podcast>) => {
      const exists = await AppDataSource.getRepository(Podcast).findOneBy({ id });
      if (!exists) throw new Error("Podcast not found");

      const podcast = AppDataSource.getRepository(Podcast).create(data);
      const validationErrors = await validate(podcast);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      podcast.id = id;
      return await AppDataSource.getRepository(Podcast).save(podcast);
   };

   public static deleteByID = async (id: string) => {
      const podcast = await AppDataSource.getRepository(Podcast).findOneBy({ id });
      if (!podcast) throw new Error("Podcast not found");
      return await AppDataSource.getRepository(Podcast).delete({ id });
   };
}
