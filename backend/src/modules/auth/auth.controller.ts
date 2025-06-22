import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    Res,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { SessionService } from './session.service';

@Controller('oauth2')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
    ) {}

    @Get('clientid')
    async getClientId() {
        try {
            const clientId = this.authService.getClientId();
            return { clientId };
        } catch (error) {
            throw new HttpException(
                'Failed to get client ID',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('callback')
    async handleSalesforceOAuthCallback(
        @Req() req: Request,
        @Res() response: Response,
        @Query('code') code: string,
        @Query('state') state: string,
    ) {
        console.log('inside callback');
        if (!code || !state) {
            throw new HttpException(
                'Missing required parameters',
                HttpStatus.BAD_REQUEST,
            );
        }

        console.log('Session Cookie Details:', {
            id: req.sessionID,
            cookie: req.session?.cookie,
            headers: {
                cookie: req.headers.cookie,
                'set-cookie': response.getHeader('set-cookie')
            }
        });

        await this.authService.handleSalesforceOAuthCallback(
            response,
            code,
            state,
            req,
        );
    }

    @Get('success')
    async handleOAuthSuccess(@Req() req: Request) {
        console.log('Session Cookie Details:', {
            id: req.sessionID,
            cookie: req.session?.cookie,
            headers: {
                cookie: req.headers.cookie,
                'set-cookie': req.headers['set-cookie']
            }
        });
        
        const session = await this.sessionService.getSession(req.sessionID);
        console.log('Redis Session Data:', session);
        
        if (!session) {
            throw new HttpException(
                'No session found in Redis',
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (!session.access_token) {
            throw new HttpException(
                'No access token found in session',
                HttpStatus.UNAUTHORIZED,
            );
        }

        return {
            status: 'success',
            instanceUrl: session.instance_url,
        };
    }

    @Get('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        await this.sessionService.deleteSession(req.sessionID);
        res.redirect('/');
    }
}
