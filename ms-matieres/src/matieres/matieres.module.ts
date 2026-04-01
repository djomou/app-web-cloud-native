import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatieresService } from './matieres.service';
import { MatieresController } from './matieres.controller';
import { Matiere } from './entities/matiere.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Matiere])],
  controllers: [MatieresController],
  providers: [MatieresService],
})
export class MatieresModule {}
