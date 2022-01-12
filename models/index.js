const User = require("./users");
const Post = require("./Post");
const Vote = require("./Vote");

// This is saying that an instance of User can have many Posts(Which I think are also called pets in ORM)
User.hasMany(Post, {
  foreignKey: "user_id",
});

// This is saying that Post can only belong to one User, not many of them
// I suppose this is so different Users can't share posts
Post.belongsTo(User, {
  foreignKey: "user_id",
});

// we need to associate User and Post to one another in a way that when we query Post, we can see a total of how many votes a user creates; and when we query a User, we can see all of the posts they've voted on.
// With these two .belongsToMany() methods in place, we're allowing both the User and Post models to query each other's information in the context of a vote. If we want to see which users voted on a single post, we can now do that. If we want to see which posts a single user voted on, we can see that too.
// Furthermore, the Vote table needs a row of data to be a unique pairing so that it knows which data to pull in when queried on. So because the user_id and post_id pairings must be unique, we're protected from the possibility of a single user voting on one post multiple times. This layer of protection is called a foreign key constraint.

// Bridges Post and User together through vote
User.belongsToMany(Post, {
  through: Vote,
  as: "voted_posts",
  foreignKey: "user_id,",
});

Post.belongsToMany(User, {
  through: Vote,
  as: "voted_posts",
  foreignKey: "post_id",
});

// By also creating one-to-many associations directly between these models, we can perform aggregated SQL functions between models. In this case, we'll see a total count of votes for a single post when queried. This would be difficult if we hadn't directly associated the Vote model with the other two.
Vote.belongsTo(User, {
  foreignKey: "user_id",
});

Vote.belongsTo(Post, {
  foreignKey: "post_id",
});

User.hasMany(Vote, {
  foreignKey: "user_id",
});

Post.hasMany(Vote, {
  foreignKey: "post_id",
});

module.exports = { User, Post, Vote };
