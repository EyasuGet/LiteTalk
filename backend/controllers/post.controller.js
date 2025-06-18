import { v2 as cloudinary} from "cloudinary"

import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import { Mongoose } from "mongoose"

export const createPost = async (req, res) => {
    
    try {
        const {text} = req.body
        let {img} = req.body
        const userId = req.user._id.toString()

        const user = await User.findById(userId)
        if (!user){
            return res.status(404).json({
                error: "User Not Found"
            })
        }

        if (!text && !img){
            return res.status(400).json({
                error: "Post must have a text and an image"
            })
        }

        if (img){
            const uploadRes = await cloudinary.uploader.upload(img)
            img = uploadRes.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save()
        res.status(201).json(newPost)
    
    } catch (error) {
        console.log("error in createPostController", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const deletePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        if (!post){
            return res.status(404).json({
                error: "Post Not Found"
            })
        }

        if (post.user.toString() !== req.user._id.toString()){
            res.status(401).json({
                error: "You are not authorized to delete this post"
            })
        }

        if (post.img){
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            message: "Post deleted successfully"
        })
    } catch (error) {
        console.log("error in deletePostController", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const likeUnlikePost = async (req, res) => {

    try {
        const {id: postId} = req.params
        const userId = req.user._id
        const post = await Post.findById(postId)

        if(!post){
            return res.status(404).json({error: "Post Not Found"})
        }

        const isLiked = post.likes.includes(userId.toString())


        if (isLiked){
            await Post.updateOne({_id: postId}, { $pull: {likes: userId}})
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})
            res.status(200).json({message: "Post Unliked"})
        }else{
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            await post.save()

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })

            await notification.save()
            
            res.status(200).json({message: "Post liked successfully!"})
        }

    } catch (error) {
        console.log("error in likeUnlikePost", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const commentOnPost = async (req, res) => {

    try {
        
        const {text} = req.body 
        const postId = req.params.id
        const userId = req.user._id

        if (!text) {
            return res.status(400).json({error: "Text Field is required"})
        }

        const post = await Post.findById(postId)

        if (!post){
            return res.status(400).json({error: "Post Not Found"})
        }

        const comment = {user: userId, text}
        post.comments.push(comment)
        await post.save()

        return res.status(200).json(post)

    } catch (error) {
        console.log("error in commentOnPost", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const getPosts = async (req, res) => {

    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })


        if(posts.length !== 0){
            return res.status(200).json(posts)
        }else{
            return res.status(404).json([],{message: "No posts"})
        }
    } catch (error) {
        console.log("error in getPosts", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const likedPosts = async (req, res) => {

    try {
        const userId = req.params.id
        const user = await User.findById(userId)

        if (!user){
            return res.status(404).json({
                error: "User Not Found"
            })
        }

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(likedPosts)
    } catch (error) {
        console.log("error in LikedPosts", error.message)
        return res.status(500).json({error: error.message}); 
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ error: "User not found"});

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following}}).sort({createdAt: -1}).populate({
            path: "comments.user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(feedPosts)

    } catch (error) {
        console.log("Error in get following posts: ", error)
        return res.status(500).json({error: error.message}); 
    }
}

export const getUserPosts = async (req, res) => {

    try {
        const { username } = req.params
        console.log(username)
        const user = await User.findOne({username})
        if (!user) {
            console.log(username)
            return res.status(404).json({ error: "User Not Found"})
        }

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        res.status(200).json(posts)

    } catch (error) {
        console.log("Error in get user posts: ", error)
        return res.status(500).json({error: error.message});    
    }
}