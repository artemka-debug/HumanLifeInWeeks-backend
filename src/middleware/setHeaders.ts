import {Response, Request, NextFunction} from "express";

const setHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.set({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    next();
};

export {
    setHeaders
}
