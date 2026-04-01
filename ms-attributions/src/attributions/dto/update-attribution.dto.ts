import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributionDto } from './create-attribution.dto';

export class UpdateAttributionDto extends PartialType(CreateAttributionDto) {}
