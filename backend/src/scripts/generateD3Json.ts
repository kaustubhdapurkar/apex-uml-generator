import { CommonTokenStream } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import {CaseInsensitiveInputStream} from 'apex-parser';
import { ApexLexer } from "../antlr/ApexLexer";
import { ApexParser, ClassDeclarationContext, FieldDeclarationContext, MethodDeclarationContext, ModifierContext, TypeListContext, TypeRefContext } from "../antlr/ApexParser";
import { ApexParserVisitor } from "../antlr/ApexParserVisitor";

// --- Data Structures for D3.js ---
interface D3Graph {
    nodes: D3ClassNode[];
    links: D3Link[];
}

interface D3ClassNode {
    id: string; // class name
    name: string;
    properties: D3PropertyNode[];
    methods: D3MethodNode[];
    extends?: string;
    implements?: string[];
}

interface D3PropertyNode {
    name: string;
    type: string;
    visibility: 'public' | 'private' | 'protected';
}

interface D3MethodNode {
    name: string;
    returnType: string;
    visibility: 'public' | 'private' | 'protected';
    parameters: { name: string, type: string }[];
}

interface D3Link {
    source: string; // class name
    target: string; // class name
    type: 'inheritance' | 'implementation' | 'association' | 'dependency';
}

// --- Visitor to Extract Class Details ---
class D3JsonVisitor extends AbstractParseTreeVisitor<any> implements ApexParserVisitor<any> {
    private d3Class: D3ClassNode = { id: "Unknown", name: "Unknown", properties: [], methods: [] };
    private currentVisibility: 'public' | 'private' | 'protected' = "public";

    defaultResult() {
        return this.d3Class;
    }

    visitClassDeclaration = (ctx: ClassDeclarationContext) => {
        this.d3Class.name = ctx.id().text;
        this.d3Class.id = ctx.id().text;

        const extendsClause = ctx.typeRef();
        if (extendsClause) {
            this.d3Class.extends = this.getFullTypeName(extendsClause);
        }

        const implementsClause = ctx.typeList();
        if (implementsClause) {
            this.d3Class.implements = this.getFullTypeNames(implementsClause);
        }

        this.visitChildren(ctx);
        return this.d3Class;
    }

    visitFieldDeclaration = (ctx: FieldDeclarationContext) => {
        const varType = this.getFullTypeName(ctx.typeRef());
        for (const declarator of ctx.variableDeclarators().variableDeclarator()) {
            this.d3Class.properties.push({
                name: declarator.id().text,
                type: varType,
                visibility: this.currentVisibility,
            });
        }
    }
    
    visitMethodDeclaration = (ctx: MethodDeclarationContext) => {
        const returnTypeCtx = ctx.typeRef() ?? ctx.VOID();
        const returnType = returnTypeCtx ? (returnTypeCtx.text === 'void' ? 'void' : this.getFullTypeNameFromContext(returnTypeCtx)) : 'unknown';

        const paramList = ctx.formalParameters()?.formalParameterList();
        const params = paramList?.formalParameter() ?? [];
        this.d3Class.methods.push({
            name: ctx.id().text,
            returnType: returnType,
            visibility: this.currentVisibility,
            parameters: params.map(p => {
                const paramType = p.typeRef();
                return {
                    name: p.id().text,
                    type: paramType ? this.getFullTypeName(paramType) : 'unknown',
                };
            }),
        });
    }

    visitModifier = (ctx: ModifierContext) => {
        if (ctx.PUBLIC()) this.currentVisibility = "public";
        if (ctx.PRIVATE()) this.currentVisibility = "private";
        if (ctx.PROTECTED()) this.currentVisibility = "protected";
    }

    private getFullTypeName(typeRef: TypeRefContext): string {
        return typeRef.text;
    }

    private getFullTypeNameFromContext(ctx: any): string {
        if (ctx instanceof TypeRefContext) {
            return this.getFullTypeName(ctx);
        }
        return ctx.text;
    }

    private getFullTypeNames(typeList: TypeListContext): string[] {
        return typeList.typeRef().map(this.getFullTypeName);
    }
}

function extractClassNamesFromType(type: string, allClassNames: string[]): string[] {
    const foundNames: string[] = [];
    if (!type || type === 'void' || type === 'unknown') {
        return foundNames;
    }
    for (const className of allClassNames) {
        const regex = new RegExp(`\\b${className}\\b`);
        if (regex.test(type)) {
            foundNames.push(className);
        }
    }
    return foundNames;
}

// --- Main Parsing Function ---
export function generateD3Json(codes: string[]): string {
    const classes: D3ClassNode[] = [];
    const classNames: string[] = [];

    // First pass: parse all classes and get their basic structure
    for (const code of codes) {
        if(!code) continue;
        const lexer = new ApexLexer(new CaseInsensitiveInputStream('text.cls', code));
        const tokens = new CommonTokenStream(lexer);
        const parser = new ApexParser(tokens);
        const tree = parser.compilationUnit();

        const visitor = new D3JsonVisitor();
        const d3ClassData = visitor.visit(tree);
        if (d3ClassData && d3ClassData.name !== 'Unknown') {
            classes.push(d3ClassData);
            classNames.push(d3ClassData.name);
        }
    }

    // Second pass: determine relationships
    const links: D3Link[] = [];
    const linkSet = new Set<string>();

    for (const cls of classes) {
        // Inheritance
        if (cls.extends && classNames.includes(cls.extends)) {
            const linkKey = `${cls.name}->${cls.extends}:inheritance`;
            if (!linkSet.has(linkKey)) {
                links.push({ source: cls.name, target: cls.extends, type: 'inheritance' });
                linkSet.add(linkKey);
            }
        }

        // Implementation
        if (cls.implements) {
            for (const impl of cls.implements) {
                if (classNames.includes(impl)) {
                    const linkKey = `${cls.name}->${impl}:implementation`;
                    if (!linkSet.has(linkKey)) {
                        links.push({ source: cls.name, target: impl, type: 'implementation' });
                        linkSet.add(linkKey);
                    }
                }
            }
        }

        // Association from properties
        for (const prop of cls.properties) {
            const relatedClasses = extractClassNamesFromType(prop.type, classNames);
            for (const relatedClass of relatedClasses) {
                if (relatedClass !== cls.name) {
                    const linkKey = `${cls.name}->${relatedClass}:association`;
                    if (!linkSet.has(linkKey)) {
                        links.push({ source: cls.name, target: relatedClass, type: 'association' });
                        linkSet.add(linkKey);
                    }
                }
            }
        }

        // Dependency from method parameters and return types
        for (const method of cls.methods) {
            const returnTypeClasses = extractClassNamesFromType(method.returnType, classNames);
            for (const relatedClass of returnTypeClasses) {
                if (relatedClass !== cls.name) {
                    const linkKey = `${cls.name}->${relatedClass}:dependency`;
                    if (!linkSet.has(linkKey)) {
                        links.push({ source: cls.name, target: relatedClass, type: 'dependency' });
                        linkSet.add(linkKey);
                    }
                }
            }
            for (const param of method.parameters) {
                const paramTypeClasses = extractClassNamesFromType(param.type, classNames);
                for (const relatedClass of paramTypeClasses) {
                    if (relatedClass !== cls.name) {
                        const linkKey = `${cls.name}->${relatedClass}:dependency`;
                        if (!linkSet.has(linkKey)) {
                           links.push({ source: cls.name, target: relatedClass, type: 'dependency' });
                           linkSet.add(linkKey);
                        }
                    }
                }
            }
        }
    }
    
    const graph: D3Graph = {
        nodes: classes,
        links: links,
    };

    // Return the data as a nicely formatted JSON string
    return JSON.stringify(graph, null, 2);
}