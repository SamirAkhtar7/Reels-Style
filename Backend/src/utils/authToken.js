const jwt = require("jsonwebtoken")

exports.getToken = async(userId) => {
    try {
        const token = await jwt.sign({
            userId
        }, process.env.JWT_SECRET,{expiresIn:"1h"})
        
        return token;
    }
    catch (err) {
        throw new Error(err)
    }
}