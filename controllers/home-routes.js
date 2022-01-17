const router = require("express").Router();
const sequelize = require("../config/connection");
const { Post, User, Comment } = require("../models");

// Previously, we used res.send() or res.sendFile() for the response. Because we've hooked up a template engine, we can now use res.render() and specify which template we want to use. In this case, we want to render the homepage.handlebars template (the .handlebars extension is implied). This template was light on content; it only included a single <div>. Handlebars.js will automatically feed that into the main.handlebars template, however, and respond with a complete HTML file.
// Get home route
router.get("/", (req, res) => {
  Post.findAll({
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
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      // Loop through sequelize object and get the values we need and use the get method to serialize the data
      // Note that before we didn't need to serialize the data because res.json() did it for us
      const posts = dbPostData.map((post) => post.get({ plain: true }));
      // This will loop over and map each Sequelize object into a serialized version of itself, saving the results in a new posts array. Now we can plug that array into the template. However, even though the render() method can accept an array instead of an object, that would prevent us from adding other properties to the template later on. To avoid future headaches, we can simply add the array to an object and continue passing an object to the template.
      // This will momentarily break the template again, because the template was set up to receive an object with an id property, title property, and so on. Now the only property it has access to is the posts array. Fortunately, Handlebars.js has built-in helpers that will allow you to perform minimal logic like looping over an array.
      // This is also good since not destructuring posts actually leads to a security loophole that hackers can take advantage of
      res.render("homepage", { posts });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get login route
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  // Don't need any variables so we don't need to pass anything in
  res.render("login");
});

module.exports = router;
