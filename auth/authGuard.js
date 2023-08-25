const jwt = require('jsonwebtoken');
const authGuard=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).json({msg:"Authirization header missing"});
    }
    const token=authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({msg:"Token missing"});
    }
    
    //frontend --AuthGuard--> backend

    console.log(token)

    try{

        const decodedUser=jwt.verify(token,'JWT_SECRET');
        req.user=decodedUser;
        console.log(req.user);
        next();

    }
    catch(error){
        res.status(500).json(error.message);
    }
};
module.exports = authGuard;