import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { BudgetsModule } from './budgets/budgets.module.js';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module.js';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module.js';
import { HealthModule } from './health/health.module.js';
import { AppController } from './app.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    BudgetsModule,
    SavingsGoalsModule,
    RecurringTransactionsModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
