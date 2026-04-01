import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Professeur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  specialite: string;
}
