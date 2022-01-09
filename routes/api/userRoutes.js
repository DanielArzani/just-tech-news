const router = require("express").Router();
const { redirect } = require("express/lib/response");
// Will automatically look for the index.js folder
const { User } = require("../../models");

// GET all users
router.get("/", (req, res) => {
  // Find all instances of the class User
  // Don't return the password, its an array because you can add more than one
  //I think the attributes are the column names
  User.findAll({
    attributes: { exclude: ["password"] },
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
    .then((dbUserData) => {
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// PUT(Update) user
router.put("/:id", (req, res) => {
  // Step 1: Query through db and find the user
  // We are specifying what columns needs to be updated since it will match the key value pair of req.body
  User.update(req.body, {
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
