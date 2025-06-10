import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
    constructor(private readonly sessionService: SessionService) {}

    getClientId(): string {
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID environment variable is not set');
        }
        return process.env.CLIENT_ID;
    }

    async getToken(code: string, sessionId: string): Promise<string> {
        const response = await fetch(`${process.env.AUTH_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=authorization_code&code=${code}&client_id=${this.getClientId()}&client_secret=${process.env.CLIENT_SECRET}`,
        });
        const data = await response.json();
        
        if (data.access_token) {
            await this.sessionService.setSessionData(sessionId, 'access_token', data.access_token);
        }
        
        return data.access_token;
    }

    async handleSalesforceOAuthCallback(
        response: Response,
        code: string,
        state: string,
        sessionId: string,
    ) {
        try {
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

            let oauthResponse = await fetch(authEndpoint, requestOptions);
            let responseJson = await oauthResponse.json();

            if (responseJson.error) {
                throw new HttpException(
                    responseJson.error_description || 'OAuth error',
                    HttpStatus.BAD_REQUEST
                );
            }

            await this.sessionService.createSession(sessionId, {
                access_token: responseJson.access_token,
                refresh_token: responseJson.refresh_token,
                instance_url: responseJson.instance_url,
                baseURL: stateJson.baseURL,
                redirectURI: stateJson.redirectURI
            });

            response.redirect('http://localhost:8080/api/oauth2/success');
        } catch (error) {
            console.error('OAuth callback error:', error);
            throw new HttpException(
                error.message || 'Failed to process OAuth callback',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateOAuthState(sessionId: string, baseURL: string, redirectURI: string): Promise<string> {
        const state = JSON.stringify({ baseURL, redirectURI });
        await this.sessionService.setSessionData(sessionId, 'oauth_state', state);
        return state;
    }
}
