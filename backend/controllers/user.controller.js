import express from 'express'
import { v2 as cloudinary } from 'cloudinary'
import bcrypt from 'bcryptjs'

import User from '../models/user.model.js'
import Notification from '../models/notification.model.js'

export const getUserProfile = async (req, res) => {
    const {username} = req.params
    
    try {
        const user = await User.findOne({username}).select("-password")
        
        if (!user){
            return res.status(404).json({error: "User Not Found"})
        }
        
        return res.status(200).json(user)

    } catch (error) {
        console.log("error in getuserprofile", error.message)
        return res.status(500).json({error: error.message});
    }
}

export const followUnfollowuser = async (req, res) => {

    try {
        const {id} = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id) //comes from verifyToken

        if (id === req.user._id.toString()) { //might be an object
            return res.status(400).json({error: "You cant follow or unfollow yourself"})
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({error: "User Not found"})
        }

        const isFollowing = currentUser.following.includes(id)

        if (isFollowing){//unfollow

            await User.findByIdAndUpdate(id, {
                $pull: {followers: req.user._id}
            })

            await User.findByIdAndUpdate(req.user._id, {
                $pull: {following: id}
            })

            res.status(200).json({message: "User Unfollowed Successfully"})

        }else{ //follow
            await User.findByIdAndUpdate(id, {
                $push: {followers: req.user._id}
            }, {new: true})

            await User.findByIdAndUpdate(req.user._id, {
                $push: {following: id}
            })

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })

            await newNotification.save();

            res.status(200).json({message: "User Followed Successfully"})
        }
        
    } catch (error) {
        console.log("error in followUnfollowUser", error.message)
        return res.status(500).json({error: error.message});
    
    }
}

export const getSuggestedUser = async (req, res) => {

    try {
        const userId = req.user._id

        const usersFollowing =await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                },
            },
            { $sample: {size: 10}}
        ])

        const filterUsers = users.filter((user) => !usersFollowing.following.includes(user._id))
        const suggestedUsers = filterUsers.slice(0, 4)

        suggestedUsers.forEach((user) => (user.password = null))

        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log("error in getSuggestedUser", error.message)
        return res.status(500).json({error: error.message});
    
    }
}

export const updateUserProfile = async (req, res) => {
    
    const {username, fullname, email, currentPassword, newPassword, bio, link } = req.body
    let {profileImg, coverImg} = req.body

    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: "User Not Found"})
        }

        if ((currentPassword && !newPassword ) || (!currentPassword && newPassword )){
            return res.status(400).json({error: "Please provide both current and new password"})
        }

        if (currentPassword && newPassword){

            const match = await bcrypt.compare(currentPassword, user.password)
            if (!match){
                return res.status(400).json({error: "Current passworrd is incorrect"})
            }

            if (newPassword.length < 6){
                return res.status(400).json({error: "password length must be atleast 6"})
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if (profileImg) {
            //if user already has a profile we should delete from cloud
            if (user.profileImg){
                //extract the id from the url
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split("."[0]))
            }

            const uploadedRes = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedRes.secure_url
        }

        if (coverImg) {
            //if user already has a profile we should delete from cloud
            if (user.coverImg){
                //extract the id from the url
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split("."[0]))
            }
            const uploadedRes = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedRes.secure_url
        }

        user.fullname = fullname || user.fullname
        user.username = username || user.username
        user.email = email || user.email
        user.link = link || user.link
        user.bio = bio || user.bio
        user.coverImg = coverImg || user.coverImg
        user.profileImg = profileImg || user.profileImg

        user = await user.save()
        user.password = null

        return res.status(200).json(user)

    } catch (error) {
        console.log("error in updateUserProfile", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

