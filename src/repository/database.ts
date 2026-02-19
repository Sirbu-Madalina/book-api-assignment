import mongoose from "mongoose";

export async function connect() {
  try {
    if (!process.env.DBHOST) {
      throw new Error("DBHOST environment variable is not defined");
    }
    await mongoose.connect(process.env.DBHOST);

    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log ("Connection established");
    } 
    else {
      throw new Error("Database connection is not established");
    }
  } 
  catch (error) {
    console.log("Error connecting to the databse. Error: " + error);
  }
}
