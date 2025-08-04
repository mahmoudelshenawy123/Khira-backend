const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const { ResponseSchema, MergeImageLink, PaginateSchema } = require('../../helper/HelperFunctions');
const { ErrorHandler, CheckValidIdObject } = require('../../helper/ErrorHandler');
const { Providers } = require('./ProvidersModel');
const { GetProviderByQuery, AddProvider, UpdateProvider, GetProviderById, GetAllProvidersPaginated, GetProviderCount, DeleteProvider, AddReview, UpdateProviderSession, GetAllReviews, GetReviewsCount, GetFilterProviders, GetAllStories, GetAllProviderNotification, GetProviderByIdPopulated } = require('./ProviderService');
const { GetUserByQuery, GetUserById } = require('../Users/UsersService');
const { DeleteImage } = require('../../helper/DeleteImage');
const distance = require('google-distance-matrix');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY,
  formatter: null,
  language: 'en',
};

distance.key(process.env.GOOGLE_API_KEY);
exports.createProvider = async (req, res) => {
  const {store_name,owner_name,email,city_id,category_id,neighborhood_id,current_latitude,
    current_longitude,id_number,commercial_registeration_number,has_special_requests,
    firebase_token,phone_number,password,whatsapp_number,current_language
  } = req.body;
  const { files } = req;

  if (!CheckValidIdObject(req, res, city_id, 'City Id is Invalid')) return;
  if (!CheckValidIdObject(req, res, neighborhood_id, 'Neighborhood Id is Invalid')) return;

  category_id && category_id.forEach((category) => {
    if (!CheckValidIdObject(req, res, category, 'Category Id is Invalid')) return;
  });

  const provider = await GetProviderByQuery({ phone_number: phone_number });
  if (provider) {
    return res.status(400).json(ResponseSchema('Phone Already Exists', false));
  }

  const user = await GetUserByQuery({ phone_number: phone_number });
  if (user) {
    return res.status(400).json(ResponseSchema('Phone Already Exists', false));
  }
  try {
    const geocoderr = NodeGeocoder(options);
    let modifiedAdressEN;
    let modifiedAdressAR;

    if(current_latitude&&current_longitude){

      options.language = `en`;
      modifiedAdressEN = await geocoderr.geocode(`${current_latitude},${current_longitude}`)
      options.language = `ar`;
      modifiedAdressAR = await geocoderr.geocode(`${current_latitude},${current_longitude}`)
    }
    let addedData = {
      store_name: store_name,
      owner_name: owner_name,
      email: email,
      city_id: city_id,
      category_id: category_id,
      neighborhood_id: neighborhood_id,
      current_latitude: current_latitude,
      current_longitude: current_longitude,
      id_number: id_number,
      commercial_registeration_number: commercial_registeration_number,
      has_special_requests: has_special_requests,
      firebase_token: firebase_token,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      whatsapp_number: whatsapp_number,
      phone_number: phone_number,
      personal_photo: files?.personal_photo?.[0]?.filename,
      current_language: current_language,
      status: 3,
      address:{
        en:modifiedAdressEN?.[0]?.formattedAddress,
        ar:modifiedAdressAR?.[0]?.formattedAddress,
      }
    }
    await AddProvider(addedData)
    return res.status(201).json(ResponseSchema('Provider Created Successfully ,Admins Will Review Your Account', true))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.updateProvider = async (req, res) => {  
  const {store_name,owner_name,email,city_id,category_id,neighborhood_id,current_latitude,
    current_longitude,id_number,commercial_registeration_number,has_special_requests,
    firebase_token,password,whatsapp_number,current_language ,personal_photo:personal_photo_body
  } = req.body;
  const { files ,params:{id}} = req;

  if (!CheckValidIdObject(req, res, id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderById(id);

  if (!provider) {
    return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
  }
  if (!CheckValidIdObject(req, res, city_id, 'City Id is Invalid')) return;
  if (!CheckValidIdObject(req, res, neighborhood_id, 'Neighborhood Id is Invalid')) return;
  category_id && category_id.forEach((category) => {
    if (!CheckValidIdObject(req, res, category, 'Category Id is Invalid')) return;
  });
  if(files?.personal_photo?.[0]?.filename){
    await DeleteImage(provider?.personal_photo)
  }

  // let providerPhone = await Providers.findOne({phone_number:phone_number})
  // if(providerPhone){
  //     return res.status(400).json(ResponseSchema('Phone Already Exists',false))
  // }
  // let user = await User.findOne({phone_number:phone_number})
  // if(user){
  //     return res.status(400).json(ResponseSchema('Phone Already Exists',false))
  // }
  // if(!user?.verified){
  //     return res.status(400).json(ResponseSchema('User is not Verified yet. please verify user number first',false))
  // }
  // if(user?.status==3){
  //     return res.status(400).json(ResponseSchema('User is not active. Please contact admins',false))
  // }
  try {
    let updatedData = {
      store_name: store_name,
      owner_name: owner_name,
      email: email,
      city_id: city_id,
      category_id: category_id,
      neighborhood_id: neighborhood_id,
      current_latitude: current_latitude,
      current_longitude: current_longitude,
      id_number: id_number,
      commercial_registeration_number: commercial_registeration_number,
      has_special_requests: has_special_requests,
      firebase_token: firebase_token,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      whatsapp_number: whatsapp_number,
      personal_photo: files?.personal_photo ? files?.personal_photo?.[0]?.filename : personal_photo_body ? SplitImageLink(req, personal_photo_body) : '',
      current_language: current_language,
    }
    await UpdateProvider(id,updatedData)
    return res.status(201).json(ResponseSchema('Provider Updated Successfully', true))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.verifyProvider = async (req, res) => {
  const data = req.body;
  const {user_id,code} = req.body;

  if (!CheckValidIdObject(req, res, user_id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderByQuery({ _id: user_id, 'verififed_code.code': Number(code) ? Number(code) : 0 });
  if (!provider) {
    return res.status(400).json(ResponseSchema('Code Is Wrong', false));
  }
  if (provider?.status == 3) {
    return res.status(400).json(ResponseSchema('Provider is not active. Please contact admins', false));
  }

  const token = jwt.sign({
    phone_number: provider?.phone_number,
    user_id: provider?._id,
    user_type:'provider'
  }, process.env.JWT_SECRET, { expiresIn: '2d' });

  try {
    let updatedData = {
      api_token: token,
      verified: true,
    }
    await UpdateProvider(data.user_id,updatedData)
    return res.status(201).json(ResponseSchema('Provider Verified Successfully', true, { token }))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.loginProvider = async (req, res) => {
  const {phone_number ,password} = req.body;
  const provider = await GetProviderByQuery({ phone_number: phone_number });
  const verififedCode = Math.floor(1000 + Math.random() * 900000);

  if (provider) {
    if (bcrypt.compareSync(password, provider?.password)) {
      if (provider?.status == 3) {
        return res.status(400).json(ResponseSchema('Provider is not active. Please contact admins', false));
      }
      try {
        let updatedData={
          verififed_code: {
            code: verififedCode,
          },
        }
        await UpdateProvider(provider._id,updatedData)
        return res.status(201).json(ResponseSchema('Login Successfully, Code Sent To phone Number', true, { user_id: provider._id, code: verififedCode }))
      } catch (error) {
        return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
      }
    }
  } else {
    return res.status(400).json(ResponseSchema('Provider Doesn\'t Exist', false));
  }
};

exports.cahengeActiveStatusProvider = async (req, res) => {
  const {id} =req.params
  if (!CheckValidIdObject(req, res, id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderById(id);
  if (!provider) {
    return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
  }
  try {
    let updatedData= {status: provider?.status == 2 ? 3 : 2}
    await UpdateProvider(id,updatedData)
    return res.status(201).json(ResponseSchema('Provider Status Changed Successfully.', true))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.getAllProviders = async (req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetProviderCount();
  const pages = Math.ceil(count / itemPerPage);

  try {
    let providers = await GetAllProvidersPaginated(page , itemPerPage)
    const sendedObject = providers.map((provider) => ({
      id: provider._id,
      store_name: provider?.store_name,
      owner_name: provider?.owner_name,
      email: provider?.email,
      city_id: provider?.city_id,
      neighborhood_id: provider?.neighborhood_id,
      category_id: provider?.category_id,
      current_latitude: provider?.current_latitude,
      current_longitude: provider?.current_longitude,
      id_number: provider?.id_number,
      maroof_number: provider?.maroof_number,
      commercial_registeration_number: provider?.commercial_registeration_number,
      has_special_requests: provider?.has_special_requests,
      firebase_token: provider?.firebase_token,
      password: bcrypt.hashSync(provider?.password, bcrypt.genSaltSync()),
      whatsapp_number: provider?.whatsapp_number,
      phone_number: provider?.phone_number,
      personal_photo: provider?.personal_photo ? MergeImageLink(req, provider?.personal_photo) : '',
      current_language: provider?.current_language,
      total_rate: provider?.total_rate,
      status: provider?.status,
      address:provider?.address?.[`${lang}`]
    }));

    return res.status(200).json(ResponseSchema('Providers', true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.getAllNearByProviders = async (req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetProviderCount();
  const pages = Math.ceil(count / itemPerPage);
  const {current_latitude,current_longitude} = req.query

  try {
    let sendedObject=[]

    if(current_latitude &&current_longitude){
      let providers = await GetAllProvidersPaginated(page , itemPerPage)
      
      await Promise.all( providers.map((provider) =>{
        return new Promise((resolve, reject) => {
        let clientPlace =[`${current_latitude},${current_longitude}`]
        let providerPlace =[`${provider?.current_latitude},${provider?.current_longitude}`]
          distance.matrix([clientPlace],[providerPlace],function (err, distances){
            if (!err){
                if(distances?.rows?.[0]?.elements?.[0]?.distance?.value){
                  sendedObject.push({
                    id: provider._id,
                    store_name: provider?.store_name,
                    owner_name: provider?.owner_name,
                    email: provider?.email,
                    city_id: provider?.city_id,
                    neighborhood_id: provider?.neighborhood_id,
                    category_id: provider?.category_id,
                    current_latitude: provider?.current_latitude,
                    current_longitude: provider?.current_longitude,
                    id_number: provider?.id_number,
                    maroof_number: provider?.maroof_number,
                    commercial_registeration_number: provider?.commercial_registeration_number,
                    has_special_requests: provider?.has_special_requests,
                    firebase_token: provider?.firebase_token,
                    password: bcrypt.hashSync(provider?.password, bcrypt.genSaltSync()),
                    whatsapp_number: provider?.whatsapp_number,
                    phone_number: provider?.phone_number,
                    personal_photo: provider?.personal_photo ? MergeImageLink(req, provider?.personal_photo) : '',
                    current_language: provider?.current_language,
                    total_rate: provider?.total_rate,
                    status: provider?.status,
                    distance:distances?.rows?.[0]?.elements?.[0]?.distance?.text,
                    distance_value:distances?.rows?.[0]?.elements?.[0]?.distance?.value,
                    duration:distances?.rows?.[0]?.elements?.[0]?.duration?.text,
                    address:provider?.address?.[`${lang}`]
                  })
                  resolve()
                }else{
                  resolve();
                }
            }else{
              reject(err);
            }
        })
      });
      }))
      sendedObject = sendedObject.sort((a,b)=> a.distance_value - b?.distance_value)
    }else{
      return res.status(400).json(ResponseSchema('Please Enble location', false))
    }
    return res.status(200).json(ResponseSchema('Providers', true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.getFilterProviders = async (req,query) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  try {
    let providers = await GetFilterProviders(query)
    const sendedObject = providers.map((provider) => {
      const stories = provider?.stories.map((img) => ({ id: img?._id, image: img?.story_image&&MergeImageLink(req, img?.story_image)}));
      let categories = provider?.category_id.map(category=>{
        return{
          id:category?._id,
          image:MergeImageLink(req,category?.image),
          name:category?.translation?.[`${lang}`]?.title,
        }
      })
      return{
        id: provider._id,
        store_name: provider?.store_name,
        owner_name: provider?.owner_name,
        email: provider?.email,
        city_id: provider?.city_id,
        neighborhood_id: provider?.neighborhood_id,
        category_id: categories,
        current_latitude: provider?.current_latitude,
        current_longitude: provider?.current_longitude,
        id_number: provider?.id_number,
        maroof_number: provider?.maroof_number,
        commercial_registeration_number: provider?.commercial_registeration_number,
        has_special_requests: provider?.has_special_requests,
        firebase_token: provider?.firebase_token,
        password: bcrypt.hashSync(provider?.password, bcrypt.genSaltSync()),
        whatsapp_number: provider?.whatsapp_number,
        phone_number: provider?.phone_number,
        personal_photo: provider?.personal_photo ? MergeImageLink(req, provider?.personal_photo) : '',
        current_language: provider?.current_language,
        address:provider?.address?.[`${lang}`],
        status: provider?.status,
        stories: stories.reverse(),
        total_rate: provider?.total_rate,
        rates: (provider?.rates).reverse(),
      }
    });

    return sendedObject
  } catch (error) {
    throw error
  }
};

exports.getProvider = async (req, res) => {
 const lang = req.headers['accept-language']?req.headers['accept-language']: 'en';
  const {id} =req.params
  if (!CheckValidIdObject(req, res, id, 'Provider Id is Invalid')) return;

  try {
    const provider = await GetProviderByIdPopulated(id);
    if (!provider) {
      return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
    }
    
    const stories = provider?.stories.map((img) => ({ id: img?._id, image: img?.story_image&&MergeImageLink(req, img?.story_image) }));
    let categories = provider?.category_id.map(category=>{
      return{
        id:category?._id,
        image:MergeImageLink(req,category?.image),
        name:category?.translation?.[`${lang}`]?.title,
      }
    })
    const sendedObject = {
      id: provider._id,
      store_name: provider?.store_name,
      owner_name: provider?.owner_name,
      email: provider?.email,
      city_id: provider?.city_id,
      neighborhood_id: provider?.neighborhood_id,
      category_id: categories,
      current_latitude: provider?.current_latitude,
      current_longitude: provider?.current_longitude,
      id_number: provider?.id_number,
      maroof_number: provider?.maroof_number,
      commercial_registeration_number: provider?.commercial_registeration_number,
      has_special_requests: provider?.has_special_requests,
      firebase_token: provider?.firebase_token,
      password: bcrypt.hashSync(provider?.password, bcrypt.genSaltSync()),
      whatsapp_number: provider?.whatsapp_number,
      phone_number: provider?.phone_number,
      personal_photo: provider?.personal_photo ? MergeImageLink(req, provider?.personal_photo) : '',
      current_language: provider?.current_language,
      address:provider?.address?.[`${lang}`],
      status: provider?.status,
      stories: stories.reverse(),
      total_rate: provider?.total_rate,
      rates: (provider?.rates).reverse(),
    };

    return res.status(200).json(ResponseSchema('Provider', true, sendedObject));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)));
  }
};

exports.logOutOrDelete = async (req, res) => {
  const data = req.body;
  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderById(authedUser?.user_id);
  if (!provider) {
    return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
  }

  if (data?.destroy == 2) {
    try {
      await DeleteProvider(authedUser?.user_id)
      return res.status(201).json(ResponseSchema('Provider Deleted Successfully.', true))
    } catch (error) {
      return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
    }
  } else {
    try {
      await UpdateProvider(authedUser?.user_id ,{api_token: ''})
      return res.status(201).json(ResponseSchema('Provider Loggedout Successfully.', true))
    } catch (error) {
      return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
    }
  }
};

exports.addStory = async (req, res) => {
  const { file } = req;
  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderById(authedUser?.user_id);
  if (!provider) {
    return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
  }

  try {
    let updatedData ={
      $addToSet: {
        stories: {
          story_image: file?.filename,
        },
      },
    }
    await UpdateProvider(authedUser?.user_id,updatedData)
    return res.status(201).json(ResponseSchema('Highlight Added Successfully.', true))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.deleteStory = async (req, res) => {
  const {story_id} = req.body;
  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  if (!CheckValidIdObject(req, res, story_id, 'Highlight Id is Invalid')) return;
  
  if (!CheckValidIdObject(req, res, authedUser?.user_id, 'Provider Id is Invalid')) return;
  const provider = await GetProviderById(authedUser?.user_id);
  if (!provider) {
    return res.status(400).json(ResponseSchema('Provider Id is wrong', false));
  }

  try {
    let updatedData ={
      $pull: {
        stories: {
          _id: story_id,
        },
      },
    }
    await UpdateProvider(authedUser?.user_id,updatedData)
    return res.status(201).json(ResponseSchema('Highlight Deleted Successfully.', true))
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};

exports.getAllStories = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetProviderCount();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let stories = await GetAllStories(page,itemPerPage)
    const sendedObject = stories.map((storey) => {
      const storiesImages =storey?.stories.map((img) => img?.story_image? MergeImageLink(req, img?.story_image):'')
      return {
        id: storey?._id,
        provider_story_thumbnail: storiesImages?.[0],
        stories:storiesImages,
      };
    });
    return res.status(200).json(ResponseSchema('Provider Stories', true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    console.log(error)
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};


exports.addReviewToProvider = async (req, res) => {
  const {provider_id ,review_rate,review_content} = req.body;
  const { files } = req;
  const token =  req?.headers?.authorization?.split(' ')?.[1];
  const authedUser = jwt.decode(token);

  if (!CheckValidIdObject(req, res, authedUser?.user_id, req.t('User Id is Invalid'))) return;
  const user = await GetUserById(authedUser?.user_id);
  if (!user) {
    return res.status(404).json(ResponseSchema(req.t('You Don\'t Have Permission To Add Review'), false));
  }

  if (!CheckValidIdObject(req, res, provider_id, req.t('Provider Id is Invalid'))) return;
  const provider = await GetProviderById(provider_id);
  if (!provider) {
    return res.status(404).json(ResponseSchema(req.t('Provider Doesn\'nt exist'), false));
  }

  images = files?.images?.map((image) => image?.filename);
  let addedItem;
  const totalRate = (Number(provider?.total_rate_number) + Number(review_rate)) / (Number(provider?.total_rate_count) + 1);
  const session = await mongoose.connection.startSession();

  try {
    session.startTransaction();
    let addedData = [{
      provider_id: provider_id,
      user_id: authedUser?.user_id,
      rate: review_rate,
      content: review_content,
    }]
    await AddReview(addedData,session)
    if (provider?.rates?.length > 5) {
      let updatedData = {
        $pop: { rates: -1 },
      }
      await UpdateProviderSession(provider_id , updatedData ,session)
    }
    let updatedData = {
      $inc: {
        total_rate_count: 1,
        total_rate_number: Number(review_rate),
      },
      total_rate: Number((totalRate).toFixed(2)),
      $addToSet: {
        rates: {
          user_id: authedUser?.user_id,
          rate: review_rate,
          content: review_content,
        },
      },
    }
    await UpdateProviderSession(provider_id , updatedData ,session)
    await session.commitTransaction();
    return res.status(201).json(ResponseSchema(req.t('Store Review Added Successfully'), true, addedItem));
  } catch (error) {
    await session.abortTransaction();
    return res.status(400).json(ResponseSchema(req.t('Somethings Went wrong'), true, ErrorHandler(error)));
  }
};

exports.getAllReviews = async (req, res) => {
  const page = req.query.page - 1 || 0;
  const itemPerPage = req.query.limit || 10;
  const count = await GetReviewsCount();
  const pages = Math.ceil(count / itemPerPage);
  try {
    let reviews = await GetAllReviews(req.params.id)
    const sendedObject = reviews.map((review) => ({
      id: review._id,
      user_name: review?.user_id?.name,
      rate: review?.rate,
      content: review?.content,
    }));

    return res.status(200).json(ResponseSchema('All Provider Reviews', true, PaginateSchema(page + 1, pages, count, sendedObject)));
  } catch (error) {
    return res.status(400).json(ResponseSchema('Somethings Went wrong', false, ErrorHandler(error)))
  }
};