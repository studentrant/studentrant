import RantValidators from './rant.middleware.js';
import req from '../../__test__/fakes/req.fake.js';
import res from '../../__test__/fakes/res.fake.js';
import next from '../../__test__/fakes/next.fake.js';
import { rantConstants } from '../constants/index.constant.js';

describe('RantValidators [Unit]', () => {
  const nextValue = { next };
  let nextSpy;

  beforeEach(() => {
    nextSpy = spyOn(nextValue, 'next').and.callThrough();
  });

  afterEach(() => {
    nextSpy.calls.reset();
    req.body = {};
    req.query = {};
  });

  describe('::VerifyRant', () => {
    it('should throw badexception if req.body.rant is undefined', () => {
      expect(() => {
        RantValidators.VerifyRant(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_BODY_UNDEFINED);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should throw badexception if rant body is less than 20', () => {
      req.body.rant = 'hello world';
      expect(() => {
        RantValidators.VerifyRant(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_LENGTH_NOT_MORE_THAN_TWENTY);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should call next without any parameter if the above conditions me et', () => {
      req.body.rant = 'hello world'.repeat(50);
      RantValidators.VerifyRant(req, res, nextValue.next);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe('::VerifyRantTags', () => {
    it('should throw badexception if req.body.tags is undefined', () => {
      expect(() => {
        RantValidators.VerifyRantTags(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_TAGS_UNDEFINED);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should throw badvalueexception if req.body.tags is not an array', () => {
      req.body.tags = 'foo';
      expect(() => {
        RantValidators.VerifyRantTags(req, res, nextValue.next);
      }).toThrowError(`${rantConstants.RANT_TAGS_NOT_AN_ARRAY} ${typeof (req.body.tags)}`);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should call next if all the above condition meets', () => {
      req.body.tags = ['test'];
      RantValidators.VerifyRantTags(req, res, nextValue.next);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe('::VerifyRantId', () => {
    it('it should throw badvalueexception if if rant id is undefined', () => {
      expect(() => {
        RantValidators.VerifyRantId(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_ID_IS_UNDEFINED);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should call next if the above condition meets', () => {
      req.params.rantId = 'xxxx';
      RantValidators.VerifyRantId(req, res, nextValue.next);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe('::VerifyWhen', () => {
    it('should throw badvalueexception if req.body.when is undefined', () => {
      expect(() => {
        RantValidators.VerifyWhen(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_WHEN_NO_EXISTS);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('should throw badvalueexception if req.body.when is not a number', () => {
      req.body.when = 'foo bar';
      expect(() => {
        RantValidators.VerifyWhen(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_NOT_NUMBER);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('should throw badvalueexception if req.body.when is an invalid timestamp', () => {
      req.body.when = 22222222222222222222222222222;
      expect(() => {
        RantValidators.VerifyWhen(req, res, nextValue.next);
      }).toThrowError(rantConstants.RANT_NOT_VALID_TIMESTAMP);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('should call next', () => {
      req.body.when = Date.now();
      RantValidators.VerifyWhen(req, res, nextValue.next);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe("::VerifyNumRequest", () => {
    it('should throw badvalueexception if req.query.numRequest is not a number', () => {
      req.query.numRequest = 'asdfadsfadf';
      expect(() => {
        RantValidators.VerifyNumRequest(req,res,nextValue.next);
      }).toThrowError(rantConstants.RANT_NOT_VALID_LOAD_NUM_REQUEST);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('shoudl call next', () => {
      req.query.numRequest = '12';
      expect(() => {
        RantValidators.VerifyNumRequest(req,res,nextValue.next);
      }).not.toThrowError(rantConstants.RANT_NOT_VALID_LOAD_NUM_REQUEST);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });
  describe("::VerifyTrend", () => {
    it('should throw rant not a valid trend if it does not start with #', () => {
      req.params.trend = "bb";
      expect(() => {
        RantValidators.VerifyTrend(req,res,nextValue.next);
      }).toThrowError(rantConstants.RANT_NOT_VALID_TREND);
      expect(nextValue.next).not.toHaveBeenCalled();
    })

    it('should not throw error when trend starts with #', () => {
      req.params.trend = "#xxx";
      expect(() => {
        RantValidators.VerifyTrend(req,res,nextValue.next)
      }).not.toThrowError(rantConstants.RANT_NOT_VALID_TREND);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe("::VerifyReplyRant", () => {

    it('throw error when req.body.replyRant is undefined', () => {
      req.body.replyRant = undefined;
      expect(() => {
        RantValidators.VerifyReplyRant(req,res,nextValue.next)
      }).toThrowError(rantConstants.RANT_REPLY_UNDEFINED);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('throw error when req.body.replyRant is less than 20', () => {
      req.body.replyRant = "b".repeat(10);
      expect(() => {
        RantValidators.VerifyReplyRant(req,res,nextValue.next)
      }).toThrowError(rantConstants.RANT_REPLY_NOT_MORE_THAN_TWENTY);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('should not throw error when req.body.replyRant meets requirements', () => {
      req.body.replyRant = "b".repeat(21);
      expect(() => {
        RantValidators.VerifyReplyRant(req,res,nextValue.next)
      }).not.toThrowError(rantConstants.RANT_REPLY_NOT_MORE_THAN_TWENTY);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe("::VerifyReplyRantId", () => {
    it('should throw reply rant no rant id if replyRantId is undefined', () => {
      req.params.replyRantId = undefined;
      expect(() => {
        RantValidators.VerifyReplyRantId(req,res,nextValue.next)
      }).toThrowError(rantConstants.RANT_REPLY_NO_RANT_ID);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should not throw error if replyRantId is defined', () => {
      req.params.replyRantId = "xxxxxxxxxxx"
      expect(() => {
        RantValidators.VerifyReplyRantId(req,res,nextValue.next);
      }).not.toThrowError(rantConstants.REPLY_RANT_NO_RANT_ID);
      expect(nextValue.next).toHaveBeenCalled();
    });
  });

  describe("::VerifyReplyRantParams", () => {
    it('should throw error when rantId and parentCommentId is undefined', () => {
      req.params.rantId = undefined;
      req.query.parentCommentId = undefined;
      expect(() => {
        RantValidators.VerifyReplyRantParams(req,res,nextValue.next)
      }).toThrowError(rantConstants.REPLY_RANT_NO_PARAMS);
      expect(nextValue.next).not.toHaveBeenCalled();
    });
    it('should throw error when req.query.parentCommentId is defineds and req.params.rantId is undefined', () => {
      req.query.parentCommentId = "xxxxxxxxxx";
      req.params.rantId = undefined;
      expect(() => {
        RantValidators.VerifyReplyRantParams(req,res,nextValue.next)
      }).toThrowError(rantConstants.REPLY_RANT_NO_RANT_ID);
      expect(nextValue.next).not.toHaveBeenCalled();
    });

    it('should pass if req.params.rantId is defined', () => {
      req.params.rantId = 'xxxxxxxxxxxx';
      expect(() => {
        RantValidators.VerifyReplyRantParams(req,res,nextValue.next)
      }).not.toThrowError(rantConstants.RANT_ID_IS_UNDEFINED);
      expect(nextValue.next).toHaveBeenCalled();
    });

    it('should pass if req.query.parentCommentId and req.params.rantId is deifned ', () => {
      req.params.rantId = 'xxxxxx';
      req.query.parentCommentId = 'qqqqqq';
      expect(() => {
        RantValidators.VerifyReplyRantParams(req,res,nextValue.next)
      }).not.toThrowError(rantConstants.RANT_ID_IS_UNDEFINED);
      expect(nextValue.next).toHaveBeenCalled();
    })
  });
});
