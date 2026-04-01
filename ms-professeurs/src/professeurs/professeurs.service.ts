import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfesseurDto } from './dto/create-professeur.dto';
import { UpdateProfesseurDto } from './dto/update-professeur.dto'; // Importation nécessaire
import { Professeur } from './entities/professeur.entity';

@Injectable()
export class ProfesseursService {
  constructor(
    @InjectRepository(Professeur)
    private professeursRepository: Repository<Professeur>,
  ) {}
  create(createProfesseurDto: CreateProfesseurDto) {
    const nouveauProf = this.professeursRepository.create(createProfesseurDto);
    return this.professeursRepository.save(nouveauProf);
  }
  findAll() {
    return this.professeursRepository.find();
  }
  // Ajoute cette méthode pour trouver un professeur par son ID
  findOne(id: number) {
    return this.professeursRepository.findOneBy({ id });
  }
  // Ajoute cette méthode pour mettre à jour
  async update(id: number, updateProfesseurDto: UpdateProfesseurDto) {
    await this.professeursRepository.update(id, updateProfesseurDto);
    return this.findOne(id);
  }

  // Ajoute cette méthode pour supprimer
  async remove(id: number) {
    await this.professeursRepository.delete(id);
    return { deleted: true };
  }
}
