import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttributionDto } from './dto/create-attribution.dto';
import { UpdateAttributionDto } from './dto/update-attribution.dto';
import { Attribution } from './entities/attribution.entity';

@Injectable()
export class AttributionsService {
  constructor(
    @InjectRepository(Attribution)
    private readonly attributionRepository: Repository<Attribution>,
  ) {}

  create(createAttributionDto: CreateAttributionDto) {
    const nouvelleAttribution = this.attributionRepository.create(createAttributionDto);
    return this.attributionRepository.save(nouvelleAttribution);
  }

  findAll() {
    return this.attributionRepository.find();
  }

  findOne(id: number) {
    return this.attributionRepository.findOneBy({ id });
  }

  async update(id: number, updateAttributionDto: UpdateAttributionDto) {
    await this.attributionRepository.update(id, updateAttributionDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.attributionRepository.delete(id);
    return { deleted: true };
  }
}
