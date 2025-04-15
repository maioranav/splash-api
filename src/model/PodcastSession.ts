import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Podcast } from "./Podcast";

@Entity()
export class PodcastSession {
   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @Column()
   num!: number;

   @Column()
   url!: string;

   @ManyToOne(() => Podcast, { onDelete: "CASCADE" })
   podcast!: Podcast;
}
