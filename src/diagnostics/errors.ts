export class AreteError extends Error {
  public constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "AreteError";
  }
}

export class ValidationError extends AreteError {
  public constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class EnvironmentError extends AreteError {
  public constructor(message: string) {
    super(message, "ENVIRONMENT_ERROR");
    this.name = "EnvironmentError";
  }
}

export function formatError(error: unknown): string {
  if (error instanceof AreteError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
