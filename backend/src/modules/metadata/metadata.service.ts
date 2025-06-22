import { Injectable } from '@nestjs/common';
import { Connection } from '@jsforce/jsforce-node';
import { Request } from 'express';
import { SessionService } from '../auth/session.service';
import { Package } from '@jsforce/jsforce-node/lib/api/metadata';
import * as fs from 'fs';
import AdmZip = require("adm-zip")

@Injectable()
export class MetadataService {
    private conn: Connection;
    constructor(
        private readonly sessionService: SessionService, // Assuming SessionService is imported and available
    ) {
        this.conn = new Connection();
    }

    async login(username: string, password: string): Promise<void> {
        try {
            await this.conn.login(username, password);
        } catch (error) {
            throw new Error(`Salesforce login failed: ${error.message}`);
        }
    }

    async retrieveMetadata(request: Request): Promise<any> {
        console.log(request);
        const session = await this.sessionService.getSession(request.sessionID);
        console.log('Session Details:', session);
        if (!session) {
            throw new Error('Session not found');
        }
        if (!session.instance_url || !session.access_token) {
            throw new Error(
                'Session does not contain instance URL or access token',
            );
        }
        this.conn = new Connection({
            instanceUrl: session.instance_url,
            accessToken: session.access_token,
        });

        console.log('Connection established with Salesforce');
        const metadata = await this.conn.metadata.retrieve({
            'apiVersion': 38.0,
            'singlePackage': true,
            'unpackaged': {
                'types': [
                    {
                        'members': ['PaymentService', 'PaymentContext', 'CashOnDeliveryPayment', 'CreditCardPayment', 'IPaymentStrategy'],
                        'name': 'ApexClass',
                    },
                ],
            } as Package,
        }).complete();
        console.log('Metadata retrieval initiated');
        console.log('Metadata:', metadata);

        const zipBase64 = metadata.zipFile;
        // Optionally write it to disk
        const zipPath = './MyPackage.zip';
        fs.writeFileSync(zipPath, zipBase64, { encoding: 'base64' });
        
        // Extract and read Apex classes
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        const apexClasses: { name: string; content: string }[] = [];
        zipEntries.forEach((entry) => {
            // Apex classes are usually in "classes/" and have ".cls" extension
            if (entry.entryName.startsWith('classes/') && entry.entryName.endsWith('.cls')) {
                const className = entry.entryName.replace('classes/', '');
                const content = entry.getData().toString('utf8');
                apexClasses.push({ name: className, content });
            }
        });

        // Log or return the classes as needed
        console.log('Extracted Apex Classes:', apexClasses);
        return apexClasses.map((cls) => cls.content);
    }
}
