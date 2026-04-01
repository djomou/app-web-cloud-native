import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Matiere {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Exemple: "ALGO-1", "DB-2"

  @Column()
  intitule: string; // Exemple: "Algorithmique"

  @Column('int')
  credits: number; // Coefficient ou nombre de crédits
}
