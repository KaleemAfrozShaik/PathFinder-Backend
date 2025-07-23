
const { connectDB } = require('./config');
const app = require('./app');
require('dotenv').config();

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is ruuning at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.error("Error connecting to the database:", error);
    process.exit(1); 
});