const { ProviderNotification } = require('./ProviderrNotificationsModel');
const { Providers } = require('./ProvidersModel');
const { Reviews } = require('./ReviewsModel');

exports.AddProvider =async(data)=>{
    try {
        let addedProvider = await Providers.create(data)
        return addedProvider
    } catch (error) {
        throw error
    }
}

exports.UpdateProvider =async(id,data)=>{
    try {
        let updatedProvider = await Providers.findByIdAndUpdate(id,data)
        return updatedProvider
    } catch (error) {
        throw error
    }
}

exports.UpdateProviderSession =async(id,data,session)=>{
    try {
        let updatedProvider = await Providers.findByIdAndUpdate(id,data,session)
        return updatedProvider
    } catch (error) {
        throw error
    }
}

exports.GetProviderByQuery =async(query)=>{
    try {
        let providers = await Providers.findOne(query);
        return providers
    } catch (error) {
        throw error
    }
}

exports.GetProviderById =async(id)=>{
    try {
        let providers = await Providers.findById(id)
        return providers
    } catch (error) {
        throw error
    }
}

exports.GetProviderByIdPopulated =async(id)=>{
    try {
        let providers = await Providers.findById(id).populate('category_id')
        return providers
    } catch (error) {
        throw error
    }
}

exports.GetProviderCount =async()=>{
    try {
      let providerCount = await Providers.find().count()
      return providerCount
    } catch (error) {
      throw error
    }
}

exports.GetAllProvidersPaginated =async(page,itemPerPage)=>{
    try {
        let providers = await Providers.find({}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
        return providers
    } catch (error) {
        throw error
    }
}

exports.GetFilterProviders =async(query)=>{
    try {
        let providers = await Providers.find(query).populate('category_id').sort({ _id: -1 })
        return providers
    } catch (error) {
        throw error
    }
}

exports.DeleteProvider =async(ProviderId)=>{
    try {
        let providers = await Providers.findByIdAndDelete(ProviderId)
        return providers
    } catch (error) {
        throw error
    }
}

exports.GetAllStories =async(page,itemPerPage)=>{
    try {
        let stories = await Providers.find({ 'stories.0': { $exists: true } }).sort({ 'stories.date': -1 }).skip(page * itemPerPage).limit(itemPerPage)
        return stories
    } catch (error) {
        throw error
    }
}

exports.AddReview =async(data,session)=>{
    try {
        let addedReview = await Reviews.create(data,{session})
        return addedReview
    } catch (error) {
        throw error
    }
}

exports.GetReviewsCount =async()=>{
    try {
        let reviewsCount = await Reviews.find().count()
        return reviewsCount
    } catch (error) {
        throw error
    }
}

exports.GetAllReviews =async(id,page,itemPerPage)=>{
    try {
        let reviews = await Reviews.find({ provider_id: id }).populate('user_id').sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
        return reviews
    } catch (error) {
        throw error
    }
}

exports.AddProviderNotification =async(data)=>{
    try {
        let addedProviderNotification = await ProviderNotification.create(data)
        return addedProviderNotification
    } catch (error) {
        throw error
    }
}

exports.GetAllProviderNotification =async(provider_id,page,itemPerPage)=>{
    try {
        let providerNotifications = await ProviderNotification.find({provider_id:provider_id}).sort({ _id: -1 }).skip(page * itemPerPage).limit(itemPerPage)
        return providerNotifications
    } catch (error) {
        throw error
    }
}