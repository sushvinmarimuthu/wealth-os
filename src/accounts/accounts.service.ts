import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(secretKey: string, createAccountDto: CreateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { secret_key: secretKey },
    });

    if (!user) {
      throw new NotFoundException(`User with Key ${secretKey} not found`);
    }

    const account = await this.prisma.account.create({
      data: {
        name: createAccountDto.name,
        balance: createAccountDto.balance ?? 0,
        is_active: createAccountDto.is_active ?? true,
        userId: user.id,
      },
    });

    return this.toResponse(account);
  }

  async findAll(secretKey: string) {
    const user = await this.ensureUserExists(secretKey);

    const accounts = await this.prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => this.toResponse(account));
  }

  async findOne(secretKey: string, accountId: number) {
    const user = await this.ensureUserExists(secretKey);
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    return this.toResponse(account);
  }

  async update(
    secretKey: string,
    accountId: number,
    updateAccountDto: UpdateAccountDto,
  ) {
    const user = await this.ensureUserExists(secretKey);
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: accountId },
      data: updateAccountDto,
    });

    return this.toResponse(updatedAccount);
  }

  async remove(secretKey: string, accountId: number) {
    const user = await this.ensureUserExists(secretKey);
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    await this.prisma.account.delete({
      where: { id: accountId },
    });

    return {
      message: 'Account deleted successfully',
    };
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

  private toResponse(account: {
    id: number;
    name: string;
    balance: unknown;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: account.id,
      name: account.name,
      balance: account.balance,
      is_active: account.is_active,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
