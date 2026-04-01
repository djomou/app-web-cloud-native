import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ajoute cet import
import { ProfesseursService } from './professeurs.service';
import { ProfesseursController } from './professeurs.controller';
import { Professeur } from './entities/professeur.entity'; // Ajoute cet import

@Module({
  imports: [TypeOrmModule.forFeature([Professeur])], // Ajoute cette ligne
  controllers: [ProfesseursController],
  providers: [ProfesseursService],
})
export class ProfesseursModule {}
