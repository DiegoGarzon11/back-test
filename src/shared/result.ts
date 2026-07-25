export class Result<T, E = string> {
  private constructor(
    public readonly success: boolean,
    public readonly value?: T,
    public readonly error?: E,
  ) {}

  static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static fail<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }
}
