// This is known as an authguard, it gaurds against unauthenticated (not logged in) users
const withAuth = (req, res, next) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    next();
  }
};
module.exports = withAuth;
