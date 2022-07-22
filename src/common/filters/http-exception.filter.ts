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
  ): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let customMessage = [];

    if (!Array.isArray(exception.getResponse()['message'])) {
      switch (exception.getStatus()) {
        case 401:
          customMessage.push({
            type: 'common_error',
            text: 'Unauthorized',
          });
          break;
        case 403:
          customMessage.push({
            type: 'common_error',
            text: 'Forbidden',
          });
          break;
        case 404:
          customMessage.push({
            type: 'common_error',
            text: 'Not Found',
          });
          break;
        default:
          customMessage.push({ type: 'unknown', text: 'Unknown error. Please try it again.' });
      }
    }
    response.status(status).json({
      message: customMessage.length > 0 ? customMessage : exception.getResponse()['message'],
    });
  }
}
