import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserId } from 'src/helpers/user-id';
import { UserRole } from 'src/helpers/user-role';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userRole: UserRole,
    private readonly userId: UserId,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers?.authorization;
    if (!authorization) {
      throw new ForbiddenException('No access token provided');
    }

    const token = authorization.split(' ')[1];

    try {
      const user: any = await jwt.verify(token, process.env.JWT_SECRET);
      this.userRole.setRole(user.role);
      this.userId.setId(user.sub);
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
