import { CommonTokenStream } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {CaseInsensitiveInputStream} from 'apex-parser';
import { ApexLexer } from "../antlr/ApexLexer";
import { ApexParser, ClassDeclarationContext, FieldDeclarationContext, MethodDeclarationContext, ModifierContext } from "../antlr/ApexParser";
import { ApexParserVisitor } from "../antlr/ApexParserVisitor";

// --- Data Structures for UML ---
interface UmlClass {
    name: string;
    properties: UmlProperty[];
    methods: UmlMethod[];
}

interface UmlProperty {
    name: string;
    type: string;
    visibility: string;
}

interface UmlMethod {
    name: string;
    returnType: string;
    visibility: string;
    parameters: string[];
}

// --- Visitor to Extract Class Details ---
class UmlVisitor extends AbstractParseTreeVisitor<any> implements ApexParserVisitor<any> {
    private umlClass: UmlClass = { name: "Unknown", properties: [], methods: [] };
    private currentVisibility: string = "+"; // Default to public

    defaultResult() {
        return this.umlClass;
    }

    visitClassDeclaration = (ctx: ClassDeclarationContext) => {
        this.umlClass.name = ctx.id().text;
        this.visitChildren(ctx);
        return this.umlClass;
    }

    visitFieldDeclaration = (ctx: FieldDeclarationContext) => {
        const varType = ctx.typeRef().text;
        for (const declarator of ctx.variableDeclarators().variableDeclarator()) {
            this.umlClass.properties.push({
                name: declarator.id().text,
                type: varType,
                visibility: this.currentVisibility,
            });
        }
    }
    
    visitMethodDeclaration = (ctx: MethodDeclarationContext) => {
        const returnType = ctx.typeRef()?.text ?? (ctx.VOID() ? 'void' : 'unknown');
        const paramList = ctx.formalParameters()?.formalParameterList();
        const params = paramList?.formalParameter() ?? [];
        this.umlClass.methods.push({
            name: ctx.id().text,
            returnType: returnType,
            visibility: this.currentVisibility,
            parameters: params.map(p => {
                const paramType = p.typeRef();
                return paramType ? `${paramType.text} ${p.id().text}` : p.id().text;
            }),
        });
    }

    visitModifier = (ctx: ModifierContext) => {
        if (ctx.PUBLIC()) this.currentVisibility = "+";
        if (ctx.PRIVATE()) this.currentVisibility = "-";
        if (ctx.PROTECTED()) this.currentVisibility = "#";
        // Reset for next member
        if (ctx.parent?.ruleContext.ruleIndex === ApexParser.RULE_memberDeclaration) {
          this.currentVisibility = "+";
        }
    }
}

// --- Main Parsing Function ---
export function parseApexToUml(code: string): string {
    const lexer = new ApexLexer(new CaseInsensitiveInputStream('test.cls', code));
    const tokens = new CommonTokenStream(lexer);
    const parser = new ApexParser(tokens);
    const tree = parser.compilationUnit();

    const visitor = new UmlVisitor();
    const umlData = visitor.visit(tree);

    if (!umlData || umlData.name === "Unknown") {
        return "classDiagram\n  class Empty {}\n";
    }

    let mermaidString = "classDiagram\n";
    mermaidString += `  class ${umlData.name} {\n`;
    
    for (const prop of umlData.properties) {
        mermaidString += `    ${prop.visibility} ${prop.type} ${prop.name}\n`;
    }

    for (const method of umlData.methods) {
        mermaidString += `    ${method.visibility} ${method.name}(${method.parameters.join(', ')}) ${method.returnType}\n`;
    }
    
    mermaidString += "  }\n";
    return mermaidString;
}