import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { UserRole } from 'src/helpers/user-role';
import { UserId } from 'src/helpers/user-id';
import { ErrorHandler } from 'src/helpers/error';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRole, UserId, ErrorHandler],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'users/all',
      method: RequestMethod.GET,
    });
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'users/update',
      method: RequestMethod.PATCH,
    });
  }
}
