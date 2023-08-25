const productModal = require("../model/productModal");
const orderModal = require('../model/orderModal');
const router = require("express").Router();
const authGuard = require("../auth/authGuard");
const userModal=require('../model/userModel');

const cloudinary = require("cloudinary");

router.get("/", (req, res) => {
  res.send("Welcome to the FlyBuy Product API");
});

router.post("/create", async (req, res) => {
    // console.log(req.body);
  //destructuring step 1
  const {productName, 
        productPrice, 
        productCategory, 
        productDescription
        } = req.body;

  const { productImage } = req.files;

  //validation step 2
  if (
    !productName ||
    !productPrice ||
    !productCategory ||
    !productDescription ||
    !productImage
  ) {
    return res.status(400).json({ msg: "Please enter all the fields" });
  }

  //upload image section step 3
  const uploadedImage = await cloudinary.v2.uploader.upload(productImage.path, {
    folder: "flybuy",
    crop: "scale",
  });

  //save to database step 4
  try {
    const product = new productModal({
      productName: productName,
      productPrice: productPrice,
      productCategory: productCategory,
      productDescription: productDescription,
      productImage: uploadedImage.secure_url,
    });

    await product.save();
    res.status(200).json({ msg: "Product created successfully" });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//get all products
router.get('/get_products',async(req,res)=>{
    try{

        const products= await productModal.find();
        res.status(200).json(products);
    }catch(error){
        console.log(error);
        res.status(500).json(error.message);
    }
});


//get single product
router.get('/get_product/:id',async(req,res)=>{
  // req.body=json data
  // req.files= file data
  // req.params= url data
  try{
    const product=await productModal.findById(req.params.id);
    res.status(200).json(product);
  }catch(error){
    res.status(500).json(error.message);
  }
});

//upadte product
router.put('/update_product/:id', authGuard, async (req, res) => {
    // console.log(req.body);

  //destructuring step 1
  const {productName, 
        productPrice, 
        productCategory, 
        productDescription
        } = req.body;

  const { productImage } = req.files;

  //validation step 2
  if (
    !productName ||
    !productPrice ||
    !productCategory ||
    !productDescription
  ) {
    return res.status(400).json({ msg: "Please enter all the fields" });
  }


  

  //save to database step 4
  try {
    if(productImage){
      const uploadedImage = await cloudinary.v2.uploader.upload(productImage.path, {
        folder: "flybuy",
        crop: "scale",
      });
  
      const product=await productModal.findById(req.params.id);
      product.productName=productName;
      product.productPrice=productPrice;
      product.productCategory=productCategory;
      product.productDescription=productDescription;
      product.productImage=uploadedImage.secure_url;
  
      await product.save();
      res.status(200).json({ msg: "Product updated successfully with image" });
    }else{

  
      const product=await productModal.findById(req.params.id);
      product.productName=productName;
      product.productPrice=productPrice;
      product.productCategory=productCategory;
      product.productDescription=productDescription;
  
      await product.save();
      res.status(200).json({ msg: "Product updated successfully without image" });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});


//delete product
router.delete('/delete_product/:id',async(req,res)=>{
  try{

    const product=await productModal.findByIdAndDelete(req.params.id);
    res.status(200).json({msg:"Product deleted successfully"});

  }catch(error){
    res.status(500).json(error.message);
  }
})

//search product
router.get('/search/:name',async(req,res)=>{
  try{
    const products= await productModal.find({
      productName: {
        $regex: req.params.name,
        $options: 'i'
      }
    })

    res.status(200).json({
      message: "Search results",
      products: products
    })

  }catch(error){
    console.log(error);
    res.status(500).json(error.message);
  }
});


//count products,orders,users
router.get('/get_count',async(req,res)=>{
  try{
    const product=await productModal.countDocuments({});
    const pendingOrders=await orderModal.countDocuments({status:'Pending'});
    const deliveredOrders=await orderModal.countDocuments({status:'Delivered'});
    const user= await userModal.countDocuments({});
    res.status(200).send({
      productCount: product,
      pendingOrdersCount:pendingOrders,
      deliveredOrdersCount:deliveredOrders,
      userCount:user
    })
  }catch(error){
    res.json(error.message);
  }
})

module.exports = router;