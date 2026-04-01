import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatieresService } from './matieres.service';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';

@Controller('matieres')
export class MatieresController {
  constructor(private readonly matieresService: MatieresService) {}

  @Post()
  create(@Body() createMatiereDto: CreateMatiereDto) {
    return this.matieresService.create(createMatiereDto);
  }

  @Get()
  findAll() {
    return this.matieresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matieresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatiereDto: UpdateMatiereDto) {
    return this.matieresService.update(+id, updateMatiereDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matieresService.remove(+id);
  }
}
