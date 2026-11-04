import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

export async function connectMongo(uri = process.env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function pingMongo() {
  await connectMongo();
  await mongoose.connection.db.admin().command({ ping: 1 });
}

export { mongoose };
