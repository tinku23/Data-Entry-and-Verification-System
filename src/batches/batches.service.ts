import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
  ) {}

  async create(createBatchDto: Partial<Batch>) {
    const batch = this.batchRepo.create(createBatchDto);
    return this.batchRepo.save(batch);
  }

  async findAll() {
    return this.batchRepo.find({
      relations: ['records'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.batchRepo.findOne({
      where: { id },
      relations: ['records'],
    });
  }

  async update(id: string, updateBatchDto: Partial<Batch>) {
    await this.batchRepo.update(id, updateBatchDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.batchRepo.delete(id);
  }
}