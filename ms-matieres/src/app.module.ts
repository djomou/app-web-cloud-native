import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatieresModule } from './matieres/matieres.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db', // Toujours ton IP statique
      port: 5432,            // Le port de ton conteneur Docker
      username: 'yugabyte',
      password: 'yugabyte',
      database: 'school_project',
      autoLoadEntities: true,
      synchronize: true,
    }),
    MatieresModule,
  ],
})
export class AppModule {}
