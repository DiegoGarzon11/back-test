import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class ProcessPaymentDto {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsNotEmpty()
  @IsString()
  customerId!: string;

  @IsEmail()
  customerEmail!: string;

  @IsNotEmpty()
  @IsString()
  deliveryId!: string;

  @IsInt()
  @IsPositive()
  baseFee!: number;

  @IsInt()
  @IsPositive()
  deliveryFee!: number;

  @Matches(/^[0-9]{13,19}$/, { message: 'Número de tarjeta inválido' })
  cardNumber!: string;

  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Mes de expiración inválido' })
  cardExpMonth!: string;

  @Matches(/^[0-9]{2}$/, { message: 'Año de expiración inválido' })
  cardExpYear!: string;

  @Matches(/^[0-9]{3,4}$/, { message: 'CVC inválido' })
  cardCvc!: string;

  @IsNotEmpty()
  @IsString()
  cardHolder!: string;
}
