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
import { BudgetsService } from './budgets.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Get()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.budgetsService.findAll(userId);
  }

  @Get('period/:year/:month')
  findByPeriod(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.budgetsService.findByPeriod(userId, year, month);
  }

  @Get(':budgetId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('budgetId', ParseIntPipe) budgetId: number,
  ) {
    return this.budgetsService.findOne(userId, budgetId);
  }

  @Patch(':budgetId')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('budgetId', ParseIntPipe) budgetId: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(userId, budgetId, updateBudgetDto);
  }

  @Delete(':budgetId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('budgetId', ParseIntPipe) budgetId: number,
  ) {
    return this.budgetsService.remove(userId, budgetId);
  }
}
