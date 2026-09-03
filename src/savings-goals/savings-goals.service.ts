import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SavingsGoalStatus } from '../generated/prisma/enums.js';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto.js';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto.js';
import { ContributeSavingsGoalDto } from './dto/contribute-savings-goal.dto.js';

@Injectable()
export class SavingsGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createDto: CreateSavingsGoalDto) {
    await this.ensureUserExists(userId);

    const targetDate = new Date(createDto.targetDate);

    if (targetDate <= new Date()) {
      throw new BadRequestException('Target date must be in the future');
    }

    const goal = await this.prisma.savingsGoal.create({
      data: {
        name: createDto.name,
        targetAmount: createDto.targetAmount,
        currentAmount: 0,
        targetDate,
        userId,
        status: SavingsGoalStatus.IN_PROGRESS,
      },
    });

    return this.toResponse(goal);
  }

  async findAll(userId: number) {
    await this.ensureUserExists(userId);

    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
    });

    return goals.map((goal) => this.toResponse(goal));
  }

  async findOne(userId: number, goalId: number) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException(`Savings goal with ID ${goalId} not found`);
    }

    return this.toResponse(goal);
  }

  async update(
    userId: number,
    goalId: number,
    updateDto: UpdateSavingsGoalDto,
  ) {
    const existing = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new NotFoundException(`Savings goal with ID ${goalId} not found`);
    }

    if (updateDto.targetDate) {
      const targetDate = new Date(updateDto.targetDate);

      if (targetDate <= new Date()) {
        throw new BadRequestException('Target date must be in the future');
      }
    }

    const goal = await this.prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        ...(updateDto.name !== undefined && {
          name: updateDto.name,
        }),
        ...(updateDto.targetDate !== undefined && {
          targetDate: new Date(updateDto.targetDate),
        }),
      },
    });

    return this.toResponse(goal);
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async contribute(
    userId: number,
    goalId: number,
    contributeDto: ContributeSavingsGoalDto,
  ) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException(`Savings goal with ID ${goalId} not found`);
    }

    if (goal.status === SavingsGoalStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot contribute to a completed savings goal',
      );
    }

    if (goal.status === SavingsGoalStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot contribute to a cancelled savings goal',
      );
    }

    const newAmount = Number(goal.currentAmount) + contributeDto.amount;
    const targetAmount = Number(goal.targetAmount);

    const status =
      newAmount >= targetAmount
        ? SavingsGoalStatus.COMPLETED
        : SavingsGoalStatus.IN_PROGRESS;

    const updatedGoal = await this.prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: { increment: contributeDto.amount },
        status,
      },
    });

    return this.toResponse(updatedGoal);
  }

  async cancel(userId: number, goalId: number) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException(`Savings goal with ID ${goalId} not found`);
    }

    if (goal.status === SavingsGoalStatus.COMPLETED) {
      throw new BadRequestException(
        'A completed savings goal cannot be cancelled',
      );
    }

    const updatedGoal = await this.prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        status: SavingsGoalStatus.CANCELLED,
      },
    });

    return this.toResponse(updatedGoal);
  }

  async remove(userId: number, goalId: number) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException(`Savings goal with ID ${goalId} not found`);
    }

    await this.prisma.savingsGoal.delete({
      where: { id: goalId },
    });

    return { message: 'Savings goal deleted successfully' };
  }

  private toResponse(goal: {
    id: number;
    name: string;
    targetAmount: unknown;
    currentAmount: unknown;
    targetDate: Date;
    status: SavingsGoalStatus;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const targetAmount = Number(goal.targetAmount);
    const currentAmount = Number(goal.currentAmount);

    const remainingAmount = Math.max(targetAmount - currentAmount, 0);

    const progressPercentage =
      targetAmount > 0
        ? Math.min((currentAmount / targetAmount) * 100, 100)
        : 0;

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remainingAmount,
      progressPercentage: Number(progressPercentage.toFixed(2)),
      targetDate: goal.targetDate,
      status: goal.status,
      userId: goal.userId,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}
