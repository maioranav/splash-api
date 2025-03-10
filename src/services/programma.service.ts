import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { DeepPartial } from "typeorm";
import { Programma } from "../model/Programma";

export default class ProgrammaService {
   public static getAll = async () => {
      const prog = await AppDataSource.getRepository(Programma).find({
         relations: {
            artista: true,
            appuntamenti: true
         }
      });
      return prog;
   };

   public static findByID = async (id: string) => {
      const prog = await AppDataSource.getRepository(Programma).findOne({
         relations: { artista: true },
         where: { id }
      });
      return prog;
   };

   public static create = async (data: DeepPartial<Programma>) => {
      const prog = AppDataSource.getRepository(Programma).create(data);
      const validationErrors = await validate(prog);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(Programma).save(prog);
   };

   public static update = async (id: string, data: DeepPartial<Programma>) => {
      const exists = await AppDataSource.getRepository(Programma).findOneBy({ id });
      if (!exists) throw new Error("Show not found");

      const newProg = AppDataSource.getRepository(Programma).create(data);
      const validationErrors = await validate(newProg);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      newProg.id = id;
      return await AppDataSource.getRepository(Programma).save(newProg);
   };

   public static deleteByID = async (id: string) => {
      const prog = await AppDataSource.getRepository(Programma).findOneBy({ id });
      if (!prog) throw new Error("Show not found");
      return await AppDataSource.getRepository(Programma).delete({ id });
   };
}
