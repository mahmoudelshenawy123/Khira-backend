const jwt = require('jsonwebtoken');
const { GetAdminUserById } = require('../componets/AdminUsers/AdminUsersService');
// const { GetProviderById } = require('../componets/Providers/ProviderService');
const { GetUserById } = require('../componets/Users/UsersService');
const { ResponseSchema } = require('../helper/HelperFunctions');

exports.checkisUserAdmin = async (req, res, next) => {
    const nonSecurePaths = ['/login'];
    const token = req?.headers?.authorization?.split(' ')?.[1] ;
    const authedUser = jwt.decode(token);
    if (nonSecurePaths.includes(req.path)) return next();
    if(authedUser?.user_type=='admin'){
        next()
    }else{
        return res.status(401).json(ResponseSchema('Unauthorized', false));
    }
};

exports.checkisUserActive = async (req, res, next) => {
    const token = req?.headers?.authorization?.split(' ')?.[1] ;
    const authedUser = jwt.decode(token);
    if(authedUser?.user_type=='admin'){
        let admin = await GetAdminUserById(authedUser?.user_id)
        console.log(admin)
        if(admin?.status ==1){
            next()
            return
        }
    }else if(authedUser?.user_type=='user'){
        let user = await GetUserById(authedUser?.user_id)
        if(user?.status ==1){
            next()
            return
        }
    }
    // else if(authedUser?.user_type=='provider'){
    //     let provider = await GetProviderById(authedUser?.user_id)
    //     if(provider?.status ==1){
    //         next()
    //         return
    //     }
    // }
    return res.status(401).json(ResponseSchema('User Is Not Active. Please Contact Admin To Activate it', false))
};