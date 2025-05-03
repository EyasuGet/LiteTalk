import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '10d'})

    res.cookie("jwt", token, {
        maxAge: 10*24*60*60*1000,//MS
        httpOnly: true, //this will prevent cross site scripting(XSS) attack
        sameSite: "strict", //prevents CSRF attacks (forgery attacks like XSS)
        secure: process.env.NODE_ENV !== "development",
    })
}