import { validate } from "class-validator";
import { AppDataSource } from "../config/data-source.config";
import { Staff } from "../model/Staff";
import { CreateStaff } from "../types/staff.dto.type";
import { SocialContacts } from "../model/SocialContacts";

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

   public static updateOne = async (id: string, body: Staff) => {
      const staff = await AppDataSource.getRepository(Staff).findOneBy({ id });
      if (!staff) throw new Error("Staff not found");

      Object.keys(body).forEach((key) => {
         if (key in staff) {
            (staff as any)[key] = (body as any)[key];
         }
      });

      const validationErrors = await validate(staff);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      if (body.social && !body.social.id) {
         staff.social = await StaffService.createSocialContacts(body.social);
      } else if (body.social && body.social.id) {
         await StaffService.updateSocialContacts(body.social.id, body.social);
      }

      await AppDataSource.getRepository(Staff).update(id, staff);
      return staff;
   };

   public static deleteByID = async (id: string) => {
      const staff = await AppDataSource.getRepository(Staff).findOneBy({ id });
      if (!staff) throw new Error("Staff not found");
      return await AppDataSource.getRepository(Staff).delete({ id });
   };

   public static createSocialContacts = async (body: SocialContacts) => {
      const social = AppDataSource.getRepository(SocialContacts).create(body);
      const validationErrors = await validate(social);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");

      return await AppDataSource.getRepository(SocialContacts).save(social);
   };

   public static updateSocialContacts = async (id: string, body: SocialContacts) => {
      const social = await AppDataSource.getRepository(SocialContacts).findOneBy({ id });
      if (!social) throw new Error("SocialContacts not found");

      Object.keys(body).forEach((key) => {
         if (key in social) {
            (social as any)[key] = (body as any)[key];
         }
      });

      const validationErrors = await validate(social);
      if (validationErrors?.length > 0) throw new Error(validationErrors + "");
      await AppDataSource.getRepository(SocialContacts).update(id, social);
      return social;
   };
}
