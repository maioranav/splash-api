import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { Ruoli } from "../types/ruoli.enum";
import { SocialContacts } from "./SocialContacts";
import { Programma } from "./Programma";
import { IsEnum, IsOptional } from "class-validator";

@Entity()
export class Staff {
   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @Column()
   nome!: string;

   @Column()
   @IsEnum(Ruoli)
   ruolo!: Ruoli;

   @Column({ nullable: true })
   @IsOptional()
   img?: string;

   @OneToOne(() => SocialContacts, (sc: SocialContacts) => sc.staff, {
      onDelete: "CASCADE",
      nullable: true
   })
   @JoinColumn()
   @IsOptional()
   social?: SocialContacts;

   @OneToMany(() => Programma, (p: Programma) => p.artista, { onDelete: "CASCADE", nullable: true })
   @IsOptional()
   programmi?: Programma[];
}
