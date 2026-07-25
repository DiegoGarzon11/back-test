import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

type ValidatorDecoratorFactory = () => (
  target: object,
  propertyKey: string | symbol,
) => void;

const safeIsNotEmpty = IsNotEmpty as unknown as ValidatorDecoratorFactory;
const safeIsString = IsString as unknown as ValidatorDecoratorFactory;
const safeIsInt = IsInt as unknown as ValidatorDecoratorFactory;
const safeIsPositive = IsPositive as unknown as ValidatorDecoratorFactory;

export class CreateTransactionDto {
  @safeIsNotEmpty()
  @safeIsString()
  productId!: string;

  @safeIsNotEmpty()
  @safeIsString()
  customerId!: string;

  @safeIsNotEmpty()
  @safeIsString()
  deliveryId!: string;

  @safeIsInt()
  @safeIsPositive()
  productAmount!: number;

  @safeIsInt()
  @safeIsPositive()
  baseFee!: number;

  @safeIsInt()
  @safeIsPositive()
  deliveryFee!: number;
}
