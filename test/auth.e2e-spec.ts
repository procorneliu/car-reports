import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles singup request', async () => {
    const email = 'newemailtouse@gmail.com';

    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123456' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });

  it('signup a new user and get back currently logged in user', async () => {
    const email = 'test@gmail.com';

    const res = await request(app.getHttpServer()).post('/auth/signup').send({ email, password: '123456' });
    expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer()).get('/auth/whoami').set('Cookie', cookie!).expect(200);

    expect(body.email).toEqual(email);
  });
});
