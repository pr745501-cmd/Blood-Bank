import User from "../models/User.js";

/* GET PROFILE */

export const getProfile = async (req,res)=>{

  try{

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  }catch(err){

    res.status(500).json({message:"Server Error"});

  }

};


/* UPDATE PROFILE */

export const updateProfile = async (req,res)=>{

  try{

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {new:true}
    ).select("-password");

    res.json(user);

  }catch(err){

    res.status(500).json({message:"Update failed"});

  }

};