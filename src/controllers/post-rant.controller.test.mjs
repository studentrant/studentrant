import * as constants from '../constants/index.constant.js';
import { v4 as uuidv4 } from 'uuid';
import PostRant from './post-rant.controller.js';
import req from '../../__test__/fakes/req.fake.js';
import res from '../../__test__/fakes/res.fake.js';
import next from '../../__test__/fakes/next.fake.js';
import { RantDbUtils, Collection, UserDbUtils } from '../../__test__/fakes/db.fakes.js';
import Utils from '../utils/utils.util.js';

describe('PostRant [Unit]', () => {
  const controller = new PostRant(
    RantDbUtils,
    UserDbUtils,
    Utils,
    Collection,
    Collection
  );

  beforeEach(() => {
    req.session = { user: { username: 'testuseraccount' } };
  });

  describe('::createRant', () => {
    let createRantSpy;
    let date;

    beforeAll(() => {
      date = Date.now();
    });

    beforeEach(() => {
      createRantSpy = spyOn(controller.postRantService, 'createRant');
      req.body = {
        rant: 'Twinkle Twinkle, little Star, How I wonder what you are, up above the sky so high, like a diamon in the sky, twinkle twinkle little star',
        tags: ['twinkle', 'star'],
        rantId: uuidv4(),
        when: date,
      };
    });

    afterEach(() => {
      createRantSpy.calls.reset();
      req.body = {};
    });

    it('should create rant and return all tags', async () => {
      createRantSpy.and.resolveTo({ ...req.body, rantPoster: req.session.user.username });
      const result = JSON.parse(await controller.createRant(req, res, next));
      expect(result.status).toEqual(201);
      expect(result.message).toEqual({ ...req.body, rantPoster: req.session.user.username });
      expect(controller.postRantService.createRant).toHaveBeenCalled();
      expect(controller.postRantService.createRant).toHaveBeenCalledWith({
        rantPoster: req.session.user.username,
        rant: req.body.rant,
        tags: req.body.tags,
        when: req.body.when,
      });
    });
    it('should create a rant with empty tags and return general as member of the tag', async () => {
      req.body.tags = [];
      createRantSpy.and.resolveTo({ ...req.body, tags: ['general'], rantPoster: req.session.user.username });
      const result = JSON.parse(await controller.createRant(req, res, next));
      expect(result.status).toEqual(201);
      expect(result.message).toEqual({ ...req.body, tags: ['general'], rantPoster: req.session.user.username  });
    });

    it("call next on error", async () => {
      createRantSpy.and.throwError('x');
      await controller.createRant(req,res,next);
    });

  });

  describe("::deleteRant", () => {
    let deleteRantSpy;
    let validateRantExistenceSpy;
    let validateRantCreatorSpy;
    beforeEach(() => {
      deleteRantSpy = spyOn(controller.postRantService, "deleteRant");
      validateRantExistenceSpy = spyOn(controller.postRantService, "validateRantExistence");
      validateRantCreatorSpy = spyOn(controller.postRantService, "validateRantCreator");
      req.params = { rantId: "xxx" };
    });

    afterEach(() => {
      deleteRantSpy.calls.reset();
      validateRantExistenceSpy.calls.reset();
      validateRantCreatorSpy.calls.reset();
      req.params = {};
    });

    it("should return rant does not exists if rant is not in db", async () => {
      validateRantExistenceSpy.and.resolveTo(undefined);
      const result = await controller.deleteRant(req,res,next);
      expect(controller.postRantService.deleteRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(constants.rantConstants.RANT_DOES_NOT_EXISTS);
    });

    it("should return rant has already been deleted", async () => {
      validateRantExistenceSpy.and.resolveTo({ deleted: true });
      const result = await controller.deleteRant(req,res,next);
      expect(controller.postRantService.deleteRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(410);
      expect(result.message).toEqual(constants.rantConstants.RANT_HAS_ALREADY_BEEN_DELETED);
    });

    it("should return unauthroized access when trying to delete rant that does not belong to you", async () => {
      validateRantExistenceSpy.and.resolveTo({});
      validateRantCreatorSpy.and.resolveTo(undefined);
      const result = await controller.deleteRant(req,res,next);
      expect(controller.postRantService.deleteRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantCreator).toHaveBeenCalledWith(req.session.user.username, req.params.rantId);
      expect(result.status).toEqual(401);
      expect(result.message).toEqual(constants.rantConstants.RANT_NOT_USER);
    });

    it("should delete rant and return rant has been sucefully deleted", async () => {
      validateRantExistenceSpy.and.resolveTo({});
      validateRantCreatorSpy.and.resolveTo({});
      const result = JSON.parse(await controller.deleteRant(req,res,next));
      expect(controller.postRantService.deleteRant).toHaveBeenCalled();
      expect(controller.postRantService.deleteRant).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantCreator).toHaveBeenCalledWith(req.session.user.username, req.params.rantId);
      expect(result.status).toEqual(200);
      expect(result.message).toEqual(constants.rantConstants.RANT_SUCCESSFULLY_DELETED);
    });

    it("call next on error", async () => {
      validateRantExistenceSpy.and.throwError('x');
      await controller.deleteRant(req,res,next);
    });

  });

  describe("::editRant", () => {
    let getRantSpy;
    let editRantSpy;
    let validateRantExistenceSpy;
    let validateRantCreatorSpy;
    let when = Date.now();
    beforeEach(() => {
      getRantSpy  = spyOn(controller.postRantService, "getRant");
      editRantSpy = spyOn(controller.postRantService, "editRant");
      validateRantExistenceSpy = spyOn(controller.postRantService, "validateRantExistence");
      validateRantCreatorSpy = spyOn(controller.postRantService, "validateRantCreator");
      req.params = { rantId: "xxx" };
      req.body   = { tags: [], rant: "hello earthlings" , when };
    });
    afterEach(() => {
      getRantSpy.calls.reset();
      editRantSpy.calls.reset();
      validateRantExistenceSpy.calls.reset();
      validateRantCreatorSpy.calls.reset();
      req.params = {};
      req.body = {};
    });
    it("should return rant does not exists if rant is not in db", async () => {
      validateRantExistenceSpy.and.resolveTo(undefined);
      const result = await controller.editRant(req,res,next);
      expect(controller.postRantService.getRant).not.toHaveBeenCalled();
      expect(controller.postRantService.editRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(constants.rantConstants.RANT_DOES_NOT_EXISTS);
    });

    it("should return rant has already been editd", async () => {
      validateRantExistenceSpy.and.resolveTo({ deleted: true });
      const result = await controller.editRant(req,res,next);
      expect(controller.postRantService.getRant).not.toHaveBeenCalled();
      expect(controller.postRantService.editRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(410);
      expect(result.message).toEqual(constants.rantConstants.RANT_HAS_ALREADY_BEEN_DELETED);
    });

    it("should return unauthroized access when trying to edit rant that does not belong to you", async () => {
      validateRantExistenceSpy.and.resolveTo({});
      validateRantCreatorSpy.and.resolveTo(undefined);
      const result = await controller.editRant(req,res,next);
      expect(controller.postRantService.getRant).not.toHaveBeenCalled();
      expect(controller.postRantService.editRant).not.toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantCreator).toHaveBeenCalledWith(req.session.user.username, req.params.rantId);
      expect(result.status).toEqual(401);
      expect(result.message).toEqual(constants.rantConstants.RANT_NOT_USER);
    });

    it("should return the diff of rants", async () => {
      const diff = [
        { count: 5, value: 'hello' },
        { count: 1, added: undefined, removed: true, value: 'w' },
        { count: 1, value: ' ' },
        { count: 2, added: undefined, removed: true, value: 'wo' },
        { count: 2, added: true, removed: undefined, value: 'ea' },
        { count: 1, value: 'r' },
        { count: 2, added: true, removed: undefined, value: 'th' },
        { count: 1, value: 'l' },
        { count: 1, added: undefined, removed: true, value: 'd' },
        { count: 4, added: true, removed: undefined, value: 'ings' }
      ];

      validateRantExistenceSpy.and.resolveTo({});
      validateRantCreatorSpy.and.resolveTo({});
      getRantSpy.and.resolveTo({ rant: "hellow world" });
      editRantSpy.and.resolveTo({
        edit: {
          isEdited: true,
          editHistory: [
            {
              when,
              diffAgainstString : "hellow world",
              diff
            }
          ]
        }
      });
      const result = JSON.parse(await controller.editRant(req,res,next));
      expect(controller.postRantService.getRant).toHaveBeenCalled();
      expect(controller.postRantService.getRant).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.editRant).toHaveBeenCalled();
      expect(controller.postRantService.editRant).toHaveBeenCalledWith(
        req.session.user.username,
        req.params.rantId,
        {
          editedRant: req.body.rant,
          currentRantInDb:"hellow world",
          tags: req.body.tags,
          when,
          diff
        }
      );
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantCreator).toHaveBeenCalledWith(req.session.user.username, req.params.rantId);
      expect(result.status).toEqual(200);
      expect(result.message.edit).toBeDefined();
      expect(result.message.edit.isEdited).toBeTruthy();
      expect(result.message.edit.editHistory).toEqual(jasmine.any(Array));
      expect(result.message.edit.editHistory.length).toBeGreaterThan(0);
      expect(result.message.edit.editHistory[0].when).toEqual(when);
      expect(result.message.edit.editHistory[0].diffAgainstString).toEqual("hellow world");
      expect(result.message.edit.editHistory[0].diff).toEqual(jasmine.any(Array));
      expect(result.message.edit.editHistory[0].diff.length).toBeGreaterThan(0);
    });

    it("call next on error", async () => {
      validateRantExistenceSpy.and.throwError('x');
      await controller.editRant(req,res,next);
    });

  });

  describe("::upvoteRant", () => {

    let upvoteRantSpy;
    let validateRantForModification;
    let rantUpvoterUserId;

    beforeAll(() => {
      req.params = { rantId: 'xxxx'};
      req.body = { rantUpvoter: "test" };
    });

    beforeEach(() => {
      upvoteRantSpy = spyOn(controller.postRantService, 'upvote');
      rantUpvoterUserId = spyOn(controller.postRantService, 'validateRantUpvoter');
      validateRantForModification = spyOn(controller.postRantService, 'validateRantExistence');
    });

    afterEach(() => {
      upvoteRantSpy.calls.reset();
      validateRantForModification.calls.reset();
      rantUpvoterUserId.calls.reset();
    });

    it("should return 404 if rant id does not exists", async () => {
      validateRantForModification.and.resolveTo(undefined);
      const result = await controller.upvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_DOES_NOT_EXISTS
      );
    });

    it("should return rant has been deleted if trying to upvote a deleted rant", async () => {
      validateRantForModification.and.resolveTo({ deleted: true });
      const result = await controller.upvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(410);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_HAS_ALREADY_BEEN_DELETED
      );

    });


    it("should not upvote rant if rant upvoter is not exists", async () => {
      validateRantForModification.and.resolveTo({});
      rantUpvoterUserId.and.resolveTo(undefined);
      const result = await controller.upvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantUpvoter);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_USER_UPVOTER_NOT_EXISTS
      );
    });

    it("should not upvote rant if rant upvoter is deactivated", async () => {
      validateRantForModification.and.resolveTo({});
      rantUpvoterUserId.and.resolveTo({ deactivated: true });
      const result = await controller.upvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantUpvoter);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_USER_UPVOTER_DEACTIVATED
      );
    });

    it("should upvote rant and count rant upvotes", async () => {
      validateRantForModification.and.resolveTo({});
      rantUpvoterUserId.and.resolveTo({ _id: 'xxx' });
      upvoteRantSpy.and.resolveTo({ rantDownvote: [], rantUpvote: [ 'x', 'x', 'x'] });
      const result = JSON.parse(await controller.upvoteRant(req,res,next));
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantUpvoter);
      expect(result.status).toEqual(200);
      expect(result.message.rantUpvoteCount).toEqual(3);
      expect(result.message.rantDownvoteCount).toEqual(0);
    });

  });


  describe("::downVoteRant", () => {

    let upvoteRantSpy;
    let validateRantForModification;
    let rantDownvoteUserId;

    beforeAll(() => {
      req.params = { rantId: 'xxxx'};
      req.body = { rantDownvoter: "test" };
    });

    beforeEach(() => {
      upvoteRantSpy = spyOn(controller.postRantService, 'downvote');
      rantDownvoteUserId = spyOn(controller.postRantService, 'validateRantUpvoter');
      validateRantForModification = spyOn(controller.postRantService, 'validateRantExistence');
    });

    afterEach(() => {
      upvoteRantSpy.calls.reset();
      validateRantForModification.calls.reset();
      rantDownvoteUserId.calls.reset();
    });

    it("should return 404 if rant id does not exists", async () => {
      validateRantForModification.and.resolveTo(undefined);
      const result = await controller.downvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_DOES_NOT_EXISTS
      );
    });

    it("should return rant has been deleted if trying to upvote a deleted rant", async () => {
      validateRantForModification.and.resolveTo({ deleted: true });
      const result = await controller.downvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(410);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_HAS_ALREADY_BEEN_DELETED
      );

    });

    
    it("should not upvote rant if rant downvoter is not exists", async () => {
      validateRantForModification.and.resolveTo({});
      rantDownvoteUserId.and.resolveTo(undefined);
      const result = await controller.downvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantDownvoter);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_USER_UPVOTER_NOT_EXISTS
      );
    });
    
    it("should not upvote rant if rant upvoter is deactivated", async () => {
      validateRantForModification.and.resolveTo({});
      rantDownvoteUserId.and.resolveTo({ deactivated: true });
      const result = await controller.downvoteRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantDownvoter);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_USER_UPVOTER_DEACTIVATED
      );
    });

    it("should upvote rant and count rant upvotes", async () => {
      validateRantForModification.and.resolveTo({});
      rantDownvoteUserId.and.resolveTo({ _id: 'xxx' });
      upvoteRantSpy.and.resolveTo({ rantDownvote: [ 'x', 'x' ], rantUpvote: [ 'x' ] });
      const result = JSON.parse(await controller.downvoteRant(req,res,next));
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalled();
      expect(controller.postRantService.validateRantUpvoter).toHaveBeenCalledWith(req.body.rantDownvoter);
      expect(result.status).toEqual(200);
      expect(result.message.rantUpvoteCount).toEqual(1);
      expect(result.message.rantDownvoteCount).toEqual(2);
    });

  });


  describe("::getRant", () => {
    let validateRantExistenseSpy ;
    let getRantSpy;

    beforeEach(() => {
      validateRantExistenseSpy = spyOn(controller.postRantService, 'validateRantExistence');
      getRantSpy = spyOn(controller.postRantService, 'getRant');
    });

    afterEach(() => {
      validateRantExistenseSpy.calls.reset();
      getRantSpy.calls.reset();
    });

    beforeAll(() => {
      req.params = { rantId: 'xxxx' };
    });

    it('should not get rant if rant does not exists', async () => {
      validateRantExistenseSpy.and.resolveTo(undefined);
      const result = await controller.getRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_DOES_NOT_EXISTS
      );
    });

    it("should return rant has been deleted when trying to read a rant immidatley deleted", async () => {
      validateRantExistenseSpy.and.resolveTo({ deleted: true });
      const result = await controller.getRant(req,res,next);
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(410);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_HAS_ALREADY_BEEN_DELETED
      );
    });


    it("should return rant has been deleted if trying to upvote a deleted rant", async () => {
      validateRantExistenseSpy.and.resolveTo({});
      getRantSpy.and.resolveTo({ rantDownvote: [ 'x', 'x' ], rantUpvote: [ 'x' ] });
      const result = JSON.parse(await controller.getRant(req,res,next));
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalled();
      expect(controller.postRantService.validateRantExistence).toHaveBeenCalledWith(req.params.rantId);
      expect(controller.postRantService.getRant).toHaveBeenCalled();
      expect(controller.postRantService.getRant).toHaveBeenCalledWith(req.params.rantId);
      expect(result.status).toEqual(200);
      expect(result.message.rantDownvoteCount).toEqual(2);
      expect(result.message.rantUpvoteCount).toEqual(1);
    });

  });

  describe("::getRants", () => {
    
    let getRantsSpy;
    
    beforeEach(() => {
      getRantsSpy = spyOn(controller.postRantService, 'getRants');
    });
    
    afterEach(() => {
      getRantsSpy.calls.reset();
    });

    beforeAll(() => {
      req.query = { numRequest: 0 };
    });
    
    it('should return no more rant to read if rant length is 0 ', async () => {
      getRantsSpy.and.resolveTo({ rants: [] });
      const result = await controller.getRants(req,res,next);
      expect(controller.postRantService.getRants).toHaveBeenCalled();
      expect(controller.postRantService.getRants).toHaveBeenCalledWith(req.query.numRequest);
      expect(result.status).toEqual(404);
      expect(result.message).toEqual(
        constants.rantConstants.RANT_READ_EXHAUSTED,
      );
    });

    it('should return no more rant to read if rant length is 0 ', async () => {
      getRantsSpy.and.resolveTo({ rants: [ 'a' , 'b', 'c' ] });
      const result = JSON.parse(await controller.getRants(req,res,next));
      expect(controller.postRantService.getRants).toHaveBeenCalled();
      expect(controller.postRantService.getRants).toHaveBeenCalledWith(req.query.numRequest);
      expect(result.status).toEqual(200);
      expect(result.message.rant).toEqual({ rants: [ 'a', 'b', 'c' ]});
    });
  });

});
