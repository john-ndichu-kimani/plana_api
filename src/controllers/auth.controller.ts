import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { extendedRequest } from "../middlewares/auth";



let service = new authService()

export class authController{

    async loginUser(req: Request, res:Response){
        try {
            let {email, password} = req.body

            let response = await service.login(req.body)

            return res.status(201).json(response)
        } catch (error) {
            return res.status(500).json({error})
        }
    }

    async checkDetails(req: extendedRequest, res: Response){
        try {
            if(req.info){
                return res.status(201).json({
                    info: req.info
                })
            }
        } catch (error) {
            return res.status(500).json({error})
        }
    }
}