import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ExpenseCategory,
  IncomeSource,
  PaymentMethod,
  TransactionType,
} from '../../generated/prisma/client.js';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsEnum(IncomeSource)
  incomeSource?: IncomeSource;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsDateString()
  date: string;

  @IsInt()
  accountId: number;
}
