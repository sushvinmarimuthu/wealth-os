import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { BudgetStatus } from '../generated/prisma/enums.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createBudgetDto: CreateBudgetDto) {
    await this.ensureUserExists(userId);

    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        name: createBudgetDto.name,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
      },
    });

    if (existingBudget) {
      throw new ConflictException(
        `A budget named "${createBudgetDto.name}" already exists for ${createBudgetDto.month}/${createBudgetDto.year}`,
      );
    }

    const budget = await this.prisma.budget.create({
      data: {
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        status: createBudgetDto.status ?? BudgetStatus.ACTIVE,
        userId,
      },
    });

    return this.toResponse(budget);
  }

  async findAll(userId: number) {
    await this.ensureUserExists(userId);

    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });

    return budgets.map((budget) => this.toResponse(budget));
  }

  async findByPeriod(userId: number, year: number, month: number) {
    await this.ensureUserExists(userId);

    const budgets = await this.prisma.budget.findMany({
      where: { userId, year, month },
      orderBy: { createdAt: 'asc' },
    });

    return budgets.map((budget) => this.toResponse(budget));
  }

  async findOne(userId: number, budgetId: number) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    return this.toResponse(budget);
  }

  async update(
    userId: number,
    budgetId: number,
    updateBudgetDto: UpdateBudgetDto,
  ) {
    const existing = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    const newName = updateBudgetDto.name ?? existing.name;
    const newMonth = updateBudgetDto.month ?? existing.month;
    const newYear = updateBudgetDto.year ?? existing.year;

    const conflictingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        name: newName,
        month: newMonth,
        year: newYear,
        NOT: { id: budgetId },
      },
    });

    if (conflictingBudget) {
      throw new ConflictException(
        `A budget named "${newName}" already exists for ${newMonth}/${newYear}`,
      );
    }

    const budget = await this.prisma.budget.update({
      where: { id: budgetId },
      data: { ...updateBudgetDto },
    });

    return this.toResponse(budget);
  }

  async remove(userId: number, budgetId: number) {
    const existing = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    await this.prisma.budget.delete({
      where: { id: budgetId },
    });

    return { message: 'Budget deleted successfully' };
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private toResponse(budget: {
    id: number;
    name: string;
    amount: unknown;
    month: number;
    year: number;
    status: BudgetStatus;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: budget.id,
      name: budget.name,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      status: budget.status,
      userId: budget.userId,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }
}
