import RantRepliesDbUtils from './rant-reply.db.util.js';
import { Collection, ReplyRantDbUtils } from '../../../__test__/fakes/db.fakes.js';

describe("RantReplyDbUtils [Unit]", () => {
  const rantReplyDbUtil = new RantRepliesDbUtils(Collection);

  describe("::saveReply", () => {

    let collectionSaveSpy;
    let collectionFindOneSpy;
    let instanceOfCollection;

    beforeEach(() => {
      instanceOfCollection = new rantReplyDbUtil.RantCommentCollection();
      collectionSaveSpy = spyOn(instanceOfCollection, 'save').and.callThrough();
      collectionFindOneSpy = spyOn(
        Collection,
        'findOne',
      ).and.callThrough();
    });

    afterEach(() => {
      collectionSaveSpy.calls.reset();
      collectionFindOneSpy.calls.reset();
    });

    it('should save reply', async () => {

      collectionSaveSpy.and.resolveTo({
        rantCommentId: 'xxx'
      });

      await rantReplyDbUtil.saveReply(
        { foo: 'bar', rantCommentId: 'xxx' }
      );

      expect(Collection.findOne).toHaveBeenCalled();
      expect(Collection.findOne).toHaveBeenCalledWith(
        { rantCommentId: 'xxx' },
        { _id: false, __v: false }
      );

    });
  });

  describe("::findAllReplies", () => {
    let collectionAggregateSpy;
    beforeEach(() => {
      collectionAggregateSpy = spyOn(Collection, "aggregate").and.callThrough();
    });

    afterEach(() => {
      collectionAggregateSpy.calls.reset();
    });

    it('should call aggregate', async () => {
      collectionAggregateSpy.and.resolveTo({})
      await rantReplyDbUtil.findAllReplies(
        {
          matchComments: {},
          skipUnwanted: {},
          limitComment: {},
          getNReplyCountAndFirstNReply: {},
          removeUnwanted: {}
        }
      )
      expect(Collection.aggregate).toHaveBeenCalled();
      expect(Collection.aggregate).toHaveBeenCalledWith([
        {},
        {},
        {},
        {},
        {}
      ])
    })
  });

  describe("::getRepliesCount", () => {
    let collectionCountDocumentsSpy;
    beforeEach(() => {
      collectionCountDocumentsSpy = spyOn(Collection, "countDocuments").and.callThrough();
    });
    afterEach(() => {
      collectionCountDocumentsSpy.calls.reset();
    });
    it('should call countDocuments', async () => {
      collectionCountDocumentsSpy.and.resolveTo(20);
      const result = await rantReplyDbUtil.getRepliesCount({ foo: 'bar' });
      expect(result).toEqual(20);
      expect(Collection.countDocuments).toHaveBeenCalled();
      expect(Collection.countDocuments).toHaveBeenCalledWith({ foo: 'bar' });
    })
  })

  describe("::getReply", () => {
    let collectionFindOneSpy;
    beforeEach(() => {
      collectionFindOneSpy = spyOn(Collection, "findOne").and.callThrough();
    });
    afterEach(() => {
      collectionFindOneSpy.calls.reset();
    });

    it('should call findOne', async () => {
      collectionFindOneSpy.and.resolveTo({});
      await rantReplyDbUtil.getReply({ query: { foo: 'bar' } });
      expect(Collection.findOne).toHaveBeenCalled();
      expect(Collection.findOne).toHaveBeenCalledWith({ foo: 'bar' })
    });
  })

  describe("::findIfUserIsCommenter", () => {
    let collectionFindOneSpy;
    beforeEach(() => {
      collectionFindOneSpy = spyOn(Collection, "findOne").and.callThrough();
    });
    afterEach(() => {
      collectionFindOneSpy.calls.reset();
    });

    it('should call findOne', async () => {
      collectionFindOneSpy.and.resolveTo({});
      await rantReplyDbUtil.findIfUserIsCommenter("test", "xxxx");
      expect(Collection.findOne).toHaveBeenCalled();
      expect(Collection.findOne).toHaveBeenCalledWith({ rantCommenter: "test", rantCommentId: "xxxx" });
    });
  });

  describe("::deleteUserReply", () => {

    let collectionUpdateOneSpy;

    beforeEach(() => {
      collectionUpdateOneSpy = spyOn(Collection, "updateOne").and.callThrough();
    });

    afterEach(() => {
      collectionUpdateOneSpy.calls.reset();
    });

    it("should call updateOne", async () => {
      collectionUpdateOneSpy.and.resolveTo({})
      await rantReplyDbUtil.deleteUserReply("xxxx");
      expect(Collection.updateOne).toHaveBeenCalled();
      expect(Collection.updateOne).toHaveBeenCalledWith(
        { rantCommentId: "xxxx" },
        { $set: { deleted: true } }
      );
    });

  });

  describe("::editUserReply", () => {
    let collectionFindOneAndUpdateSpy;
    beforeEach(() => {
      collectionFindOneAndUpdateSpy = spyOn(Collection, "findOneAndUpdate");
    });
    afterEach(() => {
      collectionFindOneAndUpdateSpy.calls.reset();
    });
    it("should call findOneAndUpdate", async () => {
      collectionFindOneAndUpdateSpy.and.resolveTo({});
      await rantReplyDbUtil.editUserReply({ replyRantId: "xxxx", replyRant: "xxx".repeat(20) });
      expect(Collection.findOneAndUpdate).toHaveBeenCalled();
      expect(Collection.findOneAndUpdate).toHaveBeenCalledWith(
        { rantCommentId: "xxxx" },
        {
          $set: {
            rantComment: "xxx".repeat(20),
            edited: true,
          },
        },
        { new: true, fields: { _id: false } }
      )
    });
  });
});
