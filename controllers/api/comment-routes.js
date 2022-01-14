const router = require("express").Router();
const { Comment } = require("../../models");

// Get all comments
router.get("/", (req, res) => {
  Comment.findAll()
    .then((dbCommentData) => {
      res.json(dbCommentData);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// Create comment
router.post("/", (req, res) => {
  Comment.create({
    comment_text: req.body.comment_text,
    user_id: req.body.user_id,
    post_id: req.body.post_id,
  })
    .then((dbCommentData) => {
      res.json(dbCommentData);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

// Delete Comment
router.delete("/:id", (req, res) => {
  Comment.destroy({
    where: { id: req.params.id },
  })
    .then((dbCommentData) => {
      res.json(dbCommentData);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;