import { Logger } from '@nestjs/common';

export class ErrorHandler {
  private readonly logger = new Logger(ErrorHandler.name);
  handleError(name: string, err) {
    this.logger.log({
      name,
      err,
    });
  }
}
