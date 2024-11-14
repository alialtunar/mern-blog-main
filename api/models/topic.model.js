import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Number,
      required: true,
      default:1
    },
    category: {
      type: String,
      required: true,
    },
    metaTitle: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model('Topics', topicSchema);

export default Topic;
