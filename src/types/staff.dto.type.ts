import { Programma } from "../model/Programma";
import { SocialContacts } from "../model/SocialContacts";
import { Ruoli } from "./ruoli.enum";

export interface CreateStaff {
   nome: string;
   ruolo: Ruoli;
   img?: string;
   social?: SocialContacts;
   programmi?: Programma[];
}
