const { Sliders } = require('./SlidersModel')

exports.AddSlider = async (data) => {
  try {
    let addedSlider = await Sliders.create(data)
    return addedSlider
  } catch (error) {
    throw error
  }
}

exports.UpdateSlider = async (id, data) => {
  try {
    let Slider = await Sliders.findByIdAndUpdate(id, data)
    return Slider
  } catch (error) {
    throw error
  }
}

exports.GetSlidersCount = async () => {
  try {
    let SlidersCount = await Sliders.find().lean().count()
    return SlidersCount
  } catch (error) {
    throw error
  }
}

exports.GetSliderById = async (id) => {
  try {
    let Slider = await Sliders.findById(id).lean()
    return Slider
  } catch (error) {
    throw error
  }
}

exports.GetAllSliders = async () => {
  try {
    let sliders = await Sliders.find({}).sort({ order_number: -1 }).lean()
    return sliders
  } catch (error) {
    throw error
  }
}

exports.GetAllSlidersPaginated = async (page, itemPerPage) => {
  try {
    let Slider = await Sliders.find({})
      .lean()
      .sort({ _id: -1, order_number: -1 })
      .skip(page * itemPerPage)
      .limit(itemPerPage)
    return Slider
  } catch (error) {
    throw error
  }
}

exports.DeleteSlider = async (id, session) => {
  try {
    let deleteSlider = await Sliders.findByIdAndDelete(id, { session })
    return deleteSlider
  } catch (error) {
    throw error
  }
}
