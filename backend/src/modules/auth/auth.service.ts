import { Injectable } from '@nestjs/common';

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
    
}
