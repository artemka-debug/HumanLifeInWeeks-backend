import {Request, Response} from "express-serve-static-core";
import {html_text} from "./messages";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt, {VerifyErrors} from 'jsonwebtoken'
import {config} from './config';

require('dotenv').config({path: '.' + '/.env'});

type InputType = "email" | "password";

function inputValidate(input: string, type: InputType) {
    switch (type) {
        case "email":
            return /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,10}$/g.test(input);
        case "password":
            return /\w{6,24}/g.test(input);
        default:
            return false;
    }
}

export async function check_password(user: any, res: Response, password: string) {
    try {
        return await bcrypt.compare(password, user.password);
    } catch (err) {
        console.log(err);
        res.status(200).json({result: false, Error: err.message});
    }
}


export function send_password(email: string, res: Response, new_password: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });

    const mailOptions = {
        from: 'HumanLifeInWeeks',
        to: email,
        subject: 'Reset password to your account in HumanLifeInWeeks',
        text: 'This is your new password for account ' + new_password,
        html: html_text(new_password)
    };

    transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({
                result: true,
                status: 'Your new password has been sent to your email'
            });
        }
    });
}

export function validate_email(req: Request, res: Response, next: Function) {
    const {email} = req.body;

    if (!inputValidate(email, "email")) {
        return res.json({result: false, Error: 'Invalid email'})
    } else {
        next();
    }
}

export function validate_password(req: Request, res: Response, next: Function) {
    const {password} = req.body;

    if (!inputValidate(password, "password")) {
        return res.json({result: false, Error: 'Invalid password'})
    } else {
        next();
    }
}

export function check_token(req: any, res: Response, next: Function) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (!token) {
        next();
        return;
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.json({
            result: false,
            message: 'Auth token is not supplied'
        });
    }

    jwt.verify(token, config.secret, (err: VerifyErrors | null, decoded: any) => {
        if (!err) {
            req.decoded = decoded;
            next();
            return;
        }

        return res.json({
            result: false,
            message: 'Token is not valid',
        });
    });
}

export function create_token(email: string) {
    return jwt.sign({email},
        config.secret,
        {
            expiresIn: '30d'
        }
    );
}

export function check_user_send_res(user: any, res: Response, error_msg: string, success_msg: string, id: string | undefined) {
    if (user === null) {
        return res.status(200).json({
            result: false,
            Error: error_msg
        })
    } else {
        return res.status(200).json({
            result: true,
            status: success_msg,
            id: id
        })
    }
}
