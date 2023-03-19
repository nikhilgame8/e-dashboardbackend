const {Router} = require("express");
const Jwt = require("jsonwebtoken");

const {registerUser, getUsersRegistration, loginUser, changePassword, addNewProduct, getProductList, getProductByID, productUpdateByID, deleteProductByID, inviteUsers} = require("../controllers/DashboardControllers");

const router = Router();
const jwtKey = "e-comm";

const authenticate = (req, resp, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return resp.status(401).send({
            message: "Authentication failed"
        })
    }
    const token = authHeader.split(" ")[1];
    try{
        const decoded = Jwt.verify(token, jwtKey);
        req.userEmail = decoded.email;
        next();
    } catch(err){
        return resp.status(401).send({
            message: "Authentication failed"
        })
    }
}

router.post("/register-user", registerUser);
router.get("/register-user", getUsersRegistration);
router.post("/login", loginUser);
router.post("/change-password", authenticate, changePassword);
router.post("/product", authenticate, addNewProduct);
router.post("/invite-users", authenticate, inviteUsers);
router.post("/getProductByID", authenticate, getProductByID);
router.post("/productList", authenticate, getProductList);
router.put("/productUpdateByID", authenticate, productUpdateByID);
router.post("/deleteProductByID", authenticate, deleteProductByID);

module.exports = router;