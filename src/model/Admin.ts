import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Admin {
   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @Column({ unique: true })
   username!: string;

   @Column()
   password!: string;
}
