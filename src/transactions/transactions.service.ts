import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ExpenseCategory,
  IncomeSource,
  TransactionType,
} from '../generated/prisma/enums.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(secretKey: string, createTransactionDto: CreateTransactionDto) {
    const {
      accountId,
      amount,
      type,
      category,
      incomeSource,
      date,
      ...transactionData
    } = createTransactionDto;

    const user = await this.ensureUserExists(secretKey);

    await this.validateTransactionInput({
      userId: user.id,
      accountId,
      type,
      category,
      incomeSource,
    });

    const transaction = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: {
          id: accountId,
          userId: user.id,
        },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      const transaction = await tx.transaction.create({
        data: {
          ...transactionData,
          amount,
          type,
          category,
          incomeSource,
          date: new Date(date),
          accountId,
          userId: user.id,
        },
      });

      const balanceChange = type === TransactionType.INCOME ? amount : -amount;

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return transaction;
    });

    return this.toResponse(transaction);
  }

  async findAll(userId: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return transactions.map((transaction) => this.toResponse(transaction));
  }

  async findByAccount(userId: number, accountId: number) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, accountId },
      orderBy: { date: 'desc' },
    });

    return transactions.map((transaction) => this.toResponse(transaction));
  }

  async findOne(userId: number, transactionId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    return this.toResponse(transaction);
  }

  async update(
    userId: number,
    transactionId: number,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const existing = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    const newType = existing.type;
    const newAmount = updateTransactionDto.amount ?? Number(existing.amount);
    const newCategory = updateTransactionDto.category ?? existing.category;
    const newIncomeSource =
      updateTransactionDto.incomeSource ?? existing.incomeSource;

    await this.validateTransactionInput({
      userId,
      accountId: existing.accountId,
      type: newType,
      category: newCategory,
      incomeSource: newIncomeSource,
    });

    const transaction = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...updateTransactionDto,
          ...(updateTransactionDto.date && {
            date: new Date(updateTransactionDto.date),
          }),
        },
      });

      const oldBalanceEffect =
        existing.type === TransactionType.INCOME
          ? Number(existing.amount)
          : -Number(existing.amount);

      const newBalanceEffect =
        newType === TransactionType.INCOME ? newAmount : -newAmount;

      const balanceDifference = newBalanceEffect - oldBalanceEffect;

      if (balanceDifference !== 0) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: {
              increment: balanceDifference,
            },
          },
        });
      }
      return updated;
    });

    return this.toResponse(transaction);
  }

  async remove(userId: number, transactionId: number) {
    const existing = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      const balanceReversal =
        existing.type === TransactionType.INCOME
          ? -Number(existing.amount)
          : Number(existing.amount);

      await tx.account.update({
        where: { id: existing.accountId },
        data: {
          balance: {
            increment: balanceReversal,
          },
        },
      });
    });

    return { message: 'Transaction deleted successfully' };
  }

  private async validateTransactionInput({
    userId,
    accountId,
    type,
    category,
    incomeSource,
  }: {
    userId: number;
    accountId: number;
    type: TransactionType;
    category?: ExpenseCategory | null;
    incomeSource?: IncomeSource | null;
  }) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    if (type === TransactionType.EXPENSE) {
      if (!category) {
        throw new BadRequestException('Category is required for an expense');
      }

      if (incomeSource) {
        throw new BadRequestException(
          'Income source cannot be provided for an expense',
        );
      }
    }

    if (type === TransactionType.INCOME) {
      if (!incomeSource) {
        throw new BadRequestException('Income source is required for income');
      }

      if (category) {
        throw new BadRequestException('Category cannot be provided for income');
      }
    }
  }

  private async ensureUserExists(secretKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { secret_key: secretKey },
    });

    if (!user) {
      throw new NotFoundException(`User with Key ${secretKey} not found`);
    }

    return user;
  }

  private toResponse(transaction: {
    id: number;
    name: string;
    type: TransactionType;
    amount: unknown;
    category: ExpenseCategory | null;
    incomeSource: IncomeSource | null;
    description: string | null;
    payment_method: string;
    date: Date;
    accountId: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: transaction.id,
      name: transaction.name,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      incomeSource: transaction.incomeSource,
      description: transaction.description,
      payment_method: transaction.payment_method,
      date: transaction.date,
      accountId: transaction.accountId,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
