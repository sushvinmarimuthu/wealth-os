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

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Param('secretKey', ParseIntPipe) secretKey: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(secretKey, createTransactionDto);
  }

  @Get()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.findAll(userId);
  }

  @Get('account/:accountId')
  findByAccount(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.transactionsService.findByAccount(userId, accountId);
  }

  @Get(':transactionId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.transactionsService.findOne(userId, transactionId);
  }

  @Patch(':transactionId')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      userId,
      transactionId,
      updateTransactionDto,
    );
  }

  @Delete(':transactionId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.transactionsService.remove(userId, transactionId);
  }
}
