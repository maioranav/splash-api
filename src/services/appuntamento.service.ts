import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { DeepPartial } from "typeorm";
import { Appuntamento } from "../model/Appuntamento";
import { Programma } from "../model/Programma";
import ProgrammaService from "./programma.service";

export default class AppuntamentoService {
   public static getAll = async () => {
      const prog = await AppDataSource.getRepository(Appuntamento).find({
         relations: {
            programma: true
         }
      });
      return prog;
   };

   public static findByProgramma = async (id: string) => {
      const prog = await AppDataSource.getRepository(Appuntamento).findOneBy({ programma: { id } });
      return prog;
   };

   public static create = async (data: DeepPartial<Appuntamento>) => {
      const app = AppDataSource.getRepository(Appuntamento).create(data);
      if (!data?.programma?.id) throw new Error("Invalid show id");

      const prog = await ProgrammaService.findByID(data?.programma?.id);
      if (!prog) throw new Error("Show not found");
      app.programma = prog;

      const validationErrors = await validate(app);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(Appuntamento).save(app);
   };

   public static update = async (id: string, data: DeepPartial<Appuntamento>) => {
      const exists = await AppDataSource.getRepository(Appuntamento).findOneBy({ id });
      if (!exists) throw new Error("Show not found");

      const newProg = AppDataSource.getRepository(Appuntamento).create(data);
      const validationErrors = await validate(newProg);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      newProg.id = id;
      return await AppDataSource.getRepository(Appuntamento).save(newProg);
   };

   public static deleteByID = async (id: string) => {
      const prog = await AppDataSource.getRepository(Appuntamento).findOneBy({ id });
      if (!prog) throw new Error("Show not found");
      return await AppDataSource.getRepository(Appuntamento).delete({ id });
   };
}
