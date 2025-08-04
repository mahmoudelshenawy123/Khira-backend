const fs =require('fs')
exports.DeleteImage=async (image)=>{
    await new Promise((resolve,reject)=>{
        fs.unlink(`public/uploads/${image}`,(err)=> {
            console.log(err)
            resolve()
        })
    })
}