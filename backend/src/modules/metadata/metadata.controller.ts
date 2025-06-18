import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
    constructor(private readonly metadataService: MetadataService) {}

    @Get('retrieve')
    async retrieveMetadata(@Req() request: Request): Promise<any> {
        console.log('Retrieving metadata for request:', request);
        this.metadataService.retrieveMetadata(request);
    }
}
