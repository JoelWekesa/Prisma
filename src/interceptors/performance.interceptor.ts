import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  logger = new Logger(PerformanceInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler().name;
    const cls = context.getClass().name;
    const { headers } = context.switchToHttp().getRequest();

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        const duration = end - now;
        this.logger.log({
          class: cls,
          handler,
          agent: headers['user-agent'],
          duration,
        });
      }),
    );
  }
}
