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
import { RecurringTransactionsService } from './recurring-transactions.service.js';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto.js';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto.js';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    dto: CreateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.create(userId, dto);
  }

  @Get()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.recurringTransactionsService.findAll(userId);
  }

  @Get('active')
  findActive(@Param('userId', ParseIntPipe) userId: number) {
    return this.recurringTransactionsService.findActive(userId);
  }

  @Get(':recurringId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recurringId', ParseIntPipe)
    recurringId: number,
  ) {
    return this.recurringTransactionsService.findOne(userId, recurringId);
  }

  @Patch(':recurringId')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recurringId', ParseIntPipe)
    recurringId: number,
    @Body()
    dto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.update(userId, recurringId, dto);
  }

  @Post(':recurringId/activate')
  activate(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recurringId', ParseIntPipe)
    recurringId: number,
  ) {
    return this.recurringTransactionsService.activate(userId, recurringId);
  }

  @Post(':recurringId/deactivate')
  deactivate(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recurringId', ParseIntPipe)
    recurringId: number,
  ) {
    return this.recurringTransactionsService.deactivate(userId, recurringId);
  }

  @Delete(':recurringId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recurringId', ParseIntPipe)
    recurringId: number,
  ) {
    return this.recurringTransactionsService.remove(userId, recurringId);
  }
}
