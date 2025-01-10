import { Request, Response } from "express";
import * as fs from "fs";
import path from "path";
import { debug } from "../utils/debug.util";
import multer from "multer";

export default class LiveService {
   private static _instance: LiveService;
   private onAirClients: Response[] = [];
   private titleFilePath = path.join("./meta", "OnAir.txt");
   private imageFilePath = path.join("./meta", "OnAir.jpg");
   private titleLastMod: number = 0;
   private upload: multer.Multer;

   public static get instance(): LiveService {
      if (!this._instance) {
         this._instance = new LiveService();
      }
      return this._instance;
   }

   private constructor() {
      this.upload = this.configureMulter();
   }

   private configureMulter() {
      return multer({
         storage: multer.diskStorage({
            destination: (req, file, cb) => {
               cb(null, path.join("./meta")); // Percorso della cartella dove salvare il file
            },
            filename: (req, file, cb) => {
               cb(null, "OnAir.jpg"); // Nome fisso del file
            }
         }),
         fileFilter: (req, file, cb) => {
            // Controlla il tipo di file
            if (file.mimetype === "image/jpeg") {
               cb(null, true);
            } else {
               cb(new Error("Il file deve essere un JPG"));
            }
         },
         limits: { fileSize: 5 * 1024 * 1024 } // Limite massimo del file (5 MB)
      });
   }

   public handleOnAirClients = async (req: Request, res: Response) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Aggiungi il client alla lista
      this.onAirClients.push(res);
      debug("New Client:", { data: res, status: "success" });

      const title = fs.readFileSync(this.titleFilePath, "utf8");
      const base64Image = await LiveService.getImageAsBase64(this.imageFilePath);

      res.write(`data: ${JSON.stringify({ cover: base64Image, title })}\n\n`);

      // Rimuovi il client alla chiusura della connessione
      req.on("close", () => {
         const index = this.onAirClients.indexOf(res);
         if (index !== -1) {
            this.onAirClients.splice(index, 1);
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
               this.onAirClients.forEach((client) => {
                  client.write(`data: ${JSON.stringify({ title: content })}\n\n`);
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
               this.onAirClients.forEach((client) => {
                  client.write(`data: ${JSON.stringify({ cover: base64Image })}\n\n`);
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

   public updateOnAirTitleClients = (req: Request, res: Response) => {
      try {
         const content = req.body.content as string;
         fs.writeFile(this.titleFilePath, content, (err) => {
            if (err) {
               debug("Errore durante la scrittura del file OnAir.txt:", {
                  data: err,
                  status: "error"
               });
               res.status(500).json({ message: "Errore durante la scrittura del file" });
            } else {
               debug("Titolo aggiornato", { data: content, status: "success" });
               res.status(200).json({ message: "Titolo aggiornato con successo" });
            }
         });
      } catch (err) {
         debug("Errore durante la scrittura del file OnAir.txt:", {
            data: err as object,
            status: "error"
         });
         res.status(500).json({ message: "Errore durante la scrittura del file" });
      }
   };

   public updateOnAirImageClients = (req: Request, res: Response) => {
      const singleUpload = this.upload.single("file"); // 'file' è il nome del campo formData

      singleUpload(req, res, (err) => {
         if (err) {
            // Gestione errori di upload
            if (err instanceof multer.MulterError) {
               return res.status(400).json({ message: `Errore Multer: ${err.message}` });
            } else {
               return res.status(400).json({ message: err.message });
            }
         }

         // Successo
         debug("Immagine aggiornata con successo", { status: "success" });
         res.status(200).json({ message: "Immagine aggiornata con successo" });
      });
   };

   public static debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout | null;
      return (...args: any[]) => {
         if (timeout) clearTimeout(timeout);
         timeout = setTimeout(() => func(...args), wait);
      };
   };
}
