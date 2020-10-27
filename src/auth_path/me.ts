import {Response} from "express-serve-static-core";
import jwt, {VerifyErrors} from "jsonwebtoken";
import {config} from "../config";

export const me = (req: any, res: Response) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) return res.json({result: false});

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.json({
            result: false,
            message: 'Token in not supplied'
        })
    }

    jwt.verify(token, config.secret, (err: VerifyErrors | null, decoded?: object) => {
        if (err) {
            return res.json({
                result: false,
                message: 'Token is not valid',
                token: null
            });
        }

        return res.json({
            result: true,
            message: 'Token is valid',
            token
        })
    })
};
