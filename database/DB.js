const  mongoose  = require("mongoose");

const connectDB=async()=>{
mongoose.connect(process.env.MONGO_DB_URL).then(()=>{
    console.log('Connected to MongoDB');
});

};

module.exports=connectDB;