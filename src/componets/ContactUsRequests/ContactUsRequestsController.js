// const ResponseSchema = require("../../helper/ResponseSchema")
// const PaginateSchema = require("../../helper/PaginateSchema")
// const { ErrorHandler } = require("../../helper/ErrorHandler")
const { ErrorHandler } = require("../../helper/ErrorHandler")
const { ResponseSchema, PaginateSchema } = require("../../helper/HelperFunctions")
const { ContactUsRequests } = require("./ContactUsRequestsModel")
// const { SendMails } = require("../../helper/SendMail")

exports.createContactUs=async(req,res)=>{
    const data = req.body
    ContactUsRequests.create({
        name:data.name,
        email:data.email,
        phone:data.phone,
        subject:data.subject,
        message:data.message,
    }).then(addedBookRequest=>{
        // SendMails(data.email,'New Contact Us',`${data?.email} Sent New Contact Us
        // name:${data.name},
        // email:${data.email},
        // message:${data.message}`)
        return res.status(201).json(ResponseSchema(('contact-us_added_successfully'),true,addedBookRequest))
    }).catch(err=>{
        return res.status(400).json(ResponseSchema(('something_went_wrong'),false,ErrorHandler(err)))
    })
}

exports.updateContactUs=async(req,res)=>{
    const data = req.body
    ContactUsRequests.findByIdAndUpdate(req.params.id,{
        name:data.name,
        email:data.email,
        message:data.message,
    }).then(addedBookRequest=>{
        return res.status(201).json(ResponseSchema(('contact-us_updated_successfully'),true,addedBookRequest))
    }).catch(err=>{
        return res.status(400).json(ResponseSchema(('something_went_wrong'),false,ErrorHandler(err)))
    })
}

exports.getAllContactUs=async(req,res)=>{
    let lang =req.headers['accept-language'] =='ar'?'ar':'en'

    let page =req.query.page-1 ||0
    let itemPerPage =req.query.limit||10
    let count = await ContactUsRequests.find().count()
    let pages = Math.ceil(count/itemPerPage)

    ContactUsRequests.find({}).sort({_id:-1}).skip(page*itemPerPage).limit(itemPerPage).then(contacts=>{
        let sendedObject=contacts.map(contact=>{
            return{
                id:contact._id,
                name:contact.name,
                email:contact.email,
                phone:contact.phone,
                subject:contact.subject,
                message:contact.message,
            }
        })
        return res.status(200).json(ResponseSchema(req.t('contacts'),true,PaginateSchema(page+1,pages,count,sendedObject)))
    }).catch(err=>{
        return res.status(400).json(ResponseSchema(req.t('something_went_wrong'),false,ErrorHandler(err)))
    })
}

exports.getAllContactUsWithoutPagination=async(req,res)=>{
    let lang =req.headers['accept-language'] =='ar'?'ar':'en'

    ContactUsRequests.find({}).then(contacts=>{
        let sendedObject=contacts.map(contact=>{
            return{
                id:contact._id,
                name:contact.name,
                email:contact.email,
                phone:contact.phone,
                subject:contact.subject,
                message:contact.message,
            }
        })
        return res.status(200).json(ResponseSchema(req.t('contacts'),true,sendedObject))
    }).catch(err=>{
        return res.status(400).json(ResponseSchema(req.t('something_went_wrong'),false,ErrorHandler(err)))
    })
}

exports.deleteContactUs =(req,res)=>{
    ContactUsRequests.findByIdAndDelete(req.params.id).then(async (deletedItem)=>{
        return res.status(200).json(ResponseSchema('Contact Us deleted successfully',true,deletedItem))
    }).catch(err=>{
        return res.status(400).json(ResponseSchema('something_went_wrong',false,ErrorHandler(err)))
    })
}