import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
  });
  
  export default mongoose.model('Image', imageSchema);
  