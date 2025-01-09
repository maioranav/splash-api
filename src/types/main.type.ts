import { Request, Router } from "express";
import { FtpServerOptions } from "ftp-srv";

export interface ApiConfig {
   name: string;
   port: number;
   controllers: Controller[];
}

export interface FtpConfig {
   username: string;
   password: string;
   enable: boolean;
   options: FtpServerOptions;
}

export interface Controller {
   path: string;
   router: Router;
}

export interface Service {}

export interface ImageUploadRequest extends Request {
   newFileName?: string;
}
