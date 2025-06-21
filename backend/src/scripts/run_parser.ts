import { parseApexToUml } from './parseApex';
import { generateD3Json } from './generateD3Json'

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
    `];

const mermaidDiagram = generateD3Json(apexCode);

console.log("--- Mermaid UML Diagram ---");
console.log(mermaidDiagram);
console.log("--------------------------");
console.log("You can paste the above output into a Mermaid renderer to see the diagram."); 
