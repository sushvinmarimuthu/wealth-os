import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Controller('transactions/:secretKey')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Param('secretKey') secretKey: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(secretKey, createTransactionDto);
  }

  @Get()
  findAll(@Param('secretKey') secretKey: string) {
    return this.transactionsService.findAll(secretKey);
  }

  @Get('account/:accountId')
  findByAccount(
    @Param('secretKey') secretKey: string,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.transactionsService.findByAccount(secretKey, accountId);
  }

  @Get(':transactionId')
  findOne(
    @Param('secretKey') secretKey: string,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.transactionsService.findOne(secretKey, transactionId);
  }

  @Patch(':transactionId')
  update(
    @Param('secretKey') secretKey: string,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      secretKey,
      transactionId,
      updateTransactionDto,
    );
  }

  @Delete(':transactionId')
  remove(
    @Param('secretKey') secretKey: string,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.transactionsService.remove(secretKey, transactionId);
  }
}
