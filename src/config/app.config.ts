import dotenv from "dotenv";
import { ApiConfig } from "../types/main.type";
import StaffController from "../controller/staff.controller";
import AdminController from "../controller/admin.controller";
import MainConfController from "../controller/mainconf.controller";
import ImagesController from "../controller/images.controller";
import ProgrammaController from "../controller/programma.controller";
import LiveController from "../controller/live.controller";
import AppuntamentoController from "../controller/appuntamento.controller";
import MailerController from "../controller/mailer.controller";
import PodcastController from "../controller/podcast.controller";
import { FtpServerOptions } from "ftp-srv";

// Environment constraints
dotenv.config();

export const apiConfig: ApiConfig = {
   name: "Splash Main BE",
   port: Number(process.env.PORT) || 3001,
   controllers: [
      new AdminController(),
      new MainConfController(),
      new StaffController(),
      new ImagesController(),
      new ProgrammaController(),
      new AppuntamentoController(),
      new LiveController(),
      new MailerController(),
      new PodcastController()
   ]
};

export const mailConfig = {
   host: process.env.SMTP_MAIL_HOST || "smtp.gmail.com",
   port: Number(process.env.SMTP_MAIL_PORT) || 587,
   secure: false,
   auth: {
      user: process.env.SMTP_MAIL_USER,
      pass: process.env.SMTP_MAIL_PASS
   }
};

const ftpOptions: FtpServerOptions = {
   url: "ftp://" + (process.env.FTP_HOST || "0.0.0.0") + ":" + (process.env.FTP_PORT || "21"),
   anonymous: false,
   blacklist: ["MKD"],
   pasv_min: 10010,
   pasv_max: 10011
};

export const ftpConfig = {
   enable: Boolean(process.env.FTP_ENABLE || "false"),
   username: process.env.FTP_USER || "baseuser",
   password: process.env.FTP_PASS || "basepassword",
   options: ftpOptions
};
