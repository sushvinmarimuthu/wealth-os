import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto.js';
import {
  ExpenseCategory,
  IncomeSource,
  RecurringFrequency,
  TransactionType,
} from '../generated/prisma/enums.js';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto.js';

@Injectable()
export class RecurringTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateRecurringTransactionDto) {
    await this.ensureUserExists(userId);

    await this.ensureAccountBelongsToUser(userId, dto.accountId);

    this.validateTypeSpecificFields({
      type: dto.type,
      category: dto.category,
      incomeSource: dto.incomeSource,
    });

    const startDate = new Date(dto.start_date);

    const endDate = dto.end_date ? new Date(dto.end_date) : null;

    this.validateDates(startDate, endDate);

    const recurring = await this.prisma.recurringTransaction.create({
      data: {
        name: dto.name,
        type: dto.type,
        amount: dto.amount,
        category: dto.category,
        incomeSource: dto.incomeSource,
        description: dto.description,
        frequency: dto.frequency,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        accountId: dto.accountId,
        userId,
      },
    });

    return this.toResponse(recurring);
  }

  async findAll(userId: number) {
    await this.ensureUserExists(userId);

    const recurring = await this.prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { start_date: 'desc' },
    });

    return recurring.map((item) => this.toResponse(item));
  }

  async findActive(userId: number) {
    const recurring = await this.prisma.recurringTransaction.findMany({
      where: { userId, is_active: true },
      orderBy: { start_date: 'asc' },
    });

    return recurring.map((item) => this.toResponse(item));
  }

  async findOne(userId: number, recurringId: number) {
    const recurring = await this.prisma.recurringTransaction.findFirst({
      where: { id: recurringId, userId },
    });

    if (!recurring) {
      throw new NotFoundException(
        `Recurring transaction with ID ${recurringId} not found`,
      );
    }

    return this.toResponse(recurring);
  }

  async update(
    userId: number,
    recurringId: number,
    dto: UpdateRecurringTransactionDto,
  ) {
    const existing = await this.prisma.recurringTransaction.findFirst({
      where: { id: recurringId, userId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Recurring transaction with ID ${recurringId} not found`,
      );
    }

    const category = dto.category ?? existing.category;
    const incomeSource = dto.incomeSource ?? existing.incomeSource;

    this.validateTypeSpecificFields({
      type: existing.type,
      category,
      incomeSource,
    });

    const startDate = dto.start_date
      ? new Date(dto.start_date)
      : existing.start_date;

    const endDate =
      dto.end_date !== undefined ? new Date(dto.end_date) : existing.end_date;

    this.validateDates(startDate, endDate);

    const updated = await this.prisma.recurringTransaction.update({
      where: { id: recurringId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.incomeSource !== undefined && {
          incomeSource: dto.incomeSource,
        }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.start_date !== undefined && { start_date: startDate }),
        ...(dto.end_date !== undefined && { end_date: endDate }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return this.toResponse(updated);
  }

  async activate(userId: number, recurringId: number) {
    const recurring = await this.findOwnedRecurring(userId, recurringId);

    if (recurring.is_active) {
      throw new ConflictException('Recurring transaction is already active');
    }

    const updated = await this.prisma.recurringTransaction.update({
      where: { id: recurringId },
      data: { is_active: true },
    });

    return this.toResponse(updated);
  }

  async deactivate(userId: number, recurringId: number) {
    const recurring = await this.findOwnedRecurring(userId, recurringId);

    if (!recurring.is_active) {
      throw new ConflictException('Recurring transaction is already inactive');
    }

    const updated = await this.prisma.recurringTransaction.update({
      where: { id: recurringId },
      data: { is_active: false },
    });

    return this.toResponse(updated);
  }

  async remove(userId: number, recurringId: number) {
    await this.findOwnedRecurring(userId, recurringId);

    await this.prisma.recurringTransaction.delete({
      where: { id: recurringId },
    });

    return {
      message: 'Recurring transaction deleted successfully',
    };
  }

  private async findOwnedRecurring(userId: number, recurringId: number) {
    const recurring = await this.prisma.recurringTransaction.findFirst({
      where: {
        id: recurringId,
        userId,
      },
    });

    if (!recurring) {
      throw new NotFoundException(
        `Recurring transaction with ID ${recurringId} not found`,
      );
    }

    return recurring;
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async ensureAccountBelongsToUser(userId: number, accountId: number) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    if (!account.is_active) {
      throw new BadRequestException(
        'Cannot create a recurring transaction for an inactive account',
      );
    }
  }

  private validateTypeSpecificFields({
    type,
    category,
    incomeSource,
  }: {
    type: TransactionType;
    category?: ExpenseCategory | null;
    incomeSource?: IncomeSource | null;
  }) {
    if (type === TransactionType.EXPENSE && !category) {
      throw new BadRequestException('Category is required for an expense');
    }

    if (type === TransactionType.EXPENSE && incomeSource) {
      throw new BadRequestException(
        'Income source cannot be provided for an expense',
      );
    }

    if (type === TransactionType.INCOME && !incomeSource) {
      throw new BadRequestException('Income source is required for income');
    }

    if (type === TransactionType.INCOME && category) {
      throw new BadRequestException('Category cannot be provided for income');
    }
  }

  private validateDates(startDate: Date, endDate: Date | null) {
    if (endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  private toResponse(recurring: {
    id: number;
    name: string;
    type: TransactionType;
    amount: unknown;
    category: ExpenseCategory | null;
    incomeSource: IncomeSource | null;
    description: string | null;
    frequency: RecurringFrequency;
    start_date: Date;
    end_date: Date | null;
    is_active: boolean;
    accountId: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: recurring.id,
      name: recurring.name,
      type: recurring.type,
      amount: recurring.amount,
      category: recurring.category,
      incomeSource: recurring.incomeSource,
      description: recurring.description,
      frequency: recurring.frequency,
      start_date: recurring.start_date,
      end_date: recurring.end_date,
      is_active: recurring.is_active,
      accountId: recurring.accountId,
      userId: recurring.userId,
      createdAt: recurring.createdAt,
      updatedAt: recurring.updatedAt,
    };
  }
}
