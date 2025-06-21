import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { MetadataService } from './metadata.service';
import { generateD3Json } from 'src/scripts/generateD3Json';

@Controller('metadata')
export class MetadataController {
    constructor(private readonly metadataService: MetadataService) {}

    @Get('retrieve')
    async retrieveMetadata(@Req() request: Request): Promise<any> {
        console.log('Retrieving metadata for request:', request);
        let apexClasses = await this.metadataService.retrieveMetadata(request);
        const apexCode = [
        `
            public class HelloWorld {
                private string name;
                public Integer count;

                public void sayHello(String who) {
                    // Some logic here
                }
            }
        `,
        `
            public class DummyClass {
                private HelloWorld helloWorldInstance;
                
                public DummyClass() {
                    this.helloWorldInstance = new HelloWorld();
                }
                
                public void doSomething() {
                    helloWorldInstance.sayHello('World');
                }
                
                public HelloWorld getHelloWorld() {
                    return helloWorldInstance;
                }
            }
        `,
        `
            public interface Printable {
                void print();
                String getContent();
            }
        `,
        `
            public interface Serializable {
                String serialize();
                void deserialize(String data);
            }
        `,
        `
            public class Document implements Printable, Serializable {
                private String content;
                private String title;
                
                public Document(String title, String content) {
                    this.title = title;
                    this.content = content;
                }
                
                public void print() {
                    System.debug('Printing: ' + title);
                }
                
                public String getContent() {
                    return content;
                }
                
                public String serialize() {
                    return title + '|' + content;
                }
                
                public void deserialize(String data) {
                    String[] parts = data.split('\\|');
                    if (parts.length == 2) {
                        this.title = parts[0];
                        this.content = parts[1];
                    }
                }
            }
        `,
        `
            public class Report extends Document {
                private List<String> dataPoints;
                
                public Report(String title, String content) {
                    super(title, content);
                    this.dataPoints = new List<String>();
                }
                
                public void addDataPoint(String point) {
                    dataPoints.add(point);
                }
                
                public List<String> getDataPoints() {
                    return dataPoints;
                }
            }
        `];
        return JSON.parse(generateD3Json(apexClasses));
    }
}
