const User = require("./users");
const Post = require("./Post");

// This is saying that an instance of User can have many Posts(Which I think are also called pets in ORM)
User.hasMany(Post, {
  foreignKey: "user_id",
});

// This is saying that Post can only belong to one User, not many of them
// I suppose this is so different Users can't share posts
Post.belongsTo(User, {
  foreignKey: "user_id",
});

module.exports = { User, Post };
