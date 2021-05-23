/* eslint-disable max-classes-per-file */
/* eslint-disable no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */

export class Collection {
  constructor() {}

  save() {}

  static findOne(value) { return { lean() { return Promise.resolve(value); } }; }

  static updateOne(value) { return { lean() { return Promise.resolve(value); } }; }

  static findOneAndUpdate(value) { return { lean() { return Promise.resolve(value); } }; }

  static aggregate(value) { return Promise.resolve(value); }

  static countDocuments(value) { return Promise.resolve(value); }

  static bulkWrite(value) { return Promise.resolve(value); }
}

export class UserDbUtils {
  constructor() {}

  updateUserInfo() {}

  checkEmail() {}

  checkUserName() {}

  saveNewUser() {}
}

export class RantDbUtils {
  constructor() {}

  saveRant() {}

  findOneRant() {}

  checkUserName() {}

  deleteOneRant() {}

  editOneRant() {}

  upvote() {}

  findOneVoter() {}

  removeOneVote() {}

  downvote() {}

  findAllRants() {}

  getTotalRants() {}

  findRantTags() {}
}

export class TrendDbUtils {
  constructor() {}

  getTotalRants() {}

  getTrendsAggregation() {}
}

export class ReplyRantDbUtils {
  constructor() {}

  saveReply() {}

  findAllReplies() {}

  getRepliesCount() {}

  getReply() {}

  findIfUserIsCommenter() {}

  deleteUserReply() {}

  editUserReply() {}
}
