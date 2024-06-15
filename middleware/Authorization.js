const jwt = require("jsonwebtoken");

function AuthorizationMiddleware(req, res, next) {

  const token = req.header("x-auth-token");
  // console.log("request from token", token);

    if (!token)
    {
        console.log("No token, authorization denied");
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    try 
    {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("token verified, authorization approved");
        req.user = decoded.user;
        next();
    } 
  catch (err)
  {
    console.log("Token is not valid");
    res.status(401).json({ msg: "Token is not valid" });
  }
}

module.exports = AuthorizationMiddleware;
