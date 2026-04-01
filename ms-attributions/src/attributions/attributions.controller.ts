import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttributionsService } from './attributions.service';
import { CreateAttributionDto } from './dto/create-attribution.dto';
import { UpdateAttributionDto } from './dto/update-attribution.dto';

@Controller('attributions')
export class AttributionsController {
  constructor(private readonly attributionsService: AttributionsService) {}

  @Post()
  create(@Body() createAttributionDto: CreateAttributionDto) {
    return this.attributionsService.create(createAttributionDto);
  }

  @Get()
  findAll() {
    return this.attributionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttributionDto: UpdateAttributionDto) {
    return this.attributionsService.update(+id, updateAttributionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributionsService.remove(+id);
  }
}
