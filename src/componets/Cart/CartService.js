const { Cart } = require('./CartModel');

exports.AddItemToCart = async(data)=>{
  try{
    let addedItem = await Cart.create(data)
    return addedItem
  }catch(err){
      throw err
  }
}

exports.UpdateCartItemQuantity = async(id,quantity)=>{
  try{
    let cartItem = await Cart.findByIdAndUpdate(id, {
      $inc: {
        quantity: quantity,
      },
    }, { new: true })
    return cartItem
  }catch(err){
      throw err
  }
}

exports.UpdateCartItem = async(id,data)=>{
  try{
    let cartItem = await Cart.findByIdAndUpdate(id, data, { new: true })
    return cartItem
  }catch(err){
      throw err
  }
}

exports.UpdateManyCartItems = async(query,data,session)=>{
  try{
    let cartItem = await Cart.updateMany(query, data,{session})
    return cartItem
  }catch(err){
      throw err
  }
}

exports.UpdateManyCartItemsNoSession = async(query,data)=>{
  try{
    let cartItem = await Cart.updateMany(query, data)
    return cartItem
  }catch(err){
      throw err
  }
}

exports.DeleteCartItem = async(id)=>{
  try{
    let deltedCartItem = await Cart.findByIdAndRemove(id)
    return deltedCartItem
  }catch(err){
      throw err
  }
}

exports.DeleteCartItems = async(query)=>{
  try{
    let deltedCartItem = await Cart.deleteMany(query)
    return deltedCartItem
  }catch(err){
      throw err
  }
}

exports.GetCartItem = async(query)=>{
  try{
    let cartItem = await Cart.findOne(query)
    return cartItem
  }catch(err){
      throw err
  }
}

exports.GetCartItems = async(query)=>{
  try{
    let cartItems = await Cart.find(query).populate('product_id')
    return cartItems
  }catch(err){
      throw err
  }
}

exports.GetCartItemsCount = async(query)=>{
  try{
    let cartItemsCount = await Cart.find(query).count()
    return cartItemsCount
  }catch(err){
      throw err
  }
}

exports.GetAllCartItemsPopulated = async(query)=>{
  try{
    let cartItems = await Cart.find(query).populate(['product_id'])
    return cartItems
  }catch(err){
      throw err
  }
}

exports.GetAllCartItemsPopulatedAndPaginated = async(query,page,itemPerPage)=>{
  try{
    let cartItems = await Cart.find(query).populate(['product_id', 'provider_id']).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
    return cartItems
  }catch(err){
      throw err
  }
}

exports.GetCartItemById = async(id)=>{
  try{
    let cartItem = await Cart.findById(id).lean()
    return cartItem
  }catch(err){
      throw err
  }
}