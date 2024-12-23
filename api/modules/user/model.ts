// schema.ts
require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
mongoose.connect(mongoDatabaseURL)
const UserSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    role: [Number], //0=> admin, 1=>enduser
    profile_pic_path: String,
})
const UserModel = mongoose.model("users", UserSchema)

export { UserModel, UserSchema };