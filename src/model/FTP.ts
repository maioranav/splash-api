import FtpServer, { GeneralError } from "ftp-srv";
import { FtpConfig } from "../types/main.type";
import { debug } from "../utils/debug.util";

export default class FTP {
   private ftpServer;
   private username: string;
   private password: string;

   constructor(ftpInit: FtpConfig) {
      this.username = ftpInit.username;
      this.password = ftpInit.password;

      if (!ftpInit.enable) return;

      this.ftpServer = new FtpServer(ftpInit.options);
      this.initialize();
   }

   private initialize = () => {
      this.ftpServer?.on("login", ({ connection, username, password }, resolve, reject) => {
         if (username === this.username && password === this.password) {
            return resolve({ root: "meta" });
         }
         return reject(new GeneralError("Invalid username or password", 401));
      });
   };

   public listen() {
      if (!this.ftpServer) {
         debug("No ftp server listening", { status: "warning" });
         return;
      }

      this.ftpServer?.listen().then(() => {
         debug("Ftp server started", { status: "success" });
      });
   }
}
