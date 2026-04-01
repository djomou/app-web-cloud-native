import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Attribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  professeurId: number; // Référence à l'ID du microservice 3000

  @Column()
  matiereId: number;    // Référence à l'ID du microservice 3001

  @Column()
  anneeAcademique: string; // Exemple: "2025-2026"

  @CreateDateColumn()
  dateAttribution: Date;
}
