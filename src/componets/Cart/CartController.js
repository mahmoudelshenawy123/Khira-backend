const jwt = require('jsonwebtoken');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { ResponseSchema, MergeImageLink, PaginateSchema } = require('../../helper/HelperFunctions');
const { GetProductById } = require('../Products/ProductsService');
const { GetCartItem, UpdateCartItemQuantity, AddItemToCart, GetCartItemById, UpdateCartItem, GetCartItems, GetAllCartItemsPopulated, GetCartItemsCount, GetAllCartItemsPopulatedAndPaginated, DeleteCartItem } = require('./CartService');
const { GetGeneralSettings } = require('../GeneralSettings/GeneralSettingsService');

exports.addProductToCart = async (req, res) => {
  const { cart_item_id ,
    product_id,
    quantity,
    selected_size_id,
    is_gift,
    send_receipt,
    greeting_card,
    greeting_card_message,
    unique_identifier
  } = req.body;
  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  if (!CheckValidIdObject(req, res, product_id, req.t('Product Id is Invalid'))) return;
  
  let cartItemQuery = {};
  cartItemQuery = { product_id: product_id ,is_gift ,send_receipt ,greeting_card ,greeting_card_message};
  
  if (authedUser?.user_id) {
    cartItemQuery = { ...cartItemQuery, user_id: authedUser?.user_id };
  }else{
    cartItemQuery = { ...cartItemQuery, unique_identifier: unique_identifier };
  }

  let addedCartItem ={
    user_id: authedUser?.user_id,
    product_id:product_id,
    is_gift:is_gift,
    send_receipt:send_receipt,
    greeting_card:greeting_card,
    selected_size_id:selected_size_id,
    greeting_card_message:greeting_card_message,
    unique_identifier:unique_identifier
  }
  
  const cartItem = await GetCartItem(cartItemQuery);
  if (cartItem) {
    try {
      addedCartItem ={...addedCartItem ,quantity:Number(quantity)+Number(cartItem?.quantity)}
      let addedItem = await UpdateCartItem(cartItem?._id , addedCartItem)

      let cartData = await getAllCartItemsData(authedUser?.user_id,unique_identifier ,req)
      
      
      return res.status(201).json(ResponseSchema(req.t('Product Updated In Cart Successfully'), true,cartData))
    } catch (error) {
      console.log(error)
      return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
    }
  } else {
    try {
      addedCartItem ={...addedCartItem ,quantity:Number(quantity)}
      let addedItem = await AddItemToCart(addedCartItem)
      let cartData = await getAllCartItemsData(authedUser?.user_id,unique_identifier ,req)

      return res.status(201).json(ResponseSchema(req.t('Product Added To Cart Successfully'), true, cartData))
    } catch (error) {
      console.log(error)
      return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
    }
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  const { cart_item_id ,quantity } = req.body;
  
  try {

  const cartItem = await GetCartItemById(cart_item_id);
  cart_item_id&&
  await Promise.all(cart_item_id?.map(async(item,index)=>{
    if (!CheckValidIdObject(req, res, item, req.t('Cart Item Id is Invalid'))) return;
  
  
    // if (!cartItem) {
    //   return res.status(400).json(ResponseSchema(req.t('Cart Item Id is wrong'), false));
    // }
    let updatedData = {quantity: quantity[index]}
    let x =await UpdateCartItem(item,updatedData)
    })
    
    )
    // ('cartItem',cartItem)
    let cartData = await getAllCartItemsData(cartItem?.user_id,cartItem?.unique_identifier ,req)
    return res.status(201).json(ResponseSchema(req.t('Product Updated In Cart Successfully'), true,cartData))
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.getAllCartItems = async (req, res) => {
  const {unique_identifier} = req.params;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
  const authedUser = jwt.decode(token);

 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  let findQuery = {};

  if (authedUser?.user_id) {
    findQuery = { user_id: authedUser?.user_id };
  } else {
    findQuery = { unique_identifier:unique_identifier };
  }
  try {
    let cartItems = await GetAllCartItemsPopulated(findQuery)
    const generalSetting = await GetGeneralSettings();
    const sendedProductObject = cartItems.map((item) => {
      let selectedSize = []
      if(item?.selected_size_id){
        selectedSize =item?.product_id?.sizes?.filter(size=>{
          return size?._id.equals(item?.selected_size_id)
        })
      }
      let price = selectedSize?.[0] ? selectedSize?.[0]?.price :item?.product_id?.price
      return{
        id: item._id,
        quantity: item?.quantity,
        is_gift: item?.is_gift,
        send_receipt: item?.send_receipt,
        greeting_card: item?.greeting_card,
        greeting_card_message: item?.greeting_card_message,
        product_title: item?.product_id?.translation[`${lang}`]?.title,
        product_slug: item?.product_id?.slug,
        product_img: MergeImageLink(req,item?.product_id?.image),
        selected_size_title:selectedSize?.[0]?.title?.[`${lang}`],
        selected_size:selectedSize?.[0],
        price:item?.is_gift? price+generalSetting?.wrap_as_gift_value :price,
        unique_identifier: item?.unique_identifier,
        user_id: item?.user_id,
      }
    }
    );
    const totalPrice = sendedProductObject.reduce((total,item)=>{
      return total+(item?.price*item?.quantity)
    },0)
    const totalQuantity = sendedProductObject.reduce((total,item)=>{
      return total+item?.quantity
    },0)
    const sendedObject={
      product:sendedProductObject,
      total_price:totalPrice,
      total_quantity:totalQuantity,
    }
    return res.status(200).json(ResponseSchema(req.t('Cart Items'), true, sendedObject));
    
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

let getAllCartItemsData = async (user_id, unique_identifier ,req) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  let findQuery = {};

  if (user_id) {
    findQuery = { user_id: user_id };
  } else {
    findQuery = { unique_identifier:unique_identifier };
  }
  try {
    let cartItems = await GetAllCartItemsPopulated(findQuery)
    const generalSetting = await GetGeneralSettings();
    const sendedProductObject = cartItems.map((item) => {
      let selectedSize = []
      if(item?.selected_size_id){
        selectedSize =item?.product_id?.sizes?.filter(size=>{
          return size?._id.equals(item?.selected_size_id)
        })
      }
      let price = selectedSize?.[0] ? selectedSize?.[0]?.price :item?.product_id?.price
      return{
        id: item._id,
        quantity: item?.quantity,
        is_gift: item?.is_gift,
        send_receipt: item?.send_receipt,
        greeting_card: item?.greeting_card,
        greeting_card_message: item?.greeting_card_message,
        product_title: item?.product_id?.translation[`${lang}`]?.title,
        product_slug: item?.product_id?.slug,
        product_img: MergeImageLink(req,item?.product_id?.image),
        selected_size_title:selectedSize?.[0]?.title?.[`${lang}`],
        selected_size:selectedSize?.[0],
        price:item?.is_gift? price+generalSetting?.wrap_as_gift_value :price,
        unique_identifier: item?.unique_identifier,
        user_id: item?.user_id,
      }
    }
    );
    const totalPrice = sendedProductObject.reduce((total,item)=>{
      return total+(item?.price*item?.quantity)
    },0)
    const totalQuantity = sendedProductObject.reduce((total,item)=>{
      return total+item?.quantity
    },0)
    const sendedObject={
      product:sendedProductObject,
      total_price:totalPrice,
      total_quantity:totalQuantity,
    }
    return sendedObject;
  } catch (error) {
    throw error
  }
};

exports.getAllCartItemsWithPagination = async (req, res) => { 
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  const data = req.body;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';

  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const authedUser = jwt.decode(token);
  
  let findQuery = {};
  if (authedUser?.user_id) {
    findQuery = { user_id: authedUser?.user_id };
  } else {
    findQuery = { mobile_MAC_address: data?.mobile_MAC_address };
  }
  const count = await GetCartItemsCount(findQuery);
  const pages = Math.ceil(count / itemPerPage);
  try {
    let cartItems = await GetAllCartItemsPopulatedAndPaginated(findQuery,page,itemPerPage)
    const sendedObject = cartItems.map((item) => ({
      id: item._id,
      quantity: item?.quantity,
      product_title: item?.product_id?.translation[`${lang}`]?.title,
      product_available_quantity: item?.product_id?.quantity,
      product_rate: item?.product_id?.total_rate,
      product_image: item?.product_id?.images?.[0] ? MergeImageLink(req, item?.product_id?.images[0]) : '',
      product_price: Number((item?.product_id?.price_before_discount - (item?.product_id?.price_before_discount * (item?.product_id?.discount / 100))).toFixed(1)),
      provider_name: item?.provider_id?.store_name,
      mac_address: item?.mobile_MAC_address,
      user_id: item?.user_id,
    }));
    return res.status(200).json(ResponseSchema(req.t('Cart Items'), true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};

exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;
  const { unique_identifier } = req.query;
  if (!CheckValidIdObject(req, res, req.params.id, req.t('Cart Item Id is Invalid'))) return;

  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  const cartItem = await GetCartItem({_id:id});

  if (!cartItem) {
    return res.status(400).json(ResponseSchema(req.t('Cart Item Id is wrong'), false));
  }
  try{
    await DeleteCartItem(id)
    let cartData = await getAllCartItemsData(authedUser?.user_id,unique_identifier ,req)

    return res.status(201).json(ResponseSchema(req.t('Cart Deleted Successfully'), true,cartData))
  } catch (error) {
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), false, ErrorHandler(error)))
  }
};
