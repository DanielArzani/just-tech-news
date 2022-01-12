const router = require("express").Router();
const { Post, User, Vote, Comment } = require("../../models");
// We need this in order to use sequelize.literal()
const sequelize = require("../../config/connection");

// Get all posts
router.get("/", (req, res) => {
  console.log("=================");
  Post.findAll({
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
    order: [["created_at", "DESC"]],
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
    user_id: req.body.user_id,
  })
    .then((dbPostData) => {
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// PUT api/posts/upvote
router.put("/upvote", (req, res) => {
  // custom static method created in models/Post.js
  Post.upvote(req.body, { Vote })
    .then((updatedPostData) => res.json(updatedPostData))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// Update post
router.put("/:id", (req, res) => {
  Post.update(
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
