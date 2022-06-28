import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch(TokenExpiredError, JsonWebTokenError)
export class TokenExceptionFilter implements ExceptionFilter {
  catch(exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 401;
    response.status(status).json({
      message: [{ type: 'common_error', text: 'Unauthorized' }],
    });
  }
}
