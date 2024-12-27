import { Request, Response } from "express";
import * as fs from "fs";
import path from "path";
import { debug } from "../utils/debug.util";

export default class LiveService {
   private static _instance: LiveService;
   private onAirTitleClients: Response[] = [];
   private onAirImageClients: Response[] = [];
   private titleFilePath = path.join("./meta", "OnAir.txt");
   private imageFilePath = path.join("./meta", "OnAir.jpg");
   private titleLastMod: number = 0;
   private imageLastMod: number = 0;

   public static get instance(): LiveService {
      if (!this._instance) {
         this._instance = new LiveService();
      }
      return this._instance;
   }

   public handleOnAirTitleClients = (req: Request, res: Response) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Aggiungi il client alla lista
      this.onAirTitleClients.push(res);
      debug("New Client for Title:", { data: res, status: "success" });
      const content = fs.readFileSync(this.titleFilePath, "utf8");
      res.write(`data: ${JSON.stringify({ content })}\n\n`);

      // Rimuovi il client alla chiusura della connessione
      req.on("close", () => {
         const index = this.onAirTitleClients.indexOf(res);
         if (index !== -1) {
            this.onAirTitleClients.splice(index, 1);
         }
      });
   };

   public handleOnAirImageClients = async (req: Request, res: Response) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Aggiungi il client alla lista
      this.onAirImageClients.push(res);
      const base64Image = await LiveService.getImageAsBase64(this.imageFilePath);
      res.write(`data: ${JSON.stringify({ content: base64Image })}\n\n`);

      // Rimuovi il client alla chiusura della connessione
      req.on("close", () => {
         const index = this.onAirImageClients.indexOf(res);
         if (index !== -1) {
            this.onAirImageClients.splice(index, 1);
         }
      });
   };

   public sendOnAirTitleEvent = () => {
      fs.watch(this.titleFilePath, (eventType) => {
         if (eventType === "change") {
            // Ottieni il tempo di modifica del file
            const stats = fs.statSync(this.titleFilePath);
            if (stats.mtimeMs != this.titleLastMod) {
               this.titleLastMod = stats.mtimeMs;

               // Leggi il contenuto del file
               const content = fs.readFileSync(this.titleFilePath, "utf8");
               debug("Nuovo Titolo", { data: content.toString(), status: "warning" });

               // Invia il contenuto ai client connessi
               this.onAirTitleClients.forEach((client) => {
                  client.write(`data: ${JSON.stringify({ content })}\n\n`);
               });
            }
         }
      });
   };

   public sendOnAirImageEvent = () => {
      fs.watch(this.imageFilePath, async (eventType) => {
         if (eventType === "change") {
            // Ottieni il tempo di modifica del file
            const stats = fs.statSync(this.imageFilePath);
            if (stats.mtimeMs != this.titleLastMod) {
               this.titleLastMod = stats.mtimeMs;

               // Leggi il contenuto del file
               const base64Image = await LiveService.getImageAsBase64(this.imageFilePath);

               // Invia il contenuto ai client connessi
               this.onAirImageClients.forEach((client) => {
                  client.write(`data: ${JSON.stringify({ content: base64Image })}\n\n`);
               });
            }
         }
      });
   };

   public static checkFolder = (folderName: string): void => {
      fs.access(folderName, fs.constants.F_OK, (err) => {
         if (err) {
            // La cartella non esiste, quindi creala
            fs.mkdir(folderName, { recursive: true }, (error) => {
               if (error) {
                  console.error("Errore durante la creazione della cartella " + folderName);
                  throw new Error("Errore durante la creazione della cartella " + folderName);
               }

               // Creazione dei file una volta che la cartella è stata creata
               this.createFiles(folderName);
            });
         } else {
            // La cartella esiste, quindi assicurati che i file siano presenti
            this.createFiles(folderName);
         }
      });
   };

   private static createFiles = (folderName: string): void => {
      // Percorsi dei file
      const txtFilePath = path.join(folderName, "OnAir.txt");
      const jpgFilePath = path.join(folderName, "OnAir.jpg");

      // Creazione del file OnAir.txt
      fs.writeFile(txtFilePath, "On Air", { flag: "wx" }, (txtErr) => {
         if (txtErr && txtErr.code !== "EEXIST") {
            console.error("Errore durante la creazione di OnAir.txt: ", txtErr);
            throw new Error("Errore durante la creazione di OnAir.txt");
         }
      });

      // Creazione del file OnAir.jpg (file vuoto)
      fs.writeFile(jpgFilePath, "", { flag: "wx" }, (jpgErr) => {
         if (jpgErr && jpgErr.code !== "EEXIST") {
            console.error("Errore durante la creazione di OnAir.jpg: ", jpgErr);
            throw new Error("Errore durante la creazione di OnAir.jpg");
         }
      });
   };

   private static getImageAsBase64 = (
      filePath: string,
      retries = 5,
      delay = 500
   ): Promise<string> => {
      return new Promise((resolve, reject) => {
         const attemptRead = (remainingRetries: number) => {
            fs.readFile(filePath, (err, data) => {
               if (err) {
                  if (err.code === "EBUSY" && remainingRetries > 0) {
                     // Ritenta dopo un ritardo
                     setTimeout(() => attemptRead(remainingRetries - 1), delay);
                  } else {
                     console.error("Errore durante la lettura del file immagine:", err);
                     reject(new Error("Immagine non disponibile"));
                  }
               } else {
                  // Conversione in Base64
                  resolve(data.toString("base64"));
               }
            });
         };

         attemptRead(retries);
      });
   };
}
