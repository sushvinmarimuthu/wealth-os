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
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto.js';
import { SavingsGoalsService } from './savings-goals.service.js';
import { ContributeSavingsGoalDto } from './dto/contribute-savings-goal.dto.js';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto.js';

@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createDto: CreateSavingsGoalDto,
  ) {
    return this.savingsGoalsService.create(userId, createDto);
  }

  @Get()
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.savingsGoalsService.findAll(userId);
  }

  @Get(':goalId')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('goalId', ParseIntPipe) goalId: number,
  ) {
    return this.savingsGoalsService.findOne(userId, goalId);
  }

  @Patch(':goalId')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() updateDto: UpdateSavingsGoalDto,
  ) {
    return this.savingsGoalsService.update(userId, goalId, updateDto);
  }

  @Post(':goalId/contribute')
  contribute(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() contributeDto: ContributeSavingsGoalDto,
  ) {
    return this.savingsGoalsService.contribute(userId, goalId, contributeDto);
  }

  @Post(':goalId/cancel')
  cancel(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('goalId', ParseIntPipe) goalId: number,
  ) {
    return this.savingsGoalsService.cancel(userId, goalId);
  }

  @Delete(':goalId')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('goalId', ParseIntPipe) goalId: number,
  ) {
    return this.savingsGoalsService.remove(userId, goalId);
  }
}
