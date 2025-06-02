import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRecordsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  property_address?: string;

  @IsOptional()
  @IsString()
  borrower_name?: string;

  @IsOptional()
  @IsString()
  apn?: string;

  @IsOptional()
  @IsEnum(['Pending', 'Verified', 'Flagged'])
  status?: 'Pending' | 'Verified' | 'Flagged';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
