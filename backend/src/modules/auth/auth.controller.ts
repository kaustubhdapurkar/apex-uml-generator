import { Controller, Get, HttpException, HttpStatus, Query, Req, Res, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import * as express from 'express';

@Controller('oauth2')
export class AuthController {
    private router: express.Router;

    constructor(private readonly authService: AuthService) {
        this.router = express.Router();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get('/clientid', this.getClientId.bind(this));
        this.router.get('/callback', this.oauthCallback.bind(this));
    }

    @Get('clientid')
    async getClientId() {
        try {
            const clientId = this.authService.getClientId();
            return { clientId };
        } catch (error) {
            throw new HttpException(
                'Failed to get client ID',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('callback')
    async oauthCallback(
        @Req() request: Request,
        @Res() response: Response,
        @Query('code') code: string,
        @Query('state') state: string,
        @Headers('authorization') auth: string
    ) {
        console.log('Query Parameters:', request.query);
        console.log('Code from @Query:', code);
        console.log('State from @Query:', state);
        console.log('Auth Header:', auth);
        console.log('All Headers:', request.headers);

        if (!code || !state) {
            throw new HttpException(
                'Missing required parameters',
                HttpStatus.BAD_REQUEST
            );
        }

        let stateJson = JSON.parse(state);
        let authEndpoint = `${stateJson.baseURL}/services/oauth2/token`;
        let data = `grant_type=authorization_code&code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${stateJson.redirectURI}`;
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        };

        try {
            let oauthResponse = await fetch(authEndpoint, requestOptions);
            let responseJson = await oauthResponse.json();
            console.log('test', responseJson);
            response.redirect('/api/oauth2/success');
        } catch (error) {
            console.log('error', error);
            throw new HttpException(
                'Failed to process OAuth callback',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
