import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { Batch } from './entities/batch.entity';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  create(@Body() createBatchDto: Partial<Batch>) {
    return this.batchesService.create(createBatchDto);
  }

  @Get()
  findAll() {
    return this.batchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBatchDto: Partial<Batch>) {
    return this.batchesService.update(id, updateBatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.batchesService.remove(id);
  }
}