import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';
import { Matiere } from './entities/matiere.entity';

@Injectable()
export class MatieresService {
  constructor(
    @InjectRepository(Matiere)
    private readonly matiereRepository: Repository<Matiere>,
  ) {}

  create(createMatiereDto: CreateMatiereDto) {
    const nouvelleMatiere = this.matiereRepository.create(createMatiereDto);
    return this.matiereRepository.save(nouvelleMatiere);
  }

  findAll() {
    return this.matiereRepository.find();
  }

  findOne(id: number) {
    return this.matiereRepository.findOneBy({ id });
  }

  async update(id: number, updateMatiereDto: UpdateMatiereDto) {
    await this.matiereRepository.update(id, updateMatiereDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.matiereRepository.delete(id);
    return { deleted: true };
  }
}
