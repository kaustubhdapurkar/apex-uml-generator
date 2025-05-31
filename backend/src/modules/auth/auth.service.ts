import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthService {
    getClientId(): string {
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID environment variable is not set');
        }
        return process.env.CLIENT_ID;
    }

    async getToken(code: string): Promise<string> {
        const response = await fetch(`${process.env.AUTH_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&code=${code}&client_id=${this.getClientId()}&client_secret=${process.env.CLIENT_SECRET}`,
        });
        const data = await response.json();
        return data.access_token;
    }

    async handleSalesforceOAuthCallback(
        response: Response,
        code: string,
        state: string,
    ) {
        let stateJson = JSON.parse(state);
        let authEndpoint = `${stateJson.baseURL}/services/oauth2/token`;
        let data = `grant_type=authorization_code&code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${stateJson.redirectURI}`;
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data,
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
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
