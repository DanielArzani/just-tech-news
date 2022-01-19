const router = require("express").Router();
// In a query to the post table, we would like to retrieve not only information about each post, but also the user that posted it. With the foreign key, user_id, we can form a JOIN
const { Post, User, Vote, Comment } = require("../../models");
// We need this in order to use sequelize.literal()
const sequelize = require("../../config/connection");
// Auth gaurd so non logged in users can't post comments and do stuff that logged in users can
const withAuth = require("../../utils/auth");

// The created_at column is auto-generated at the time a post is created with the current date and time, thanks to Sequelize. We do not need to specify this column or the updated_at column in the model definition, because Sequelize will timestamp these fields by default unless we configure Sequelize not to.

// Get all posts
router.get("/", (req, res) => {
  console.log("=================");
  Post.findAll({
    // Remember back in the Post model, we defined the column names to have an underscore naming convention by using the underscored: true, assignment. In Sequelize, columns are camelcase by default.
    // This is all the attributes that will be included
    attributes: [
      "id",
      "post_url",
      "title",
      "created_at",
      // For counting total votes
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)"
        ),
        "vote_count",
      ],
    ],
    // Notice that the order property is assigned a nested array that orders by the created_at column in descending order. This will ensure that the latest posted articles will appear first.
    order: [["created_at", "DESC"]],
    // This is an array of objects incase we wanted to join more than one table
    // The only information we want from the User instance is the username column
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    .then((dbPostsData) => {
      res.json(dbPostsData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get single post
router.get("/:id", (req, res) => {
  Post.findOne({
    where: { id: req.params.id },
    attributes: [
      "id",
      "post_url",
      "title",
      "created_at",
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)"
        ),
        "vote_count",
      ],
    ],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post was found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Create Post
router.post("/", (req, res) => {
  Post.create({
    title: req.body.title,
    post_url: req.body.post_url,
    user_id: req.session.user_id,
  })
    .then((dbPostData) => {
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// When we vote on a post, we're technically updating that post's data
// This PUT route needs to be defined before the /:id PUT route otherwise Express.js will think the word "upvote" is a valid parameter for /:id.

// PUT api/posts/upvote
router.put("/upvote", (req, res) => {
  // make sure the session exists first
  if (req.session) {
    // pass session id along with all destructured properties on req.body
    // custom static method created in models/Post.js
    Post.upvote(
      { ...req.body, user_id: req.session.user_id },
      { Vote, Comment, User }
    )
      .then((updatedVoteData) => res.json(updatedVoteData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

// Update post
router.put("/:id", (req, res) => {
  // Doing this like how its done is userRoutes also works, this is another method
  // If you see a 1 it means that the column was updated
  Post.update(
    // I think this method will lock it so only the title can be changed?
    { title: req.body.title },
    {
      // Each post has its own id
      where: { id: req.params.id },
    }
  )
    .then((dbUpdatedPostData) => {
      if (!dbUpdatedPostData) {
        res.status(404).json({ message: "No post was found with that id" });
      }
      res.json(dbUpdatedPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Delete post
// Should also only see a 1 to show that a single query was affected
router.delete("/:id", (req, res) => {
  Post.destroy({
    where: { id: req.params.id },
  })
    .then((dbDeletedPostData) => {
      if (!dbDeletedPostData) {
        res.status(404).json({ message: "No post was found with that id" });
      }
      res.json(dbDeletedPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
module.exports = router;
