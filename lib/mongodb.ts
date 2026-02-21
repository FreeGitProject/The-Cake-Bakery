import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise: Promise<mongoose.Mongoose>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongoose = global as typeof globalThis & {
    _mongooseClientPromise?: Promise<mongoose.Mongoose>;
  };

  if (!globalWithMongoose._mongooseClientPromise) {
    globalWithMongoose._mongooseClientPromise = mongoose.connect(uri, options);
  }
  clientPromise = globalWithMongoose._mongooseClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = mongoose.connect(uri, options);
}

export default clientPromise;
