const { Orders } = require('./OrdersModel');
const { SpecialRequestOrders } = require('./SpecialRequestOrdersModel');

exports.AddOrder =async(data)=>{
  try {
      let addedOrder = await Orders.create(data)
      return addedOrder
  } catch (error) {
      throw error
  }
}

exports.AddOrderSession =async(data,session)=>{
  try {
      let addedOrder = await Orders.create(data,{session})
      return addedOrder
  } catch (error) {
      throw error
  }
}

exports.UpdateOrder =async(id,data)=>{
  try {
      let updatedOrder = await Orders.findByIdAndUpdate(id,data)
      return updatedOrder
  } catch (error) {
      throw error
  }
}

exports.UpdateOrderSession =async(id,data,session)=>{
  try {
      let updatedOrder = await Orders.findByIdAndUpdate(id,data,session)
      return updatedOrder
  } catch (error) {
      throw error
  }
}

exports.GetOrdersByQueryPaginated =async(query,page,itemPerPage)=>{
  try {
      let orders = await Orders.find(query).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage);
      return orders
  } catch (error) {
      throw error
  }
}
exports.GetOrdersByQuery =async(query)=>{
  try {
      let orders = await Orders.find(query).sort({ _id: -1 });
      return orders
  } catch (error) {
      throw error
  }
}

exports.GetOrderById =async(id)=>{
  try {
      let orders = await Orders.findById(id).populate('products.product_id').sort({ _id: -1 })
      return orders
  } catch (error) {
      throw error
  }
}

exports.GetOrderByQuery =async(query)=>{
  try {
      let orders = await Orders.findOne(query).populate('products.product_id')
      return orders
  } catch (error) {
      throw error
  }
}

exports.GetOrderCount =async()=>{
  try {
    let orderCount = await Orders.find().count()
    return orderCount
  } catch (error) {
    throw error
  }
}

exports.GetAllOrdersPaginated =async(page,itemPerPage)=>{
  try {
      let orders = await Orders.find({}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
      return orders
  } catch (error) {
      throw error
  }
}
exports.GetAllOrdersPaginatedFiltered =async(query,page,itemPerPage)=>{
  try {
      let orders = await Orders.find(query).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
      return orders
  } catch (error) {
      throw error
  }
}
exports.GetAllOrdersCountFiltered =async(query)=>{
  try {
      let orders = await Orders.find(query).count()
      return orders
  } catch (error) {
      throw error
  }
}

exports.DeleteOrder =async(OrderId)=>{
  try {
      let orders = await Orders.findByIdAndDelete(OrderId)
      return orders
  } catch (error) {
      throw error
  }
}

exports.AddSpecialOrder =async(data)=>{
  try {
      let order = await SpecialRequestOrders.create(data)
      return order
  } catch (error) {
      throw error
  }
}

exports.UpdateSpecialOrder =async(id,data)=>{
  try {
      let order = await SpecialRequestOrders.findByIdAndUpdate(id,data)
      return order
  } catch (error) {
      throw error
  }
}

exports.UpdateSpecialOrderSession =async(id,data,session)=>{
  try {
      let order = await SpecialRequestOrders.findByIdAndUpdate(id,data,{session})
      return order
  } catch (error) {
      throw error
  }
}

exports.GetAllSpecialRequestOrders =async(query)=>{
  try {
      let orders = await SpecialRequestOrders.find(query).populate(['provider_id', 'user_id'])
      return orders
  } catch (error) {
      throw error
  }
}

exports.GetSpecialOrderById =async(id)=>{
  try {
      let order = await SpecialRequestOrders.findById(id)
      return order
  } catch (error) {
      throw error
  }
}

exports.GetSpecialOrderByIdPopulated =async(id)=>{
  try {
      let order = await SpecialRequestOrders.findById(id).populate(['user_id','provider_id'])
      return order
  } catch (error) {
      throw error
  }
}

exports.GetSpecialOrderByIdPopulated =async(id)=>{
  try {
      let order = await SpecialRequestOrders.findById(id).populate(['provider_id', 'user_id'])
      return order
  } catch (error) {
      throw error
  }
}