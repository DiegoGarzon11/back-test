import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

type ValidatorDecoratorFactory = () => (
  target: object,
  propertyKey: string | symbol,
) => void;
type ValidatorDecoratorFactoryWithPattern = (
  pattern: RegExp,
  options?: { message?: string },
) => (target: object, propertyKey: string | symbol) => void;

const safeIsEmail = IsEmail as unknown as ValidatorDecoratorFactory;
const safeIsNotEmpty = IsNotEmpty as unknown as ValidatorDecoratorFactory;
const safeIsString = IsString as unknown as ValidatorDecoratorFactory;
const safeMatches = Matches as unknown as ValidatorDecoratorFactoryWithPattern;

export class CreateCustomerDto {
  @safeIsEmail()
  email!: string;

  @safeIsNotEmpty()
  @safeIsString()
  fullName!: string;

  @safeIsNotEmpty()
  @safeMatches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;
}
