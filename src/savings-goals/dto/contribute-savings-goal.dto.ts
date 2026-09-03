import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ContributeSavingsGoalDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}
