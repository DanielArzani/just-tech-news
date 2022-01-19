const router = require("express").Router();

// Automatically looks for index.js
const apiRoutes = require("./api");

// Contains all of the user-facing routes, such as the homepage and login page
const homeRoutes = require("./home-routes");

// Dashboard routes
const dashboardRoutes = require("./dashboard-routes");

router.use("/", homeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/api", apiRoutes);

// This is so if we make a request to any endpoint that doesn't exist, we'll receive a 404 error indicating we have requested an incorrect resource
router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;
