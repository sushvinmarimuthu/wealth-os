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
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';

@Controller('accounts/:secretKey')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Param('secretKey') secretKey: string,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(secretKey, createAccountDto);
  }

  @Get()
  findAll(@Param('secretKey') secretKey: string) {
    return this.accountsService.findAll(secretKey);
  }

  @Get(':accountId')
  findOne(
    @Param('secretKey') secretKey: string,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.accountsService.findOne(secretKey, accountId);
  }

  @Patch(':accountId')
  update(
    @Param('secretKey') secretKey: string,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(secretKey, accountId, updateAccountDto);
  }

  @Delete(':accountId')
  remove(
    @Param('secretKey') secretKey: string,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.accountsService.remove(secretKey, accountId);
  }
}
