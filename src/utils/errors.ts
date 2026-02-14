export class LinearConciergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LinearConciergeError';
  }
}

export class ConfigurationError extends LinearConciergeError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class LinearAPIError extends LinearConciergeError {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'LinearAPIError';
  }
}

export class FileWriteError extends LinearConciergeError {
  constructor(message: string, public filePath: string) {
    super(message);
    this.name = 'FileWriteError';
  }
}
