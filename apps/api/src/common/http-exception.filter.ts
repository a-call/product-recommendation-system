import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : "Internal server error";
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : "message" in exceptionResponse
          ? exceptionResponse.message
          : "Request failed";

    response.status(status).json({
      status: "error",
      error: {
        code: HttpStatus[status] ?? "ERROR",
        message
      }
    });
  }
}
