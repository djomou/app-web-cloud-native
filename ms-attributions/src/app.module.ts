import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributionsModule } from './attributions/attributions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db', // IP normalement mais db car docker compose 
      port: 5432,            // Le port qu'on a exposé dans Docker
      username: 'yugabyte',
      password: 'yugabyte',
      database: 'school_project',
      autoLoadEntities: true,
      synchronize: true,      // Très utile en développement pour créer les tables automatiquement
    }),
    AttributionsModule,
  ],
})
export class AppModule {}
