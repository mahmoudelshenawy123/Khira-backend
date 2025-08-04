const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const {
  ResponseSchema,
  MergeImageLink,
  PaginateSchema,
} = require('../../helper/HelperFunctions')
const { User } = require('./UsersModel')
const {
  ErrorHandler,
  CheckValidIdObject,
} = require('../../helper/ErrorHandler')
const {
  GetUserByQuery,
  UpdateUser,
  AddUser,
  GetUserById,
  GetAllUsersPaginated,
  DeleteUser,
  GetUsersCount,
  GetUserByIdProductsPopulated,
  UpdateUserByQuery,
} = require('./UsersService')
const {
  UpdateManyCartItems,
  GetCartItemById,
  UpdateManyCartItemsNoSession,
} = require('../Cart/CartService')
const NodeGeocoder = require('node-geocoder')
const distance = require('google-distance-matrix')
const bcrypt = require('bcrypt')
const { SendMails } = require('../../helper/SendMail')
const { v4: uuidv4 } = require('uuid')

const options = {
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null,
  language: 'en',
}
distance.key(process.env.GOOGLE_API_KEY)
const RESET_PASSWORD_HTML = (Username, resetPasswordKey) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .bg{
            background-color:#F7F7F7;
            padding:50px;
            width:100%;
            height:100%;
        }
        .wrapper{
            width: 60%;
            margin: auto;
            text-align: left;
        }
        header{
            padding: 40px;
            background-color:black;
        }
        .header-title{
            font-size: 35px;
            color: white;
            margin: 0;
        }
        section{
            padding: 25px;
            font-size: 17px;
            text-align: left;
            direction: ltr;
            background-color:white;
        }
    </style>
</head>
<body>
<div class='bg'>
    <div class="wrapper">
        <header>
            <h1 class="header-title">Password Reset Request</h1>
        </header>
        <section>
            <p>
                Hi ${Username},
            </p>
            <p>
                Someone has requested a new password for the following account on RD-Aroma:
            </p>
            <p>
                Username: ${Username},
            </p>
            <p>
                If you didn't make this request, just ignore this email. If you'd like to proceed:
            </p>
            <a href="https://rd-aroma.com/reset-password?key=${resetPasswordKey}">
                Click here to reset your password
            </a>
            <p>
                Thanks for reading.
            </p>
        </section>
    </div>
</div>


</body>
</html>
`

const CREATE_EMAIL_HTML = (Username, resetPasswordKey) => `
<!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          .bg{
              background-color:#F7F7F7;
              padding:50px;
              width:100%;
              height:100%;
          }
          .wrapper{
              width: 60%;
              margin: auto;
              text-align: left;
          }
          header{
              padding: 40px;
              background-color:black;
          }
          .header-title{
              font-size: 35px;
              color: white;
              margin: 0;
          }
          section{
              padding: 25px;
              font-size: 17px;
              text-align: left;
              direction: ltr;
              background-color:white;
          }
      </style>
  </head>
  <body>
    <div class='bg'>
        <div class="wrapper">
            <header>
                <h1 class="header-title">Password Reset Request</h1>
            </header>
            <section>
                <p>
                    Hi ${Username},
                </p>
                <p>
                  Thanks for creating an account on RD-Aroma. Your username is ${Username}. You can access your account area to view orders, change your password, and more at:
                </p>
                <a href="https://rd-aroma.com/my-account">
                  https://rd-aroma.com/my-account
                </a>
                <p>
                    If you didn't make this request, just ignore this email. If you'd like to proceed:
                </p>
                <a href="https://rd-aroma.com/reset-password?key=${resetPasswordKey}">
                  Click here to set your new password.
                </a>
                <p>
                  We look forward to seeing you soon.
                </p>
            </section>
        </div>
    </div>
  </body>
</html>
`

exports.createUser = async (req, res) => {
  const { email } = req.body
  const user = await GetUserByQuery({ email: email })
  if (user) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Email Already Exists'), false))
  }
  try {
    let resetPasswordKey = uuidv4()
    let addedData = {
      email: email,
      display_name: email?.split('@')?.[0],
      reset_password_key: resetPasswordKey,
    }
    const createdUser = await AddUser(addedData)
    const token = jwt.sign(
      {
        user_id: createdUser?._id,
        email: createdUser?.email,
        user: createdUser,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    )

    SendMails(
      createdUser?.email,
      'Your RD-Aroma Account Has Been Created',
      CREATE_EMAIL_HTML(createdUser?.display_name, resetPasswordKey)
    )
    return res
      .status(201)
      .json(ResponseSchema('User Created Successfully', true, token))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.forgetPassword = async (req, res) => {
  const { email } = req.body
  try {
    let resetPasswordKey = uuidv4()
    let addedData = {
      reset_password_key: resetPasswordKey,
    }
    const updatedUser = await UpdateUserByQuery({ email: email }, addedData)

    if (!updatedUser) {
      return res.status(400).json(ResponseSchema('Invalid Email.', false))
    }
    SendMails(
      email,
      'Password Reset Request RD-Aroma',
      RESET_PASSWORD_HTML(updatedUser?.display_name, resetPasswordKey)
    )
    return res
      .status(201)
      .json(ResponseSchema('Reset Key Sent To Your Mail', true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.resetPassword = async (req, res) => {
  const { password, confirm_password, reset_password_key } = req.body
  try {
    if (password != confirm_password) {
      return res
        .status(400)
        .json(ResponseSchema("Confirm Passwrod Doesn't Equal Password", false))
    }
    if (!reset_password_key) {
      return res
        .status(400)
        .json(ResponseSchema('Reset Password Key Is Required', false))
    }
    let addedData = {
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      reset_password_key: null,
    }
    const updatedUser = await UpdateUserByQuery(
      { reset_password_key: reset_password_key },
      addedData
    )

    if (!updatedUser) {
      return res
        .status(400)
        .json(
          ResponseSchema(
            'This key is invalid or has already been used. Please reset your password again if needed.',
            false
          )
        )
    }
    const token = jwt.sign(
      {
        user_id: updatedUser?._id,
        email: updatedUser?.email,
        user: updatedUser,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    )
    // SendMails(email,'Password Reset Requet RD-Aroma',RESET_PASSWORD_HTML(updatedUser?.display_name,resetPasswordKey))
    return res
      .status(201)
      .json(ResponseSchema('Password Changed Successfully', true, token))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.loginUser = async (req, res) => {
  const { email, password, unique_identifier } = req.body

  const user = await GetUserByQuery({ email: email })
  if (!user) {
    return res
      .status(400)
      .json(ResponseSchema(req.t("Email Doesn't exist"), false))
  }
  if (user?.status == 3) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('User is not active. Please contact admins'),
          false
        )
      )
  }
  if (user?.password) {
    if (bcrypt.compareSync(password, user?.password)) {
      const token = jwt.sign(
        {
          user_id: user?._id,
          email: user?.email,
          user: user,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2d' }
      )
      const sendedObject = {
        id: user._id,
        name: user?.name,
        email: user?.email,
        phone_number: user?.phone_number,
        display_name: user?.display_name,
        personal_photo: user?.personal_photo
          ? MergeImageLink(req, user?.personal_photo)
          : '',
        status: user?.status,
        billing_address: {
          name: user?.billing_address?.name,
          city: user?.billing_address?.city,
          street_address: user?.billing_address?.street_address,
          phone: user?.billing_address?.phone,
          email: user?.billing_address?.email,
        },
        shipping_address: {
          name: user?.shipping_address?.name,
          city: user?.shipping_address?.city,
          street_address: user?.shipping_address?.street_address,
          state: user?.shipping_address?.state,
        },
      }
      const cartItems = await UpdateManyCartItemsNoSession(
        { unique_identifier: unique_identifier },
        { user_id: user?._id }
      )
      return res
        .status(201)
        .json(
          ResponseSchema('Login Successfully', true, {
            token: token,
            user: sendedObject,
          })
        )
    } else {
      return res
        .status(400)
        .json(
          ResponseSchema(req.t('The password you entered is incorrect.'), false)
        )
    }
  } else {
    return res
      .status(400)
      .json(
        ResponseSchema(req.t('The password you entered is incorrect.'), false)
      )
  }
}

exports.updateUserBillingAddress = async (req, res) => {
  const {
    billing_address_name,
    billing_address_city,
    billing_address_street_address,
    billing_address_phone,
    billing_address_email,
  } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  try {
    let updatedData = {
      billing_address: {
        name: billing_address_name,
        city: billing_address_city,
        street_address: billing_address_street_address,
        phone: billing_address_phone,
        email: billing_address_email,
      },
    }
    let x = await UpdateUser(authedUser?.user_id, updatedData)

    return res
      .status(201)
      .json(ResponseSchema(req.t('User Updated Successfully'), true, x))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.updateUserShippingAddress = async (req, res) => {
  const {
    shipping_address_name,
    shipping_address_city,
    shipping_address_street_address,
    shipping_address_state,
  } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  try {
    let updatedData = {
      shipping_address: {
        name: shipping_address_name,
        city: shipping_address_city,
        street_address: shipping_address_street_address,
        state: shipping_address_state,
      },
    }
    let x = await UpdateUser(authedUser?.user_id, updatedData)

    return res
      .status(201)
      .json(ResponseSchema(req.t('User Updated Successfully'), true, x))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.updateUserPersonalImage = async (req, res) => {
  const { personal_photo } = req.files
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  try {
    let updatedData = {
      personal_photo: personal_photo ? personal_photo?.[0]?.filename : '',
    }
    await UpdateUser(authedUser?.user_id, updatedData)

    return res
      .status(201)
      .json(ResponseSchema(req.t('User Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.updateUser = async (req, res) => {
  const {
    name,
    display_name,
    email,
    old_password,
    phone,
    new_password,
    cofirm_password,
  } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'User Id is Invalid'))
    return
  let user = await GetUserById(authedUser?.user_id)
  if (!user) {
    return res.status(400).json(ResponseSchema('User Id is wrong', false))
  }
  if (user?.email != email) {
    const userEmail = await GetUserByQuery({ email: email })
    if (userEmail) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('Email Already Exists'), false))
    }
  }

  try {
    let updatedData = {
      name,
      display_name,
      email,
      phone_number: phone,
    }
    if (!user?.password && new_password) {
      if (new_password != cofirm_password) {
        return res
          .status(400)
          .json(ResponseSchema(req.t("Password Doesn't Match"), false))
      }
      updatedData = {
        ...updatedData,
        password: bcrypt.hashSync(new_password, bcrypt.genSaltSync()),
      }
    }
    if (old_password && user?.password) {
      if (bcrypt.compareSync(old_password, user?.password) && new_password) {
        if (new_password != cofirm_password) {
          return res
            .status(400)
            .json(ResponseSchema(req.t("Password Doesn't Match"), false))
        }
        updatedData = {
          ...updatedData,
          password: bcrypt.hashSync(new_password, bcrypt.genSaltSync()),
        }
      } else {
        return res
          .status(400)
          .json(ResponseSchema(req.t('Old Password Is Wrong'), false))
      }
    }
    await UpdateUser(authedUser?.user_id, updatedData)
    return res
      .status(201)
      .json(ResponseSchema(req.t('User Updated Successfully'), true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.verifyUser = async (req, res) => {
  const { user_id, code } = req.body

  if (!CheckValidIdObject(req, res, user_id, 'User Id is Invalid')) return
  const userQuery = {
    _id: user_id,
    'verififed_code.code': Number(code) ? Number(code) : 0,
  }
  const user = await GetUserByQuery(userQuery)

  if (!user) {
    return res.status(400).json(ResponseSchema('Code Is Wrong', false))
  }
  if (user?.status == 3) {
    return res
      .status(400)
      .json(ResponseSchema('User is not active. Please contact admins', false))
  }

  const token = jwt.sign(
    {
      phone_number: user?.phone_number,
      user_id: user?._id,
      user_type: 'user',
    },
    process.env.JWT_SECRET,
    { expiresIn: '2d' }
  )

  try {
    let updatedData = {
      api_token: token,
      verified: true,
    }
    await UpdateUser(user_id, updatedData)
    return res
      .status(201)
      .json(ResponseSchema('User Verified Successfully', true, { token }))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.cahengeActiveStatusUser = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, 'User Id is Invalid')) return

  const user = await GetUserById(id)

  if (!user) {
    return res.status(400).json(ResponseSchema('User Id is wrong', false))
  }
  try {
    let updatedData = { status: user?.status == 2 ? 3 : 2 }
    await UpdateUser(id, updatedData)
    return res
      .status(201)
      .json(ResponseSchema('User Status Changed Successfully.', true))
  } catch (error) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.getAllUsers = async (req, res) => {
  const { query } = req

  let queryParams = {}
  if (query?.name) {
    queryParams = { ...queryParams, name: new RegExp(query?.name, 'i') }
  }
  const page = req.query.page - 1 || 0
  const itemPerPage = req.query.limit || 10
  const count = await GetUsersCount(queryParams)
  const pages = Math.ceil(count / itemPerPage)

  try {
    let users = await GetAllUsersPaginated(queryParams, page, itemPerPage)
    const sendedObject = users.map((user) => ({
      id: user._id,
      name: user?.name,
      email: user?.email,
      display_name: user?.display_name,
      status: user?.status,
    }))
    return res
      .status(200)
      .json(
        ResponseSchema(
          'Users',
          true,
          PaginateSchema(page + 1, pages, count, sendedObject)
        )
      )
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.getUser = async (req, res) => {
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'User Id is Invalid'))
    return

  try {
    const user = await GetUserById(authedUser?.user_id)

    if (!user) {
      return res.status(400).json(ResponseSchema('User Id is wrong', false))
    }

    const sendedObject = {
      id: user._id,
      name: user?.name,
      email: user?.email,
      phone_number: user?.phone_number,
      display_name: user?.display_name,
      personal_photo: user?.personal_photo
        ? MergeImageLink(req, user?.personal_photo)
        : '',
      status: user?.status,
      billing_address: {
        name: user?.billing_address?.name,
        city: user?.billing_address?.city,
        street_address: user?.billing_address?.street_address,
        phone: user?.billing_address?.phone,
        email: user?.billing_address?.email,
      },
      shipping_address: {
        name: user?.shipping_address?.name,
        city: user?.shipping_address?.city,
        street_address: user?.shipping_address?.street_address,
        state: user?.shipping_address?.state,
      },
    }
    return res.status(200).json(ResponseSchema('User', true, sendedObject))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.logOutOrDelete = async (req, res) => {
  const { destroy } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'User Id is Invalid'))
    return

  const user = await GetUserById(authedUser?.user_id)

  if (!user) {
    return res.status(400).json(ResponseSchema('User Id is wrong', false))
  }

  if (destroy == 2) {
    try {
      await DeleteUser(authedUser?.user_id)
      return res
        .status(201)
        .json(ResponseSchema('User Deleted Successfully.', true))
    } catch (error) {
      return res
        .status(400)
        .json(
          ResponseSchema(
            req.t('Somethings Went wrong'),
            false,
            ErrorHandler(error)
          )
        )
    }
  } else {
    try {
      await UpdateUser(authedUser?.user_id, { api_token: '' })
      return res
        .status(201)
        .json(ResponseSchema('User Loggedout Successfully.', true))
    } catch (error) {
      return res
        .status(400)
        .json(
          ResponseSchema(
            req.t('Somethings Went wrong'),
            false,
            ErrorHandler(error)
          )
        )
    }
  }
}

exports.deleteUser = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, req.t('User Id is Invalid'))) return
  const user = await GetUserById(id)
  if (!user) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('User Id is wrong'), false))
  }

  try {
    await DeleteUser(id)
    return res
      .status(201)
      .json(ResponseSchema('User Deleted Successfully.', true))
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}

exports.addRemoverProductsInFavorite = async (req, res) => {
  const { favorited_product } = req.body

  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'User Id is Invalid'))
    return
  if (!CheckValidIdObject(req, res, favorited_product, 'Product Id is Invalid'))
    return
  const user = await User.findById(authedUser?.user_id)
  let itemExistInUserFavoriteds = false

  if (user?.favorited_products.includes(favorited_product)) {
    itemExistInUserFavoriteds = true
  }
  // if(!user){
  //     return res.status(400).json(ResponseSchema('User Id is wrong',false))
  // }
  // if(!user?.verified){
  //     return res.status(400).json(ResponseSchema('User is not Verified yet. please verify user number first',false))
  // }
  // if(user?.status==3){
  //     return res.status(400).json(ResponseSchema('User is not active. Please contact admins',false))
  // }

  if (itemExistInUserFavoriteds) {
    try {
      let updatedData = {
        $pull: {
          favorited_products: favorited_product,
        },
      }
      await UpdateUser(authedUser?.user_id, updatedData)
      return res
        .status(201)
        .json(
          ResponseSchema('Product Removed From Favorites Successfully', true)
        )
    } catch (error) {
      return res
        .status(400)
        .json(
          ResponseSchema(
            req.t('Somethings Went wrong'),
            false,
            ErrorHandler(error)
          )
        )
    }
  } else {
    try {
      let updatedData = {
        $addToSet: {
          favorited_products: favorited_product,
        },
      }
      await UpdateUser(authedUser?.user_id, updatedData)
      return res
        .status(201)
        .json(ResponseSchema('Product Added To Favorites Successfully', true))
    } catch (error) {
      return res
        .status(400)
        .json(
          ResponseSchema(
            req.t('Somethings Went wrong'),
            false,
            ErrorHandler(error)
          )
        )
    }
  }
}

exports.getAllUserFavoritedProducts = async (req, res) => {
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'
  const token = req?.headers?.authorization?.split(' ')[1]
  const authedUser = jwt.decode(token)
  if (
    !CheckValidIdObject(
      req,
      res,
      authedUser?.user_id,
      req.t('User Id is Invalid')
    )
  )
    return
  const user = await GetUserByIdProductsPopulated(authedUser?.user_id)
  if (!user) {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("You Don't Have Permission To Show Favorited Products"),
          false
        )
      )
  }
  const page = req.query.page - 1 || 0
  const itemPerPage = req.query.limit || 10
  const count = user?.favorited_products?.length
  const pages = Math.ceil(count / itemPerPage)

  try {
    const sendedObject = await Promise.all(
      user?.favorited_products.map((product) => {
        return ProductModal(product, {}, lang, req)
      })
    )
    return res
      .status(200)
      .json(
        ResponseSchema(
          'Users',
          true,
          PaginateSchema(page + 1, pages, count, sendedObject)
        )
      )
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t('Somethings Went wrong'),
          false,
          ErrorHandler(error)
        )
      )
  }
}
