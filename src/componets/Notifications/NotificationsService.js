const { Notification } = require('./NotificationsModel');

exports.AddNotification =async(data)=>{
    try {
        let addedNotification = await Notification.create(data)
        return addedNotification
    } catch (error) {
        throw error
    }
}

exports.GetAllNotifications =async(query,page,itemPerPage)=>{
    try {
        let notifications = await Notification.find(query).populate(['user_id','provider_id']).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
        return notifications
    } catch (error) {
        throw error
    }
}

exports.GetNotificationCount =async(query)=>{
    try {
        let notifications = await Notification.find(query).count()
        return notifications
    } catch (error) {
        throw error
    }
}