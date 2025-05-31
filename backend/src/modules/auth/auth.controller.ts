import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('oauth2')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
        @Res() response: Response,
        @Query('code') code: string,
        @Query('state') state: string,
    ) {
        if (!code || !state) {
            throw new HttpException(
                'Missing required parameters',
                HttpStatus.BAD_REQUEST,
            );
        }

        this.authService.handleSalesforceOAuthCallback(response, code, state);
    }
}
