import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const {username, fullname,  email, password} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"})
        }

        const existingUser = await User.findOne({username})
        if (existingUser){
            return res.status(400).json({error: "Username already taken"})
        }

        const existingEmail = await User.findOne({email})
        if (existingEmail){
            return res.status(400).json({error: "Email already taken"})
        }

        if (password.length < 6){
            return res.status(400).json({message: "Password length must be greater than 6"})
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname: fullname,
            username: username,
            email: email,
            password: hashedPassword
        })

        if (newUser){
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save();

            return res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            });
        }else{

            return res.status(400).json({error: "User creation failed"})
        }
        
    } catch (error) {
        console.log("error in signup", error.message)
        return res.status(500).json({error: "Internal server error"});
    }
}

export const login = async (req, res) => {
    try {
        const {username, password} = req.body

        const user = await User.findOne({username})
        const match =await bcrypt.compare(password, user?.password || "")
        
        console.log(user)
        if (!user || !match){
            return res.status(400).json({
                message: "invalid Username or password"
            })
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })
        
    } catch (error) {
        console.log("error in login", error.message)
        return res.status(500).json({error: "Internal server error"});
    }
    
}

export const logout = async (req, res) => {

    try {
        res.cookie("jwt", "", {maxAge: 0})
        res.status(400).json({
            message: "Logged out Successfully"
        })
    } catch (error) {
        console.log("error in logout", error.message)
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getme = async (req, res) => {

    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)

    } catch (error) {
        console.log("error in getme", error.message)
        return res.status(500).json({error: "Internal server error"});
    }
}
