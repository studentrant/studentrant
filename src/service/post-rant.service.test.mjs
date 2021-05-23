/* eslint-disable no-unused-vars */
import PostRantService from './post-rant.service.js';
import { RantDbUtils, UserDbUtils, Collection } from '../../__test__/fakes/db.fakes.js';
import { rantEnums } from '../enums/rants.enums.js';

describe('PostRantService [Unit]', () => {
  const service = new PostRantService(
    new RantDbUtils(Collection),
    new UserDbUtils(Collection)
  );

  describe('::createRant', () => {
    let saveRantSpy;
    beforeEach(() => {
      saveRantSpy = spyOn(service.rantDbUtils, 'saveRant');
    });
    afterEach(() => {
      saveRantSpy.calls.reset();
    });
    it('should save rant', async () => {
      saveRantSpy.and.resolveTo({});
      const result = await service.createRant({ foo: 'bar' });
      expect(service.rantDbUtils.saveRant).toHaveBeenCalled();
    });
  });

  describe("::validateRantCreator", () => {
    let findOneRantSpy;
    beforeEach(() => {
      findOneRantSpy = spyOn(service.rantDbUtils, 'findOneRant');
    });
    afterEach(() => {
      findOneRantSpy.calls.reset();
    });

    it('should call findOneRant', () => {
      findOneRantSpy.and.resolveTo({});
      const result = service.validateRantCreator("test", "xxx");
      expect(service.rantDbUtils.findOneRant).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneRant).toHaveBeenCalledWith(
        {
          query: { rantId: "xxx", rantPoster: "test" }
        }
      );
    });
  });

  describe("::validateRantUpvoter", () => {
    let checkUserNameSpy;
    beforeEach(() => {
      checkUserNameSpy = spyOn(service.userDbUtils, 'checkUserName');
    });
    afterEach(() => {
      checkUserNameSpy.calls.reset();
    });
    it("should call checkUsername", () => {
      checkUserNameSpy.and.resolveTo({});
      service.validateRantUpvoter("test");
      expect(service.userDbUtils.checkUserName).toHaveBeenCalled();
      expect(service.userDbUtils.checkUserName).toHaveBeenCalledWith("test");
    });
  });

  describe("::deleteRant", () => {
    let deleteOneRantSpy;
    beforeEach(() => {
      deleteOneRantSpy = spyOn(service.rantDbUtils, 'deleteOneRant');
    });
    afterEach(() => {
      deleteOneRantSpy.calls.reset();
    });
    it('should call deleteOneRant', () => {
      deleteOneRantSpy.and.resolveTo({});
      service.deleteRant("xxx");
      expect(service.rantDbUtils.deleteOneRant).toHaveBeenCalled();
      expect(service.rantDbUtils.deleteOneRant).toHaveBeenCalledWith("xxx");
    });
  });


  describe("::getRant", () => {
    let findOneRantSpy;
    beforeEach(() => {
      findOneRantSpy = spyOn(service.rantDbUtils, 'findOneRant');
    });
    afterEach(() => {
      findOneRantSpy.calls.reset();
    });
    it('should call deleteOneRant', () => {
      findOneRantSpy.and.resolveTo({});
      service.getRant("xxx");
      expect(service.rantDbUtils.findOneRant).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneRant).toHaveBeenCalledWith(
        {
          query: { rantId: "xxx" },
          project: {
            _id: false,
            'edit.editHistory.diff._id': false,
            'edit.editHistory._id': false,
            __v: false
          }
        }
      );
    });
  });


  describe("::editRant", () => {

    let editOneRantSpy;

    beforeEach(() => {
      editOneRantSpy = spyOn(service.rantDbUtils, 'editOneRant');
    });

    afterEach(() => {
    editOneRantSpy.calls.reset();
    });

    it('should call editOneRant', async () => {
      const values = {
        when: Date.now(),
        diff: {},
        currentRantInDb: "xxxx".repeat(20)
      };

      editOneRantSpy.and.resolveTo({});

      await service.editRant("test", "xxxx", values);

      expect(editOneRantSpy.calls.count()).toEqual(2);

      expect(editOneRantSpy.calls.allArgs()[0][0]).toEqual(
        {
          query: { rantPoster: "test", rantId: "xxxx" },
          operation: {
            $set: {
              rant: values.editedRant,
              'edit.isEdited': true,
            },
            $addToSet: {
              'edit.editHistory': {
                when: values.when,
              },
              tags: { $each: values.tags },
            }
          }
        }
      );

      expect(editOneRantSpy.calls.allArgs()[1][0]).toEqual(
        {
          query: { rantPoster: "test", rantId: "xxxx", 'edit.editHistory.when': values.when },
          operation:{
            $set: {
              'edit.editHistory.$.diff': values.diff,
              'edit.editHistory.$.diffAgainst': values.currentRantInDb
            }
          }
        }
      );

    });
  });

  describe("::upvote", () => {

    let upvoteSpy ;
    let findOneVoterSpy;
    let removeOneVoteSpy;

    beforeEach(() => {
      upvoteSpy = spyOn(service.rantDbUtils, 'upvote');
      findOneVoterSpy = spyOn(service.rantDbUtils, 'findOneVoter');
      removeOneVoteSpy = spyOn(service.rantDbUtils, 'removeOneVote');
    });

    afterEach(() => {
      upvoteSpy.calls.reset();
      findOneVoterSpy.calls.reset();
      removeOneVoteSpy.calls.reset();
    });

    it('should call upvote', async () => {
      findOneVoterSpy.and.resolveTo(undefined);
      upvoteSpy.and.resolveTo({});
      await service.upvote("xxxx_rantId", "xxxx_rantUpvoterId");
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalledWith(
        'rantUpvote',
        'xxxx_rantId',
        'xxxx_rantUpvoterId'
      );
      expect(service.rantDbUtils.upvote).toHaveBeenCalled();
      expect(service.rantDbUtils.upvote).toHaveBeenCalledWith(
        'xxxx_rantId',
        'xxxx_rantUpvoterId'
      );
      expect(service.rantDbUtils.removeOneVote).not.toHaveBeenCalled();
    });
    it('should not call upvote', async () => {
      findOneVoterSpy.and.resolveTo(true);
      removeOneVoteSpy.and.resolveTo({});
      await service.upvote("xxxx_rantId", "xxxx_rantUpvoterId");
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalledWith(
        'rantUpvote',
        'xxxx_rantId',
        'xxxx_rantUpvoterId'
      );
      expect(service.rantDbUtils.upvote).not.toHaveBeenCalled();
      expect(service.rantDbUtils.removeOneVote).toHaveBeenCalled();
      expect(service.rantDbUtils.removeOneVote).toHaveBeenCalledWith(
        'rantUpvote',
        'xxxx_rantId',
        'xxxx_rantUpvoterId'
      );
    });
  });

  describe('::downvote', () => {

    let downvoteSpy ;
    let findOneVoterSpy;
    let removeOneVoteSpy;

    beforeEach(() => {
      downvoteSpy = spyOn(service.rantDbUtils, 'downvote');
      findOneVoterSpy = spyOn(service.rantDbUtils, 'findOneVoter');
      removeOneVoteSpy = spyOn(service.rantDbUtils, 'removeOneVote');
    });

    afterEach(() => {
      downvoteSpy.calls.reset();
      findOneVoterSpy.calls.reset();
      removeOneVoteSpy.calls.reset();
    });

    it('should call downvote', async () => {
      findOneVoterSpy.and.resolveTo(undefined);
      downvoteSpy.and.resolveTo({});
      await service.downvote("xxxx_rantId", "xxxx_rantDownvoterId");
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalledWith(
        'rantDownvote',
        'xxxx_rantId',
        'xxxx_rantDownvoterId'
      );
      expect(service.rantDbUtils.downvote).toHaveBeenCalled();
      expect(service.rantDbUtils.downvote).toHaveBeenCalledWith(
        'xxxx_rantId',
        'xxxx_rantDownvoterId'
      );
      expect(service.rantDbUtils.removeOneVote).not.toHaveBeenCalled();
    });
    it('should not call downvote', async () => {
      findOneVoterSpy.and.resolveTo(true);
      removeOneVoteSpy.and.resolveTo({});
      await service.downvote("xxxx_rantId", "xxxx_rantDownvoterId");
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalled();
      expect(service.rantDbUtils.findOneVoter).toHaveBeenCalledWith(
        'rantDownvote',
        'xxxx_rantId',
        'xxxx_rantDownvoterId'
      );
      expect(service.rantDbUtils.downvote).not.toHaveBeenCalled();
      expect(service.rantDbUtils.removeOneVote).toHaveBeenCalled();
      expect(service.rantDbUtils.removeOneVote).toHaveBeenCalledWith(
        'rantDownvote',
        'xxxx_rantId',
        'xxxx_rantDownvoterId'
      );
    });
  });

  describe('::getRantFromAggregation', () => {

    let findAllRantsSpy;

    beforeEach(() => {
      findAllRantsSpy = spyOn(service.rantDbUtils, 'findAllRants');
    });

    afterEach(() => {
      findAllRantsSpy.calls.reset();
    });

    it('should call findAllRants', async () => {

      findAllRantsSpy.and.resolveTo([{}]);

      await service.getRantFromAggregation(
        {
          matchBy: {},
          numRequest: 20,
          calculateNext: 50,
          rantCount: 20
        }
      );

      expect(service.rantDbUtils.findAllRants).toHaveBeenCalled();
      expect(service.rantDbUtils.findAllRants).toHaveBeenCalledWith(
        {
          getRants: { $match: {} },

          sortInInsertionOrder: {
            $sort: { _id: -1 },
          },

          getRantPosters: {
            $lookup: {
              from: 'users',
              as: 'authoredBy',
              localField: 'rantPoster',
              foreignField: 'username',
            },
          },

          filterOutIds: {
            $project: {
              'authoredBy._id': false,
              'authoredBy.__v': false,
              'authoredBy.password': false,
              _id: false,
              __v: false,
              'edit._id': false,
              'edit.editHistory._id': false,
              'edit.editHistory.diff._id': false,
            },
          },

          spreadUsers: {
            $unwind: '$authoredBy',
          },

          limitSearchByVerifiedUsers: {
            $match: {
              'authoredBy.verified': true,
              'authoredBy.completeReg': true,
            },
          },

          lookUpRantCommentsSize: {
            $lookup: {
              from: 'rantcomments',
              localField: 'rantId',
              foreignField: 'rantId',
              as: 'rantCommentSize',
            },
          },

          filterOutUnwanted: {
            $project: {
              rantUpvote: { $size: '$rantUpvote' },
              rantDownvote: { $size: '$rantDownvote' },
              rantComments: { $size: '$rantCommentSize' },
              edit: true,
              deleted: true,
              rant: true,
              rantPoster: true,
              rantId: true,
              when: true,
              tags: true,
              authoredBy: true,
              shouldRead: {
                $size: {
                  $filter: {
                    input: '$authoredBy.settings.notAllowedTags',
                    as: 'tag',
                    cond: { $in: ['$$tag', '$tags'] },
                  },
                },
              },
            },
          },

          limitByAllowedTags: {
            $match: { shouldRead: 0 },
          },

          skipAlreadyViewed: {
            $skip: rantEnums.RANTS_LOAD_LIMIT * 20,
          },

          limitToDefinedEnum: {
            $limit: rantEnums.RANTS_LOAD_LIMIT,
          },

        }
      );
    });

  });

  describe('::getRants', () => {

    let getTotalRantsSpy;
    let findAllRantsSpy;

    beforeEach(() => {
      getTotalRantsSpy = spyOn(service.rantDbUtils, 'getTotalRants');
      findAllRantsSpy = spyOn(service.rantDbUtils, 'findAllRants');
    });

    afterEach(() => {
      getTotalRantsSpy.calls.reset();
      findAllRantsSpy.calls.reset();
    });

    it('should get rant from aggregation', async () => {
      getTotalRantsSpy.and.resolveTo(50);
      findAllRantsSpy.and.resolveTo([{}])
      await service.getRants({}, 20);
      expect(service.rantDbUtils.getTotalRants).toHaveBeenCalled();
      expect(service.rantDbUtils.getTotalRants).toHaveBeenCalledWith(
        { deleted: false }
      );
    });
  })
  describe('::isRantTagIgnored', () => {
    let findRantTagsSpy;
    beforeEach(() => {
      findRantTagsSpy = spyOn(service.rantDbUtils, 'findRantTags');
    });
    afterEach(() => {
      findRantTagsSpy.calls.reset();
    });
    it('should call findRantTags', async () => {
      findRantTagsSpy.and.resolveTo({});
      await service.isRantTagIgnored("xxxx", "abcd")
      expect(service.rantDbUtils.findRantTags).toHaveBeenCalled();
      expect(service.rantDbUtils.findRantTags).toHaveBeenCalledWith("xxxx", "abcd");
    });
  });
});
