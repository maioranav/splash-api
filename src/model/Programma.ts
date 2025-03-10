import {
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   OneToMany,
   OneToOne,
   PrimaryGeneratedColumn
} from "typeorm";
import { Staff } from "./Staff";
import { Podcast } from "./Podcast";
import { Appuntamento } from "./Appuntamento";

@Entity()
export class Programma {
   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @Column()
   titolo!: string;

   @Column({ nullable: true })
   img!: string;

   @ManyToOne(() => Staff, { onDelete: "CASCADE" })
   artista!: Staff;

   @OneToOne(() => Podcast, (p: Podcast) => p.programma, { onDelete: "CASCADE", nullable: true })
   @JoinColumn()
   podcast!: Podcast;

   @OneToMany(() => Appuntamento, (a: Appuntamento) => a.programma, {
      onDelete: "CASCADE",
      nullable: true
   })
   appuntamenti!: Appuntamento[];
}
