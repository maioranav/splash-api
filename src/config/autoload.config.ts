import { AppDataSource } from "./data-source.config";
import { Admin } from "../model/Admin";
import AdminService from "../services/admin.service";
import { MainConf } from "../model/MainConf";
import { MainType } from "../model/mainconf.enum";
import { randomUUID } from "crypto";
import LiveService from "../services/live.service";

export const AutoLoad = async () => {
   const mainAdmin = new Admin();
   mainAdmin.username = process.env.TYPEORM_ADMIN ?? "admin";
   mainAdmin.password = await AdminService.passwordEncrypt(
      process.env.TYPEORM_PASSWORD ?? "password"
   );

   // Autoconfig for the admin user if it doesn't exist yet
   try {
      AppDataSource.transaction(async (manager) => {
         const isSaved = await manager.findOneBy(Admin, { username: mainAdmin.username });
         if (!isSaved) return manager.save(mainAdmin);

         isSaved.password = mainAdmin.password;
         manager.save(isSaved);
      });
   } catch (e) {
      console.error(e);
   }

   // Autoconfig for nonce generation
   try {
      AppDataSource.transaction(async (manager) => {
         const isSaved = await manager.findOneBy(MainConf, { title: MainType.FESECRET });
         if (!isSaved)
            return manager.save(
               manager.create(MainConf, { title: MainType.FESECRET, data: randomUUID() })
            );
      });
   } catch (e) {
      console.error(e);
   }
};
