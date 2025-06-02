import { Controller, Get, Post, Body, Param, Put, Query, Request, Patch } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';

// @UseGuards(JwtAuthGuard) // Commented out for development
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async create(@Body() createRecordDto: CreateRecordDto, @Request() req: any) {
    console.log('Controller: Received create request with data:', createRecordDto);
    
    try {
      // Use fallback user ID for development
      const userId = req.user?.userId || 'dev-user';
      console.log('Controller: Using userId:', userId);
      
      const result = await this.recordsService.create(createRecordDto, userId);
      console.log('Controller: Record created successfully:', result.id);
      
      return result;
    } catch (error) {
      console.error('Controller: Failed to create record:', error);
      throw error;
    }
  }

  @Get('search')
  search(@Query() searchDto: SearchRecordsDto) {
    return this.recordsService.searchRecords(searchDto);
  }

  @Get('autocomplete/:field')
  async autocomplete(
    @Param('field') field: string,
    @Query('q') query: string,
    @Query('limit') limit: string = '10',
  ) {
    // Map frontend field names to backend field names
    const fieldMapping = {
      'propertyAddress': 'property_address',
      'borrowerName': 'borrower_name',
      'apn': 'apn',
      'loanOfficerName': 'loan_officer_name'
    };

    const mappedField = fieldMapping[field] || field;
    return this.recordsService.autocomplete(mappedField, query, parseInt(limit, 10));
  }

  @Get('statistics')
  getStatistics() {
    return this.recordsService.getRecordStatistics();
  }

  @Get('batch/:batchId')
  getRecordsByBatch(@Param('batchId') batchId: string, @Request() req: any) {
    const userId = req.user?.userId || 'dev-user';
    return this.recordsService.getRecordsByBatch(batchId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateRecordDto>, @Request() req: any) {
    const userId = req.user?.userId || 'dev-user';
    return this.recordsService.update(id, updateData, userId);
  }

  @Put(':id/lock')
  lock(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || 'dev-user';
    return this.recordsService.lock(id, userId);
  }

  @Put(':id/unlock')
  unlock(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || 'dev-user';
    return this.recordsService.unlock(id, userId);
  }

  @Put(':id/verify')
  verify(
    @Param('id') id: string,
    @Body('isGood') isGood: boolean,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || 'dev-user';
    return this.recordsService.verifyRecord(id, userId, isGood);
  }
}