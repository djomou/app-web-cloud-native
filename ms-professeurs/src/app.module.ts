import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesseursModule } from './professeurs/professeurs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db', // Ton IP statique
      port: 5432,            // Le port qu'on a exposé dans Docker
      username: 'yugabyte',
      password: 'yugabyte',
      database: 'school_project',
      autoLoadEntities: true,
      synchronize: true,      // Très utile en développement pour créer les tables automatiquement
    }),
    ProfesseursModule,
  ],
})
export class AppModule {}
