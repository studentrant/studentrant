export default class RantRepliesDbUtils {
  constructor(rantCommentCollection) {
    this.RantCommentCollection = rantCommentCollection;
  }

  async saveReply(data) {
    await (new this.RantCommentCollection(data).save());
    return this.RantCommentCollection.findOne({ rantCommentId: data.rantCommentId }, {
      _id: false,
      __v: false,
    }).lean();
  }

  async findAllReplies(pipeline) {
    return this.RantCommentCollection.aggregate(
      [
        pipeline.matchComments,
        pipeline.skipUnwanted,
        pipeline.limitComment,
        pipeline.getNReplyCountAndFirstNReply,
        pipeline.removeUnwanted,
        // pipeline.getChildCommentAsObject
      ],
    );
  }

  async getRepliesCount(query) {
    return this.RantCommentCollection.countDocuments(query);
  }

  async getReply(dbOps) {
    return this.RantCommentCollection.findOne(dbOps.query);
  }

  async findIfUserIsCommenter(rantCommenter, rantCommentId) {
    return this.RantCommentCollection.findOne({ rantCommenter, rantCommentId });
  }

  async deleteUserReply(rantCommentId) {
    return this.RantCommentCollection.updateOne({ rantCommentId }, { $set: { deleted: true } });
  }

  async editUserReply({ replyRantId, replyRant }) {
    return this.RantCommentCollection.findOneAndUpdate(
      { rantCommentId: replyRantId },
      {
        $set: {
          rantComment: replyRant,
          edited: true,
        },
      },
      { new: true, fields: { _id: false } },
    );
  }
}
