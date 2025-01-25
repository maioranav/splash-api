import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Programma } from "./Programma";
import { Giorni } from "../types/giorni.enum";

@Entity()
export class Appuntamento {
   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @ManyToOne(() => Programma, { onDelete: "CASCADE" })
   programma!: Programma;

   @Column()
   giorno!: Giorni;

   @Column()
   inizio!: string;

   @Column()
   fine!: string;
}
