import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: ForbiddenException | UnauthorizedException | BadRequestException | NotFoundException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      message: exception.getResponse()['message'] ?? [
        { type: 'unknown', text: 'Unknown error. Please try it again.' },
      ],
    });
  }
}
