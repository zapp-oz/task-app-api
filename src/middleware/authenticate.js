const jwt = require("jsonwebtoken")
const User = require("./../models/users")

const authenctication = async (req, res, next) => {
    
    try{
        const token = req.header("Authorization").replace("Bearer ", "")
        const value = jwt.verify(token, process.env.JSON_WEB_TOKEN_KEY)
        const user = await User.findOne({_id: value._id, "tokens.token": token})
        
        if(!user){
            throw new Error("Please Authenticate!")
        }

        req.token = token
        req.user = user 

        next()
    } catch(e){
        res.status(401).send("Error: Please Authenticate")
    }
}

module.exports = authenctication