import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { Staff } from "../model/Staff";
import { CreateStaff } from "../types/staff.dto.type";

export default class StaffService {
   public static getAll = async () => {
      const staff = await AppDataSource.getRepository(Staff).find({
         relations: {
            social: true
         }
      });
      return staff;
   };

   public static findByID = async (id: string) => {
      const staff = await AppDataSource.getRepository(Staff).findOne({
         where: { id: id },
         relations: {
            programmi: true,
            social: true
         }
      });
      return staff;
   };

   public static create = async ({ nome, ruolo, img }: CreateStaff) => {
      const staff = AppDataSource.getRepository(Staff).create({ nome, ruolo, img });
      const validationErrors = await validate(staff);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(Staff).save(staff);
   };

   public static deleteByID = async (id: string) => {
      const staff = await AppDataSource.getRepository(Staff).findOneBy({ id });
      if (!staff) throw new Error("Staff not found");
      return await AppDataSource.getRepository(Staff).delete({ id });
   };
}
