import { IsString, IsNumber, IsOptional, IsDateString, Min, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateRecordDto {
  @IsString()
  property_address: string;

  @IsDateString()
  transaction_date: string;

  @IsString()
  borrower_name: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  loan_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sales_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  down_payment?: number;

  @IsOptional()
  @IsString()
  apn?: string;

  @IsOptional()
  @IsString()
  loan_officer_name?: string;

  @IsOptional()
  @IsString()
  nmls_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  loan_term?: number;

  @IsOptional()
  @IsString()
  source_image_url?: string;
}
