const jwt = require('jsonwebtoken');
const { ResponseSchema, PaginateSchema } = require('../../helper/HelperFunctions');
const { ErrorHandler } = require('../../helper/ErrorHandler');
const { GetAllNotifications, GetNotificationCount } = require('./NotificationsService');
const moment = require('moment/moment');

exports.getAllNotifications = async (req, res) => {
  const token = req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);
  let query={}
  let type =''
  if(authedUser?.user_type=='provider'){
    query={provider_id:authedUser?.user_id}
    type='provider_id'
  }else if(authedUser?.user_type=='user'){
    query={provider_id:authedUser?.user_id}
    type='user_id'
  }else{
      return res.status(401).json(ResponseSchema('Unauthorized', false));
  }
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetNotificationCount(query);
  const pages = Math.ceil(count / itemPerPage);
  try {
    let notifications = await GetAllNotifications(query,page,itemPerPage)
    const sendedObject = notifications.map((notification) => ({
      id: notification._id,
      title:notification?.translation?.[`${notification?.[`${type}`]?.current_language}`]?.title,
      body:notification?.translation?.[`${notification?.[`${type}`]?.current_language}`]?.body,
      created_at:moment(notification?.created_at).locale(notification?.user_id?.current_language?notification?.user_id?.current_language:'en').format('MMMM Do YYYY, h:mm:ss a'),
    }));

    return res.status(200).json(ResponseSchema('Notifications', true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};
