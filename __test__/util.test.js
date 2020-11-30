/* eslint-disable no-undef */
import faker from 'faker';
import loremIpsum from 'lorem-ipsum';
import * as models from '../src/models/dbmodels/index.model.js';

export const login = (agent, cb) => {
  agent
    .post('/login')
    .send({ username: 'testaccount', password: '12345689234TesT$$' })
    .expect(200).end((err, res) => {
      expect(err).toBeNull();
      cb(res.headers['set-cookie']);
    });
};

export const createRant = (agent, { rant, cookie }, cb) => {
  agent
    .post('/rant/post/create')
    .set('cookie', cookie)
    .send({
      rant,
      tags: [],
      when: Date.now(),
    })
    .expect(201)
    .end((err, res) => {
      expect(err).toBeNull();
      cb(res.body.message.rantId);
    });
};

export const createUser = (agent, cb) => {
  const body = {
    username: faker.internet.userName(),
    password: '12345689234TesT$$',
    email: faker.internet.email('test'),
  };
  agent
    .post('/register/reg-first-step')
    .send(body).expect(201).end(async (err, res) => {
      expect(err).toBeNull();
      await models.usersCollection.updateOne(
        { email: body.email },
        { $set: { completeReg: true, verified: true } },
      );
      cb(res.headers['set-cookie'], body);
    });
};

export const deleteRant = (agent, { cookie, rantId }, cb) => {
  agent
    .delete(`/rant/post/delete/${rantId}`)
    .set('cookie', cookie)
    .expect(200).end((err) => {
      expect(err).toBeNull();
      cb(rantId);
    });
};

export const createMoreRants = (agent, { cookie, num }, cb) => {
  const lorem = new loremIpsum.LoremIpsum();
  const rantIds = [];
  for (let i = 0; i <= num; i += 1) {
    createRant(
      agent,
      {
        rant: `${lorem.generateSentences()} ${i}`,
        cookie,
      },
      (rantId) => {
        rantIds.push(rantId);
        if (i === num) cb(rantIds);
      },
    );
  }
};
