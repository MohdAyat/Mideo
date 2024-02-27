// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path : "./.env"
})
connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`app is listening at PORT : ${process.env.PORT}`);
  })
  app.on('error',(err)=>{
    console.log('Error while listening ',err)
    throw err
  })
})
.catch((err)=>{
  console.log('MONGODB connection failed: ',err);
})











// const app = express()
// (async ()=>{
//   try {
//     await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
//     app.on("error",(error)=>{
//       console.log(error)
//     })
//     app.listen(process.env.PORT,()=>{
//       console.log(`app is listening at port ${process.env.PORT}`);
//     })
//   } catch (error) {
//     console.log("ERROR: ",error)
//     throw error
//   }
// })()