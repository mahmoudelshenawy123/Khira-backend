const jwt = require('jsonwebtoken')
const moment = require('moment/moment')
const {
  ResponseSchema,
  MergeImageLink,
  MergePDfLink,
  PaginateSchema,
} = require('../../helper/HelperFunctions')
const {
  ErrorHandler,
  CheckValidIdObject,
} = require('../../helper/ErrorHandler')
const { GetUserByQuery, GetUserById } = require('../Users/UsersService')
const {
  AddOrder,
  GetOrderCount,
  GetOrdersByQueryPaginated,
  GetOrderByQuery,
  AddSpecialOrder,
  GetSpecialOrderById,
  UpdateSpecialOrder,
  UpdateSpecialOrderSession,
  AddOrderSession,
  GetSpecialOrderByIdPopulated,
  GetAllSpecialRequestOrders,
  GetOrdersByQuery,
  GetAllOrdersPaginated,
  UpdateOrder,
  GetAllOrdersPaginatedFiltered,
  GetAllOrdersCountFiltered,
  DeleteOrder,
  GetOrderById,
} = require('./OrdersService')
const {
  GetProductById,
  GetProductBySlug,
  UpdateProductSizeQuantity,
  UpdateProductQuantity,
} = require('../Products/ProductsService')
const { GetProviderById } = require('../Providers/ProviderService')
const { default: mongoose } = require('mongoose')
const { AddNotification } = require('../Notifications/NotificationsService')
const { SendMails } = require('../../helper/SendMail')
const phantomPath = require('phantomjs-prebuilt').path
const {
  GetGeneralSettings,
} = require('../GeneralSettings/GeneralSettingsService')
const { DeleteCartItems } = require('../Cart/CartService')
const pdf = require('html-pdf')
const OrderPdf = require('../../Documents/OrderPDF')
// const pdfTemplate = require('./documents');

// const puppeteer = require('puppeteer')

// async function generatePdf(html, filePath) {
//   const browser = await puppeteer.launch({
//     args: ['--no-sandbox', '--disable-setuid-sandbox'], // important for GCP/PM2
//   })
//   const page = await browser.newPage()
//   await page.setContent(html, { waitUntil: 'networkidle0' })
//   await page.pdf({ path: filePath, format: 'A4', printBackground: true })
//   await browser.close()
// }

const CREATE_EMAIL_HTML = (pdfLink, userName, orderNumber) => `
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
                <h1 class="header-title">Order #${orderNumber} Created Successfully</h1>
            </header>
            <section>
                <p>
                    Hi ,${userName}
                </p>
                <p>
                  Thanks for creating an Order on Khira-Store.We Will Review It And Contact You
                </p>
                <a href='${pdfLink}'>
                  Click here to see your Invoice.
                </a>
                <p>
                    If you didn't make this request, just ignore this email. If you'd like to proceed:
                </p>
              
                <p>
                  We look forward to seeing you soon.
                </p>
            </section>
        </div>
    </div>
  </body>
</html>
`

exports.createOrder = async (req, res) => {
  const {
    products,
    billing_address_name,
    billing_address_city,
    billing_address_street_address,
    billing_address_phone,
    billing_address_email,
    shipping_address_name,
    shipping_address_city,
    shipping_address_street_address,
    payment_method,
    shipping_address_state,
    unique_identifier,
    is_gift,
  } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  const user = await GetUserByQuery({ _id: authedUser?.user_id })
  const generalSetting = await GetGeneralSettings()
  let addedProducts = []

  let subTotalPrice = 0
  let totalPrice = 0
  await Promise.all(
    products?.map(
      async (product) =>
        new Promise(async (resolve, reject) => {
          const productItem = await GetProductBySlug(product?.product_slug)
          if (!productItem) {
            throw Error("Product doesn't exist")
          }
          let price = 0
          let size = {}
          if (product?.selected_size_id != 'undefined') {
            // console.log('Melinda Barry', productItem.sizes)
            size = productItem?.sizes?.filter((size) => {
              return size?._id == product?.selected_size_id
            })
            price = size?.[0]?.price
          } else {
            price = productItem?.price
          }
          addedProducts.push({
            product_id: productItem?._id,
            product_title: productItem?.translation?.[`en`]?.title,
            quantity: product?.quantity,
            selected_size_id: size?.[0]?._id,
            buying_price: price,

            is_gift: product?.is_gift,
            send_receipt: product?.send_receipt,
            send_greeting_card: product?.send_greeting_card,
            send_greeting_card_message: product?.send_greeting_card_message,

            is_gift_value: generalSetting?.wrap_as_gift_value,
          })
          if (is_gift) {
            subTotalPrice += generalSetting?.wrap_as_gift_value
          }
          subTotalPrice += price
          resolve(addedProducts)
        })
    )
  )
  totalPrice = subTotalPrice + generalSetting?.shipping_chargers
  try {
    let addedData = {
      user_id: authedUser?.user_id,
      products: addedProducts,
      payment_method: payment_method,

      shipping_charges: generalSetting?.shipping_chargers,
      total_price: totalPrice,
      sub_total_price: subTotalPrice,

      billing_address: {
        name: billing_address_name,
        city: billing_address_city,
        street_address: billing_address_street_address,
        phone: billing_address_phone,
        email: billing_address_email,
      },

      shipping_address: {
        name: shipping_address_name,
        city: shipping_address_city,
        street_address: shipping_address_street_address,
        state: shipping_address_state,
      },
      status: 1,
    }
    let addedOrder = await AddOrder(addedData)
    await Promise.all(
      addedProducts.map(async (p) => {
        if (p?.selected_size_id) {
          await UpdateProductSizeQuantity(
            p.product_id,
            p.selected_size_id,
            Number(p.quantity)
          )
        } else {
          await UpdateProductQuantity(p.product_id, Number(p.quantity))
        }
      })
    )
    if (authedUser?.user_id) {
      await DeleteCartItems({ user_id: authedUser?.user_id })
    }
    await DeleteCartItems({ unique_identifier: unique_identifier })
    try {
      // let addedInfo = {
      //   totalPrice: addedOrder?.total_price,
      //   orderNumber: addedOrder?.item_number,
      //   billingAddress: addedOrder?.billing_address,
      //   products: addedProducts,
      //   subTotal: addedOrder?.sub_total_price,
      //   shippingAddress: addedOrder?.shipping_address,
      //   created_at: moment(addedOrder?.created_at).format(
      //     'MMMM Do YYYY, h:mm:ss a'
      //   ),
      // }
      // await generatePdf(
      //   OrderPdf(addedInfo),
      //   `./public/files/Order.No-${addedOrder?.item_number}-invoice.pdf`
      // )

      await new Promise((resolve, reject) => {
        let addedInfo = {
          totalPrice: addedOrder?.total_price,
          orderNumber: addedOrder?.item_number,
          billingAddress: addedOrder?.billing_address,
          products: addedProducts,
          subTotal: addedOrder?.sub_total_price,
          shippingAddress: addedOrder?.shipping_address,
          created_at: moment(addedOrder?.created_at).format(
            'MMMM Do YYYY, h:mm:ss a'
          ),
        }
        pdf
          .create(OrderPdf(addedInfo), { phantomPath })
          .toFile(
            `./public/files/Order.No-${addedOrder?.item_number}-invoice.pdf`,
            (err) => {
              if (err) console.error(err)
              resolve()
            }
          )
        // pdf
        //   .create(OrderPdf(addedInfo), {})
        //   .toFile(
        //     `./public/files/Order.No-${addedOrder?.item_number}-invoice.pdf`,
        //     (err) => {
        //       if (err) {
        //         console.log(err)
        //       }
        //       resolve()
        //     }
        //   )

        if (billing_address_email) {
          SendMails(
            billing_address_email,
            `Order #${addedOrder?.item_number} Created Successfully`,
            CREATE_EMAIL_HTML(
              MergePDfLink(
                req,
                `Order.No-${addedOrder?.item_number}-invoice.pdf`
              ),
              addedOrder?.billing_address?.name,
              addedOrder?.item_number
            )
          )
        }
        if (generalSetting?.project_email_address) {
          SendMails(
            generalSetting?.project_email_address,
            `Order #${addedOrder?.item_number} Created Successfully`,
            CREATE_EMAIL_HTML(
              MergePDfLink(
                req,
                `Order.No-${addedOrder?.item_number}-invoice.pdf`
              ),
              'Admin',
              addedOrder?.item_number
            )
          )
        }
      })
      if (billing_address_email) {
        SendMails(
          billing_address_email,
          `Order #${addedOrder?.item_number} Created Successfully`,
          CREATE_EMAIL_HTML(
            MergePDfLink(
              req,
              `Order.No-${addedOrder?.item_number}-invoice.pdf`
            ),
            addedOrder?.billing_address?.name,
            addedOrder?.item_number
          )
        )
      }
      if (generalSetting?.project_email_address) {
        SendMails(
          generalSetting?.project_email_address,
          `Order #${addedOrder?.item_number} Created Successfully`,
          CREATE_EMAIL_HTML(
            MergePDfLink(
              req,
              `Order.No-${addedOrder?.item_number}-invoice.pdf`
            ),
            'Admin',
            addedOrder?.item_number
          )
        )
      }
      //   await new Promise((resolve, reject) => {
      //     // let addedInfo = {
      //     //   totalPrice: addedOrder?.total_price,
      //     //   orderNumber: addedOrder?.item_number,
      //     //   billingAddress: addedOrder?.billing_address,
      //     //   products: addedProducts,
      //     //   subTotal: addedOrder?.sub_total_price,
      //     //   shippingAddress: addedOrder?.shipping_address,
      //     //   created_at: moment(addedOrder?.created_at).format(
      //     //     'MMMM Do YYYY, h:mm:ss a'
      //     //   ),
      //     // }
      //     // pdf
      //     //   .create(OrderPdf(addedInfo), { phantomPath })
      //     //   .toFile(
      //     //     `./public/files/Order.No-${addedOrder?.item_number}-invoice.pdf`,
      //     //     (err) => {
      //     //       if (err) console.error(err)
      //     //       resolve()
      //     //     }
      //     //   )
      //     // pdf
      //     //   .create(OrderPdf(addedInfo), {})
      //     //   .toFile(
      //     //     `./public/files/Order.No-${addedOrder?.item_number}-invoice.pdf`,
      //     //     (err) => {
      //     //       if (err) {
      //     //         console.log(err)
      //     //       }
      //     //       resolve()
      //     //     }
      //     //   )

      //     if (billing_address_email) {
      //       SendMails(
      //         billing_address_email,
      //         `Order #${addedOrder?.item_number} Created Successfully`,
      //         CREATE_EMAIL_HTML(
      //           MergePDfLink(
      //             req,
      //             `Order.No-${addedOrder?.item_number}-invoice.pdf`
      //           ),
      //           addedOrder?.billing_address?.name,
      //           addedOrder?.item_number
      //         )
      //       )
      //     }
      //     if (generalSetting?.project_email_address) {
      //       SendMails(
      //         generalSetting?.project_email_address,
      //         `Order #${addedOrder?.item_number} Created Successfully`,
      //         CREATE_EMAIL_HTML(
      //           MergePDfLink(
      //             req,
      //             `Order.No-${addedOrder?.item_number}-invoice.pdf`
      //           ),
      //           'Admin',
      //           addedOrder?.item_number
      //         )
      //       )
      //     }
      //   })
    } catch (error) {
      console.log(error)
    }

    return res
      .status(200)
      .json(ResponseSchema(req.t('Order Added Successfully'), true, addedOrder))
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

exports.getAllUsersOrders = async (req, res) => {
  const { query } = req

  const page = query.page - 1 || 0
  const itemPerPage = query.limit || 10
  const count = await GetOrderCount()
  const pages = Math.ceil(count / itemPerPage)
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  try {
    let orders = await GetOrdersByQuery({ user_id: authedUser?.user_id })
    const sendedObject = orders.map((order) => ({
      id: order?._id,
      // user_name:order?.user_id?.name,
      item_number: order?.item_number,
      status: order?.status,
      payment_method: order?.payment_method,
      total_price: order?.total_price,
      invoice_file:
        order?.item_number &&
        MergePDfLink(req, `Order.No-${order?.item_number}-invoice.pdf`),
      created_at: moment(order?.created_at).format('MMMM Do YYYY, h:mm:ss a'),
    }))
    return res
      .status(200)
      .json(ResponseSchema(req.t('Orders'), true, sendedObject))
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

exports.getAllOrders = async (req, res) => {
  const { query } = req

  let queryParams = {}
  if (query?.phone) {
    queryParams = { ...queryParams, ['billing_address.phone']: query?.phone }

    // searchedQuery = {...queryParams,'billing_address.phone':new RegExp(query?.phone , 'i')}
  }
  if (query?.order_number) {
    queryParams = { ...queryParams, item_number: query?.order_number }
  }

  const page = query.page - 1 || 0
  const itemPerPage = query.limit || 10
  const count = await GetAllOrdersCountFiltered(queryParams)
  const pages = Math.ceil(count / itemPerPage)

  try {
    let orders = await GetAllOrdersPaginatedFiltered(
      queryParams,
      page,
      itemPerPage
    )
    const sendedObject = orders.map((order) => ({
      id: order?._id,
      item_number: order?.item_number,
      status: order?.status,
      total_price: order?.total_price,
      billing_address: order?.billing_address,
      payment_method: order?.payment_method,
      invoice_file:
        order?.item_number &&
        MergePDfLink(req, `Order.No-${order?.item_number}-invoice.pdf`),
      created_at: moment(order?.created_at).format('MMMM Do YYYY, h:mm:ss a'),
    }))
    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('Orders'),
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

exports.getAllOrdersWithStatus = async (req, res) => {
  const { query } = req

  const page = query.page - 1 || 0
  const itemPerPage = query.limit || 10
  const count = await GetOrderCount()
  const pages = Math.ceil(count / itemPerPage)
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  let filter = {}

  if (authedUser?.user_type == 'user') {
    if (
      !CheckValidIdObject(
        req,
        res,
        authedUser?.user_id,
        req.t('User Id is Invalid')
      )
    )
      return
    const user = await GetUserById(authedUser?.user_id)
    if (!user) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('User Id is wrong'), false))
    }
    filter = {
      ...filter,
      user_id: authedUser?.user_id,
    }
  } else if (authedUser?.user_type == 'provider') {
    if (
      !CheckValidIdObject(
        req,
        res,
        authedUser?.user_id,
        req.t('User Id is Invalid')
      )
    )
      return
    const provider = await GetProviderById(authedUser?.user_id)
    if (!provider) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('User Id is wrong'), false))
    }
    filter = {
      provider_id: authedUser?.user_id,
    }
  } else {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Token Is Required'), false))
  }

  if (query?.status) {
    filter = {
      ...filter,
      status: query?.status,
    }
  }

  try {
    let orders = await GetOrdersByQueryPaginated(query, page, itemPerPage)
    const sendedObject = orders.map((order) => ({
      id: order?._id,
      status: order?.status,
      item_number: order?.item_number,
      order_type: order?.order_type,
      invoice_file:
        order?.item_number &&
        MergePDfLink(req, `Order.No-${order?.item_number}-invoice.pdf`),
      created_at: moment(order?.created_at)
        .locale(
          (authedUser?.user_type == 'user'
            ? order?.user_id?.current_language
            : order?.provider_id?.current_language) || 'en'
        )
        .format('MMMM Do YYYY, h:mm:ss a'),
    }))
    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('Orders'),
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

exports.getOrder = async (req, res) => {
  const { id } = req.params
  const lang = req.headers['accept-language']
    ? req.headers['accept-language']
    : 'en'
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  try {
    let order = await GetOrderByQuery({ _id: id })
    let sendedObject
    if (order) {
      const subTotlaPrice = order?.products.reduce((total, value) => {
        let price = value?.buying_price
        if (value?.is_gift) {
          price += value?.is_gift_value
        }
        return total + price
      }, 0)
      let totalPrice = subTotlaPrice + order?.shipping_charges
      const products = order?.products?.map((product) => {
        let size = product?.product_id?.sizes?.filter((sizess) => {
          return sizess?.id == product?.selected_size_id
        })
        return {
          id: product?.product_id?._id,
          title: product?.product_id?.translation[`${lang}`]?.title,
          title_en: product?.product_id?.translation[`en`]?.title,
          title_ar: product?.product_id?.translation[`ar`]?.title,
          image: MergeImageLink(req, product?.product_id?.images[0]),
          selected_size: size?.[0],
          price: product?.buying_price,
          ordered_quantity: product?.quantity,
          is_gift: product?.is_gift,
          is_gift_value: product?.is_gift_value,
          send_receipt: product?.send_receipt,
          send_greeting_card: product?.send_greeting_card,
          send_greeting_card_message: product?.send_greeting_card_message,
        }
      })
      sendedObject = {
        id: order?._id,
        item_number: order?.item_number,
        status: order?.status,
        products,
        invoice_file:
          order?.item_number &&
          MergePDfLink(req, `Order.No-${order?.item_number}-invoice.pdf`),
        shipping_chargers: order?.shipping_charges,
        payment_method: order?.payment_method,
        shipping_address: order?.shipping_address,
        billing_address: order?.billing_address,
        sub_total_price: subTotlaPrice,
        total_price: totalPrice,
        created_at: moment(order?.created_at).format('MMMM Do YYYY, h:mm:ss a'),
      }
    }
    return res
      .status(200)
      .json(ResponseSchema(req.t('Order'), true, sendedObject))
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

exports.changeOrderStatus = async (req, res) => {
  const { status, order_id } = req.body
  if (!CheckValidIdObject(req, res, order_id, req.t('Product Id is Invalid')))
    return

  let order = await GetOrderByQuery({ _id: order_id })
  if (!order) {
    return res
      .status(400)
      .json(ResponseSchema(req.t("Order Doesn't Exist"), false))
  }
  try {
    let addedData = {
      status: status,
    }
    await UpdateOrder(order_id, addedData)
    return res
      .status(200)
      .json(ResponseSchema(req.t('Order Status Updated Successfully'), true))
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

exports.payOrder = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, req.t('Order Id is Invalid'))) return

  let order = await GetOrderByQuery({ _id: id })
  if (!order) {
    return res
      .status(400)
      .json(ResponseSchema(req.t("Order Doesn't Exist"), false))
  }
  try {
    let addedData = {
      payment_method: 'online_success',
    }
    let x = await UpdateOrder(id, addedData)
    return res
      .status(200)
      .json(ResponseSchema(req.t('Order Paid Successfully'), true))
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

exports.askForSpecialRequestOrder = async (req, res) => {
  const { provider_id } = req.body
  const { files } = req
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)
  const user = await GetUserById(authedUser?.user_id)
  if (!user) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t("You don't have permission to create order"),
          false
        )
      )
  }

  if (
    !CheckValidIdObject(req, res, provider_id, req.t('Provider Id is Invalid'))
  )
    return
  const provider = await GetProviderById(provider_id)
  if (!provider) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Provider Id is wrong'), false))
  }
  if (provider?.has_special_requests == 2) {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("This Provider Doesn't Offer Special Requests"),
          false
        )
      )
  }
  try {
    let addedData = {
      user_id: authedUser?.user_id,
      provider_id: provider_id,
      special_request_audio_file:
        files?.special_request_audio_file?.[0]?.filename,
    }
    await AddSpecialOrder(addedData)
    try {
      let addedNotificationData = {
        user_id: null,
        provider_id: provider_id,
        translation: {
          en: {
            title: 'New Special Order',
            body: `${user?.name} Sends To You New Special Order Request`,
          },
          ar: {
            title: 'طلب خاص جديد',
            body: `${user?.name} يرسل لك طلب خاص جديد`,
          },
          ur: {
            title: 'نیا خصوصی آرڈر',
            body: `${user?.name} آپ کو نئی خصوصی آرڈر کی درخواست بھیجتا ہے۔`,
          },
        },
      }
      await AddNotification(addedNotificationData)
    } catch (error) {
      console.log(error)
    }
    return res
      .status(200)
      .json(
        ResponseSchema(req.t('special Request Order Added Successfully'), true)
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

exports.sendMessageInSpecialRequest = async (req, res) => {
  const { special_request_id, message_type, message } = req.body
  const { files } = req
  const token = req?.headers?.authorization?.split(' ')[1]
  const authedUser = jwt.decode(token)

  const specialRequest = await GetSpecialOrderByIdPopulated(special_request_id)
  if (
    authedUser?.user_id != specialRequest?.user_id?._id &&
    authedUser?.user_id != specialRequest?.provider_id?._id
  ) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t("You don't have permission to add message to this request"),
          false
        )
      )
  }

  if (message_type == '1' && !message) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Message Is Required'), false))
  }
  if (message_type != '1' && !files?.uploaded_message_file) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Message File Is Required'), false))
  }
  try {
    let updatedData = {
      $push: {
        messages: {
          message_type: message_type,
          sender: authedUser?.user_type,
          message: message,
          uploaded_message_file: files?.uploaded_message_file?.[0]?.filename,
        },
      },
    }
    await UpdateSpecialOrder(special_request_id, updatedData)
    try {
      let addedNotificationData = {
        user_id:
          authedUser?.user_type == 'user' ? null : specialRequest?.user_id?._id,
        provider_id:
          authedUser?.user_type == 'provider'
            ? null
            : specialRequest?.provider_id?._id,
        translation: {
          en: {
            title: 'New Message',
            body: `${
              authedUser?.user_type == 'user'
                ? specialRequest?.user_id?.name
                : specialRequest?.provider_id?.store_name
            } Sends To You New Message`,
          },
          ar: {
            title: 'رسالة جديدة',
            body: `${
              authedUser?.user_type == 'user'
                ? specialRequest?.user_id?.name
                : specialRequest?.provider_id?.store_name
            } يرسل لك رسالة جديد`,
          },
          ur: {
            title: 'نیا پیغام',
            body: `${
              authedUser?.user_type == 'user'
                ? specialRequest?.user_id?.name
                : specialRequest?.provider_id?.store_name
            } آپ کو نیا پیغام بھیجتا ہے۔`,
          },
        },
      }
      await AddNotification(addedNotificationData)
    } catch (error) {
      console.log(error)
    }
    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('special Request message Added Successfully'),
          true
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

exports.sendOfferToSpecialRequest = async (req, res) => {
  const { special_request_id, special_request_offer } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (authedUser?.user_type != 'provider') {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("You don't have permission to add offer to this request"),
          false
        )
      )
  }
  const specialRequest = await GetSpecialOrderByIdPopulated(special_request_id)
  if (authedUser?.user_id != specialRequest?.provider_id?._id) {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("You don't have permission to add offer to this request"),
          false
        )
      )
  }

  try {
    let updatedData = { special_request_offer: special_request_offer }
    await UpdateSpecialOrder(special_request_id, updatedData)
    try {
      let addedNotificationData = {
        user_id: specialRequest?.user_id?._id,
        provider_id: null,
        translation: {
          en: {
            title: 'Special Request Offer',
            body: `${authedUser?.provider_id?.store_name} Sends Offer For Specail Request No.${special_request_id}`,
          },
          ar: {
            title: 'عرض على الطلب الخاص',
            body: `${authedUser?.provider_id?.store_name} أرسل عرض على الطلب الخاص رقم.${special_request_id}`,
          },
          ur: {
            title: 'نیا پیغام',
            body: `${authedUser?.provider_id?.store_name} خصوصی درخواست کے لیے پیشکش بھیجتا ہے۔ نمبر.${special_request_id}`,
          },
        },
      }
      await AddNotification(addedNotificationData)
    } catch (error) {
      console.log(error)
    }
    return res
      .status(200)
      .json(
        ResponseSchema(req.t('special Request Offer Sended Successfully'), true)
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
}

exports.acceptSpecialRequestOffer = async (req, res) => {
  const { user_longitude, user_latitude, special_request_id } = req.body
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (authedUser?.user_type != 'user') {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("You don't have permission to accept offer to this request"),
          false
        )
      )
  }
  const specialRequest = await GetSpecialOrderByIdPopulated(special_request_id)
  if (authedUser?.user_id != specialRequest?.user_id) {
    return res
      .status(403)
      .json(
        ResponseSchema(
          req.t("You don't have permission to accept offer to this request"),
          false
        )
      )
  }

  const session = await mongoose.connection.startSession()
  if (specialRequest?.status == 2) {
    return res
      .status(403)
      .json(ResponseSchema(req.t('Request Already Accepted'), false))
  }
  try {
    session.startTransaction()
    let addedData = [
      {
        user_id: authedUser?.user_id,
        provider_id: specialRequest?.provider_id?._id,
        user_longitude,
        user_latitude,
        special_request_audio_file: specialRequest?.special_request_audio_file,
        status: 1,
        order_type: 2,
      },
    ]

    await UpdateSpecialOrderSession(special_request_id, { status: 2 }, session)
    await AddOrderSession(addedData, session)
    await session.commitTransaction()
    try {
      let addedNotificationData = {
        user_id: null,
        provider_id: specialRequest?.provider_id?._id,
        translation: {
          en: {
            title: 'Accept Special Request Order Offer',
            body: `${authedUser?.user_id?.name} Accept Offer For Special Request No.${special_request_id}`,
          },
          ar: {
            title: 'قبول عرض طلب خاص',
            body: `${authedUser?.user_id?.name} وافق على عرض الطلب الخاص رقم.${special_request_id}`,
          },
          ur: {
            title: 'خصوصی درخواست کے آرڈر کی پیشکش کو قبول کریں۔',
            body: `${authedUser?.user_id?.name} خصوصی درخواست کے لیے پیشکش قبول کریں۔ نمبر.${special_request_id}`,
          },
        },
      }
      await AddNotification(addedNotificationData)
    } catch (error) {
      console.log(error)
    }
    return res
      .status(200)
      .json(
        ResponseSchema(
          req.t('Special Request has been Accepted Successfully.'),
          true
        )
      )
  } catch (error) {
    await session.abortTransaction()
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
  } finally {
    session.endSession()
  }
}

exports.getSpecialRequestMessages = async (req, res) => {
  const { id } = req.params
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  if (!CheckValidIdObject(req, res, id, req.t('Special Request Id is Invalid')))
    return

  const specialRequest = await GetSpecialOrderById(id)
  if (!specialRequest) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Special Request Id is wrong'), false))
  }
  if (
    authedUser?.user_id != specialRequest?.user_id &&
    authedUser?.user_id != specialRequest?.provider_id
  ) {
    return res
      .status(400)
      .json(
        ResponseSchema(
          req.t("You don't have permission to show messages to this request"),
          false
        )
      )
  }
  try {
    let order = await GetSpecialOrderByIdPopulated(id)
    const sendedMessage = order?.messages.map((message) => {
      const messageObj = {
        id: message?._id,
        message_type: message?.message_type,
        sender: message?.sender,
        created_at: moment(message?.date).calendar(),
        message: '',
      }
      if (message?.message_type == '1') {
        messageObj.message = message?.message
      } else {
        messageObj.message =
          message?.uploaded_message_file &&
          MergeImageLink(req, message?.uploaded_message_file)
      }
      return messageObj
    })
    const {
      _id,
      status,
      order_type,
      special_request_audio_file,
      special_request_offer,
      user_id: { name, image },
      provider_id: { store_name, personal_photo },
    } = order || {}

    const sendedObject = {
      id: _id,
      status,
      order_type,
      user_name: name,
      user_image: image && MergeImageLink(req, image),
      special_request_offer,
      provider_name: store_name,
      provider_image: personal_photo && MergeImageLink(req, personal_photo),
      special_request_audio_file:
        special_request_audio_file &&
        MergeImageLink(req, special_request_audio_file),
      messages: sendedMessage,
    }
    return res
      .status(200)
      .json(ResponseSchema(req.t('Orders'), true, sendedObject))
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

exports.getAllSpecialRequests = async (req, res) => {
  const token = req?.headers?.authorization?.split(' ')?.[1]
  const authedUser = jwt.decode(token)

  let query = {}
  if (authedUser?.user_type == 'user') {
    if (
      !CheckValidIdObject(
        req,
        res,
        authedUser?.user_id,
        req.t('User Id is Invalid')
      )
    )
      return
    const user = await GetUserById(authedUser?.user_id)
    if (!user) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('User Id is wrong'), false))
    }
    query = {
      user_id: authedUser?.user_id,
    }
  } else if (authedUser?.user_type == 'provider') {
    if (
      !CheckValidIdObject(
        req,
        res,
        authedUser?.user_id,
        req.t('User Id is Invalid')
      )
    )
      return
    const provider = await GetProviderById(authedUser?.user_id)
    if (!provider) {
      return res
        .status(400)
        .json(ResponseSchema(req.t('User Id is wrong'), false))
    }
    query = {
      provider_id: authedUser?.user_id,
    }
  } else {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Token Is Required'), false))
  }

  try {
    let orders = await GetAllSpecialRequestOrders(query)
    let sendedObject = orders?.map((order) => {
      const {
        _id,
        status,
        order_type,
        special_request_audio_file,
        special_request_offer,
        user_id: { name, image },
        provider_id: { store_name, personal_photo },
      } = order || {}

      return {
        id: _id,
        status,
        order_type,
        user_name: name,
        user_image: image && MergeImageLink(req, image),
        special_request_offer,
        provider_name: store_name,
        provider_image: personal_photo && MergeImageLink(req, personal_photo),
        special_request_audio_file:
          special_request_audio_file &&
          MergeImageLink(req, special_request_audio_file),
        created_at: moment(order?.created_at)
          .locale(
            authedUser?.user_type == 'user'
              ? order?.user_id?.current_language
              : order?.provider_id?.current_language
          )
          .format('MMMM Do YYYY, h:mm:ss a'),
      }
    })

    return res
      .status(200)
      .json(ResponseSchema(req.t('Orders'), true, sendedObject))
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

exports.deleteOrder = async (req, res) => {
  const { id } = req.params
  if (!CheckValidIdObject(req, res, id, req.t('Order Id is Invalid'))) return
  const order = await GetOrderById(id)
  if (!order) {
    return res
      .status(400)
      .json(ResponseSchema(req.t('Order Id is wrong'), false))
  }

  try {
    await DeleteOrder(id)
    return res
      .status(201)
      .json(ResponseSchema(req.t('Order Deleted Successfully'), true))
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
