import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import {
  GoogleRecaptchaException,
  GoogleRecaptchaNetworkException,
} from '@nestlab/google-recaptcha';
import { Response } from 'express';

@Catch(GoogleRecaptchaException, GoogleRecaptchaNetworkException)
export class GoogleRecaptchaFilter implements ExceptionFilter {
  catch(exception: GoogleRecaptchaException, host: ArgumentsHost): any {
    const response: Response = host.switchToHttp().getResponse();

    response.status(400).send({
      message: [
        {
          type: 'common_error',
          text: exception.message,
        },
      ],
    });
  }
}
