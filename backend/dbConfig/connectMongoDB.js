import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongoDB connected");
  } catch (err) {
    console.error(`Error in connection to mongoDB: ${err}`);
    process.exit(1);
  }
};

export default connectMongoDB;
