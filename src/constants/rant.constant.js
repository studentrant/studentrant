const rantConstants = {
  RANT_LENGTH_NOT_MORE_THAN_TWENTY: 'Rant cannot be created because it is less than 20',

  RANT_BODY_UNDEFINED: 'Rant body data is not defined',
  RANT_TAGS_NOT_AN_ARRAY: 'Expect an array as rant tags but got ',
  RANT_TAGS_UNDEFINED: 'Tag body data is not defined',
  RANT_ID_IS_UNDEFINED: 'There is no id specified for the rant to modify',
  RANT_DOES_NOT_EXISTS: 'This rant does not exists',
  RANT_NOT_USER: 'You are not allowed to modify this rant at this time',
  RANT_SUCCESSFULLY_DELETED: 'Rant has been deleted succefully',
  RANT_WHEN_NO_EXISTS: 'A when field is required, it carries the timestamp of when the edit request was made',
  RANT_NOT_NUMBER: 'when property must be a number',
  RANT_NOT_VALID_TIMESTAMP: 'Invalid timestamp information passed as value to the when property',
  RANT_HAS_ALREADY_BEEN_DELETED: 'Rant has already been deleted',
  RANT_USER_UPVOTER_NOT_EXISTS: 'The rant upvoter does not exists',
  RANT_USER_UPVOTER_DEACTIVATED: 'Your account has been deactivated, you can\'t carry out this operation',
  RANT_USER_UPVOTE_REMOVED: 'Your upvote has been removed',
  RANT_VOTER_NO_EXISTS: 'Rant voter is undefined',
  RANT_NOT_VALID_LOAD_NUM_REQUEST: 'numRequest is not a number',
  RANT_READ_EXHAUSTED: "No Rant's to read",
};

export default rantConstants;
