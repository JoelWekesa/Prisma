import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { UserEvent } from 'src/events/user-event';
import { ErrorHandler } from 'src/helpers/error';
import { UserId } from 'src/helpers/user-id';
import { AuthenticateDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const client = new PrismaClient();

@Injectable()
export class UsersService {
  constructor(
    private readonly userId: UserId,
    private readonly errorHandler: ErrorHandler,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await client.user
      .create({
        data: {
          ...createUserDto,
        },
      })
      .then((data) => data)
      .catch((err) => {
        this.errorHandler.handleError(UsersService.name, err);
        throw new BadRequestException(err.message);
      });
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await client.user.findMany({
      orderBy: [
        {
          username: 'desc',
        },
      ],
    });

    const user = new UserEvent();
    user.name = 'joe';
    user.age = 30;

    this.eventEmitter.emit('user.created', user);

    return users;
  }

  @OnEvent('user.created')
  handleEvent(data: UserEvent) {
    console.log('data', data);
  }

  async authenticateUser(credentials: AuthenticateDto): Promise<string> {
    const { username, password } = credentials;

    const user = client.user
      .findUnique({
        where: {
          username,
        },
      })
      .then(async (data) => {
        if (!data) {
          throw new BadRequestException('Invalid Username');
        }

        if (data.password !== password) {
          throw new BadRequestException('Invalid Password');
        }

        delete data.password;

        const { username: u, email: e, role } = data;

        const token = await jwt.sign(
          { sub: data.id, username: u, email: e, role },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          },
        );

        return token;
      })
      .catch((err) => {
        throw new BadRequestException(err.message);
      });

    return user;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    console.log('cron job running');
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const id = this.userId.getId();
    const updated = await client.user
      .update({
        where: { id },
        data: { ...updateUserDto },
      })
      .then((data) => data)
      .catch((err) => {
        throw new BadRequestException(err.message);
      });
    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
