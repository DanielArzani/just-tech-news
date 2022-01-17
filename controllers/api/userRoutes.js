const router = require("express").Router();
// Will automatically look for the index.js folder
const { User, Post, Vote, Comment } = require("../../models");

// GET all users
router.get("/", (req, res) => {
  // Find all instances of the class User
  // Don't return the password, its an array because you can add more than one
  //I think the attributes are the column names
  User.findAll({
    // attributes: { exclude: ["password"] },
  })
    // Return all users from the User table as JSON
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET user
router.get("/:id", (req, res) => {
  // Find first instance of User
  User.findOne({
    attributes: { exclude: ["password"] },
    where: {
      id: req.params.id,
    },
    // Now when we query a single user, we'll receive the title information of every post they've ever voted on.
    include: [
      {
        model: Post,
        attributes: ["id", "title", "post_url", "created_at"],
      },
      {
        model: Comment,
        attributes: ["id", "comment_text", "created_at"],
        include: {
          model: Post,
          attributes: ["title"],
        },
      },
      {
        model: Post,
        attributes: ["title"],
        through: Vote,
        as: "voted_posts",
      },
    ],
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        // Error on clients end
        res.status(404).json({
          message: "No user found with this id",
        });
        return;
      }
      res.json(dbUserData);
    })
    // Error on servers end
    .catch((err) => {
      if (err) {
        console.log(err);
        res.status(500).json(err);
      }
    });
});

// POST(Create) user
router.post("/", (req, res) => {
  // We're using a setter to set these the username, p/w, email
  // This is the same as the SQL command: INSERT INTO ... VALUES ...
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  })
    // This gives our server easy access to the user's user_id, username, and a Boolean describing whether or not the user is logged in.
    // We want to make sure the session is created before we send the response back, so we're wrapping the variables in a callback. The req.session.save() method will initiate the creation of the session and then run the callback function once complete.
    .then((dbUserData) => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json(dbUserData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// LOGIN POST Route
router.post("/login", (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((dbUserData) => {
    if (!dbUserData) {
      res.status(400).json({ message: "No user with that email address!" });
      return;
    }

    // Verify the user's identity by matching the password from the user and the hashed password in the database.
    // Returns a boolean
    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }

    req.session.save(() => {
      // declare session variables
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: "You are now logged in!" });
    });
  });
});

// We haven't designated a response for a Get request to the logout route so the user won't get anything by trying to request this endpoint but if they simply post data to it then the current session will be destroyed
// Logout
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// PUT(Update) user
router.put("/:id", (req, res) => {
  // Step 1: Query through db and find the user
  // We are specifying what columns needs to be updated since it will match the key value pair of req.body
  User.update(req.body, {
    // This is the updated password gets hashed as well
    individualHooks: true,
    // Find first instance of users in Users table where id column has a val of params.id
    where: { id: req.params.id },
  })
    .then((dbUserData) => {
      // Even though we are using a unique id this is making doubly sure that only the first instance is altered, not any others
      if (!dbUserData[0]) {
        res.status(404).json("No user found with this id");
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
// DELETE a user
router.delete("/:id", (req, res) => {
  // destroy will delete multiple instances
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json("Couldn't find user");
        return;
      }
      // Theres nothing to send here since it should be deleted, right?
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
