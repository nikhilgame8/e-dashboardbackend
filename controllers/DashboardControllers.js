const NewUserRegistration = require("../models/NewUser");
const Product = require("../models/Product");
const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const jwtKey = "e-comm";

module.exports.getUsersRegistration = async (req, resp) => {
    const result = await NewUserRegistration.find();
    resp.send(result)
};

module.exports.registerUser = async (req, resp) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const token = Jwt.sign({ email }, jwtKey);
        const user = await NewUserRegistration.create({ name: name, email: email, password: hashedPassword })
        resp.status(201).json({
            "status_code": 201,
            "status": "Success",
            "data": { token },
            "message": "Data Inserted Successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            data: err,
            message: "User registration failed"
        })
    }
};

module.exports.loginUser = async (req, resp) => {
    try {
        const { email, password } = req.body;
        const user = await NewUserRegistration.findOne({ email });
        if (!user) {
            return resp.status(401).send({
                message: "Invalid Email",
                data: user
            })
        }
        const passwordMatched = await bcrypt.compare(password, user.password);
        if (!passwordMatched) {
            return resp.status(401).send({
                message: "Invalid Password"
            })
        }
        const token = Jwt.sign({ email }, jwtKey);
        resp.status(200).send({
            status_code: 200,
            status: "Success",
            token: token,
            message: "Login successful"
        });
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            message: "Login failed"
        })
    }
}

module.exports.changePassword = async (req, resp) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userEmail = req.userEmail;
        const user = await NewUserRegistration.findOne({ email: userEmail });
        if (!user) {
            return resp.status(401).send({
                message: "Invalid Email"
            })
        }
        const passwordMatched = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatched) {
            return resp.status(401).send({
                message: "Invalid Password"
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        resp.status(200).send({
            status_code: 200,
            status: "Success",
            message: "Password changed successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            message: "Password not changed"
        })
    }
}

module.exports.addNewProduct = async (req, resp) => {
    try {
        const { name, price, category, userId, company, invitedUsers } = req.body;
        const userEmail = req.userEmail;
        const user = await NewUserRegistration.findOne({ email: userEmail });
        if (!user) {
            return resp.status(404).send({
                status_code: 404,
                status: "Failed",
                message: "User not found"
            })
        }
        const product = await Product.create({ name, price, category, userId, company, createdBy: user._id, invitedUsers });

        user.products.push(product._id);
        await user.save();

        resp.status(201).send({
            status_code: 201,
            status: "Success",
            data: product,
            message: "Product Inserted Successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            result: err,
            message: "Product not added"
        })
    }
}

module.exports.inviteUsers = async (req, resp) => {
    try {
        const { productId, invitedUsers } = req.body;
        const userEmail = req.body;

        const user = await NewUserRegistration.findOne({email: userEmail});
        if(!user){
            return resp.status(404).send({
                message: "User not found"
            })
        }
        const product = await Product.findOne({_id: productId});
        if(!product){
            return resp.status(404).send({
                message: "Product not found"
            })
        }
        if(!product.createdBy.equals(user._id)){
            return resp.status(401).send({
                message: "Unauthorized"
            })
        }
        product.invitedUsers = invitedUsers;
        await product.save();
        res.json({ message: 'Users invited successfully' });
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            result: err,
            message: "Invitation failed"
        })
    }
}

module.exports.getProductList = async (req, resp) => {
    try {
        const { keyword, startDate, endDate, page } = req.body;
        if (keyword || page || startDate || endDate) {
            const result = await Product.find({
                "$or": [
                    { name: { $regex: keyword } },
                    { price: { $regex: keyword } },
                    { category: { $regex: keyword } },
                    { userId: { $regex: keyword } },
                    { company: { $regex: keyword } },
                    { createdDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }}
                ]
            }).sort({createdDate: -1}).skip((page-1) * 10).limit(10);
            const count = await Product.find({}).count();
            resp.status(200).send({
                status_code: 200,
                status: "Success",
                data: result,
                data_count: count,
                message: "Product Found Successfully"
            })
        }
        else {
            const result = await Product.find();
            const count = await Product.find({}).count();
            resp.status(200).send({
                status_code: 200,
                status: "Success",
                data: result,
                data_count: count,
                message: "Data Found Successfully"
            });
        }
    }
    catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            data: "",
            message: "No Data Found"
        })
    }
}

module.exports.getProductByID = async (req, resp) => {
    try {
        const { productUUID } = req.body;
        const result = await Product.findById(productUUID);
        resp.status(200).send({
            status_code: 200,
            status: "Success",
            data: result,
            message: "Product Found Successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            data: "",
            message: "Product Not Found"
        })
    }
}

module.exports.productUpdateByID = async (req, resp) => {
    try {
        const { productUUID, name, price, category, userId, company } = req.body;
        const result = await Product.findByIdAndUpdate(productUUID, { name: name, price: price, category: category, userId: userId, company: company });
        resp.status(200).send({
            status_code: 200,
            status: "Success",
            data: result,
            message: "Product Updated Successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            data: "",
            message: "Product Not Updated"
        })
    }
}

module.exports.deleteProductByID = async (req, resp) => {
    try {
        const { productUUID } = req.body;
        const result = await Product.findByIdAndRemove(productUUID);
        resp.status(200).send({
            status_code: 200,
            status: "Success",
            data: result,
            message: "Product Deleted Successfully"
        })
    } catch (err) {
        resp.status(200).send({
            status_code: 200,
            status: "Failed",
            data: "",
            message: "Product Not Deleted"
        })
    }
}
