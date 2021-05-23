import supertest from 'supertest';
import app from '../src/server.js';
import { authConstants, rantConstants } from '../src/constants/index.constant.js';

import * as testUtils from './util.test.js';

const agent = supertest(app);
let cookie;


describe('Trends [Integration]', () => {

  describe('Unauthenticated User', () => {
    it('should return 401 unauthroized access if user is not logged in', (done) => {
      agent
        .get('/rant/post/rant/111')
        .expect(401).end((err, res) => {
          expect(err).toBeNull();
          expect(res.body.status).toEqual(401);
          expect(res.body.message).toEqual(authConstants.USER_NOT_LOGGED_IN);
          done();
        });
    });
  });

  describe('Authenticated User', () => {
    beforeAll((done) => {
      agent
        .post('/login')
        .send({ username: 'testaccount', password: '12345689234TesT$$' })
        .expect(200).end((err, res) => {
          cookie = res.headers['set-cookie'];
          expect(err).toBeNull();
          done();
        });
    });

    describe("Get Trend", () => {
      let rantId;
      it('should fail if trend param does not start with a #', done => {
        agent
          .get('/trend/hello_world?numRequest=1')
          .set('cookie', cookie)
          .expect(412).end((err,res) => {
            expect(err).toBeNull();
            expect(res.body.status).toEqual(412);
            expect(res.body.message).toEqual(rantConstants.RANT_NOT_VALID_TREND);
            done();
          });
      });

      it('should fail if numRequest is not anything other than a number', done => {
        agent
          .get(`/trend/${encodeURIComponent('#studentRant')}?numRequest=abcdeg`)
          .set('cookie', cookie)
          .expect(412).end((err,res) => {
            expect(err).toBeNull();
            expect(res.body.status).toEqual(412);
            expect(res.body.message).toEqual(rantConstants.RANT_NOT_VALID_LOAD_NUM_REQUEST);
            done();
          });
      });

      it('should not save trend if no trend was found in the rant', done => {
        testUtils.createRant(
          agent,
          {
            rant: 'Hello I am new to this platfrom please be nice to me, new me',
            tags: [ "trend" ],
            cookie: cookie,
          },
          (rid) => {
            rantId = rid;
            agent
              .get(`/trend/${encodeURIComponent('#studentRant')}?numRequest=0`)
              .set('cookie', cookie)
              .expect(404).end((err,res) => {
                expect(err).toBeNull();
                expect(res.body.status).toEqual(404);
                expect(res.body.message).toEqual(rantConstants.RANT_READ_EXHAUSTED);
                done();
              });

          },
        );
      });

      it('should save trend if a hashtag was found in the rant', done => {
        testUtils.createRant(
          agent,
          {
            rant: 'Hello I am new to this platfrom #studentRant please be nice to me, new me',
            tags: [ "trend" ],
            cookie: cookie,
          },
          () => {
            agent
              .get(`/trend/${encodeURIComponent('#studentRant')}?numRequest=0`)
              .set('cookie', cookie)
              .expect(200).end((err,res) => {
                expect(err).toBeNull();
                expect(res.body.status).toEqual(200);
                expect(res.body.message.rantsTrend.length).toBeGreaterThan(0);
                expect(res.body.message.hasMore).toEqual(false);
                done();
              });
          },
        );
      })

      it('should save trend if hashtag was found in a rant comment', done => {
        testUtils.createRantReply(
          agent,
          {
            rantId,
            cookie,
            when: Date.now(),
            replyRant: `${"Hello world".repeat(15)} #newstudentranter #studentRant`
          },
          () => {
            agent
              .get(`/trend/${encodeURIComponent('#newstudentranter')}?numRequest=0`)
              .set('cookie', cookie)
              .expect(200).end((err,res) => {
                expect(err).toBeNull();
                expect(res.body.status).toEqual(200);
                expect(res.body.message).toBeDefined();
                expect(res.body.message.rantCommentsTrend).toBeDefined();
                expect(res.body.message.rantCommentsTrend.length).toBeGreaterThan(0)
                done();
              });
          })
      });

      it('should return trend from both rant and rantcomments', done => {
        agent
          .get(`/trend/${encodeURIComponent('#studentRant')}?numRequest=0`)
          .set('cookie', cookie)
          .expect(200).end((err,res) => {
            expect(err).toBeNull();
            expect(res.body.status).toEqual(200);
            expect(res.body.message.rantsTrend).toBeDefined();
            expect(res.body.message.rantsTrend.length).toBeGreaterThan(0);
            expect(res.body.message.rantCommentsTrend).toBeDefined();
            expect(res.body.message.rantCommentsTrend.length).toBeGreaterThan(0);
            done();
          });
      });
    });
  });
});
