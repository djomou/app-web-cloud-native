import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributionsService } from './attributions.service';
import { AttributionsController } from './attributions.controller';
import { Attribution } from './entities/attribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attribution])],
  controllers: [AttributionsController],
  providers: [AttributionsService],
})
export class AttributionsModule {}
