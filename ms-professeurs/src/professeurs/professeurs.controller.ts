import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfesseursService } from './professeurs.service';
import { CreateProfesseurDto } from './dto/create-professeur.dto';
import { UpdateProfesseurDto } from './dto/update-professeur.dto';

@Controller('professeurs')
export class ProfesseursController {
  constructor(private readonly professeursService: ProfesseursService) {}

  @Post()
  create(@Body() createProfesseurDto: CreateProfesseurDto) {
    return this.professeursService.create(createProfesseurDto);
  }

  @Get()
  findAll() {
    return this.professeursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professeursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfesseurDto: UpdateProfesseurDto) {
    return this.professeursService.update(+id, updateProfesseurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professeursService.remove(+id);
  }
}
