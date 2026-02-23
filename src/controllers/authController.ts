import { type Request, type Response, type NextFunction } from 'express';

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import Joi, {ValidationResult} from "joi";

import {userModel} from "../models/userModel";
import {User} from "../interfaces/user";
import {connect, disconnect} from "../repository/database";

export async function registerUser(req: Request, res:Response){

    try{
        //validate user and his password
        const{ error } = validateUserRegistrationInfo (req.body);
        if (error){
            res.status(400).json({error: error.details[0].message});
            return;
        }

        await connect ();
        //check email if it is registered
        const emailExists = await userModel.findOne({email: req.body.email});

        if (emailExists){
            res.status(409).json({error: "Email already exists."});
            return;
        }

        //pasword hash
        const salt = await bcrypt.genSalt(10);
        const passwordHashed = await bcrypt.hash(req.body.password, salt);
        
        //create user object and save it in the db
        const userObject = new userModel({
            name: req.body.name,
            email: req.body.email,
            password:passwordHashed
        });

        const savedUser = await userObject.save();
        res.status(200).json ({error:null, data:savedUser._id});

    }catch (error) {
        res.status(500).json({ error: "Error registering user", details: String(error) });
    }finally{
        await disconnect();
    }
};


//validate user registration info
export function validateUserRegistrationInfo(data: User): ValidationResult{

        const schema = Joi.object( {
            name:Joi.string().min(6).max(255).required(),
            email:Joi.string().email().min(6).max(255).required(),
            password:Joi.string().min(6).max(25).required()
        });

        return schema.validate(data);
}

//validate user login
export function validateUserLoginInfo(data: User): ValidationResult{

        const schema = Joi.object( {
            email:Joi.string().email().min(6).max(255).required(),
            password:Joi.string().min(6).max(25).required()
        });

        return schema.validate(data);
}