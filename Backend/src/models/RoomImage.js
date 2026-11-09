const mongoose = require('mongoose');

const roomImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  path: {
    type: String,
    required: true,
  },
}, { timestamps: true });

roomImageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('RoomImage', roomImageSchema);

