import mongoose from 'mongoose';

const RantSchema = new mongoose.Schema({
  tags: {
    type: Array,
    index: true,
  },
  when: Number,
  rantId: {
    type: String,
    unique: true,
  },
  rantPoster: {
    type: String,
    ref: 'Users',
    index: true,
  },
  rant: {
    type: String,
  },
  /**
   * parentCommentId, if the current rant has a parent
   *
   *
   *
   *
   * */
  rantComments: [{
    // rantCommentId is the current comment/reply that might have a parent and/or children
    rantCommentId: String,
    parentCommentId: String,
    childrenCommentId: [{ type: String }],
  }],
  deleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  edit: {
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        /** when signifies when the did edit was made* */
        when: Number,

        /** diff contains things the difference between
*  the edits made on the rant and what was initial the rant
*  the values here should be used to do a color change
* */

        diff: [
          {
            value: String,
            added: {
              type: Boolean,
              default: false,
            },
            removed: {
              type: Boolean,
              default: false,
            },
          },
        ],
        /** diffAgainst is the rant before it was edited * */
        diffAgainst: String,
      },
    ],
  },
  // the _id is auto generated by mongodb
  // this should only be used internally for referencing
  rantUpvote: [mongoose.Types.ObjectId],
  rantDownvote: [mongoose.Types.ObjectId],
}, { timestamp: true });

RantSchema.index({ rantUpvote: true });
RantSchema.index({ rantDownvote: true });

const RantsCollection = mongoose.model('Rants', RantSchema);

export default RantsCollection;
