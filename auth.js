module.exports = {
    //checks if user is authenticated 
    ensureAuthenticated: function (req, res, next) {
        console.log("checking authentication status...")
      if (req.isAuthenticated() && req.user) {
        console.log("User is authenticated")
        return next();
      }
      console.log("User is not authenticated ,redirecting to /login")
      req.flash("error_msg", "Please log in to view that resource");
      res.redirect("/login");
    },
    //checks if user is not authenticated 
    forwardAuthenticated: function (req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect("/");
    },
  };
