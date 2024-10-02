import { dbConnect } from "@/lib/dbConnect";
import userModel from "@/model/user";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await userModel.findOne({username, isVerified: true})

        if(existingUserVerifiedByUsername) {
            return Response.json(
                { success: false, message: "Username already exists" }, 
                { status: 400 }
            );
        }

        const existingUserVerifiedByEmail = await userModel.findOne({email, isVerified: true});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserVerifiedByEmail) {
           if(existingUserVerifiedByEmail.isVerified) {
            return Response.json(
                { success: false, message: "Email already exists" }, 
                { status: 400 }
            );
           }
           else{
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserVerifiedByEmail.password = hashedPassword;
            existingUserVerifiedByEmail.verifyCode = verifyCode;
            existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

            await existingUserVerifiedByEmail.save();
           }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expireDate = new Date();
            expireDate.setHours(expireDate.getHours() + 1);

            const newUser = new userModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expireDate,
                isVerified: false,
                messages: [],
            })

            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        
        if(!emailResponse.success){
            return Response.json({ success: false, message: "Failed to send verification email" }, { status: 500 });
        }

        return Response.json({ success: true, message: "User Registered" }, { status: 201 });

    } catch (error) {
        console.log(error);
        return Response.json({ success: false, message: "Failed to sign up" }, { status: 500 });
    }
}