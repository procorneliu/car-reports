import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email) => {
        const filterUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filterUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 9999), email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: UsersService, useValue: fakeUsersService }],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const password = 'test1234';

    const user = await service.signup('test@gmail.com', password);

    expect(user.password).not.toEqual(password);
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error is email is already in use when signs up', async () => {
    // fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'test@gmail.com', password: '12345' } as User]);
    await service.signup('test@gmail.com', '12345');

    await expect(service.signup('test@gmail.com', '12345')).rejects.toThrow(BadRequestException);
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.login('test@gmail.com', '12345')).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    // fakeUsersService.find = () => Promise.resolve([{ email: 'test@gmail.com', password: '12345' } as User]);
    await service.signup('test@gmail.com', '7890');

    await expect(service.login('test@gmail.com', '123456')).rejects.toThrow(BadRequestException);
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('test@gmail.com', '123456');

    const user = await service.login('test@gmail.com', '123456');
    expect(user).toBeDefined();
  });
});
