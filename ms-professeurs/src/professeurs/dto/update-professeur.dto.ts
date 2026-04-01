import { PartialType } from '@nestjs/mapped-types';
import { CreateProfesseurDto } from './create-professeur.dto';

export class UpdateProfesseurDto extends PartialType(CreateProfesseurDto) {}
