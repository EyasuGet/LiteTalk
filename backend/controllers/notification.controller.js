import Notification from "../models/notification.model.js"

export const getNotification = async (req, res) => {
    try {
        const userId = req.user._id

        const notification = await Notification.find({to: userId}).populate({
            path: "from",
            select: "username prifileImg"
        });

        await Notification.updateMany({to: userId}, {read: true})

        res.status(200).json(notification)
    } catch (error) {
        console.log("error in getNotification", error.message)
        return res.status(500).json({error: error.message});
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id

        await Notification.deleteMany({to: userId})

        res.status(200).json({message: "Notification deleted successfully"})
    } catch (error) {
        console.log("error in deleteNotification", error.message)
        return res.status(500).json({error: error.message});
    }
}