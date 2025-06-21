<template>
    <div>Success</div>
    <div>
        <button @click="handleClick" class="p-button p-component p-button-outlined">
            Retrieve Data
        </button>
    </div>
    <div ref="diagramContainer" class="diagram-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

// Define interfaces for type safety
interface UmlProperty {
  name: string;
  type: string;
  visibility: string;
}

interface UmlParameter {
  name: string;
  type: string;
}

interface UmlMethod {
  name: string;
  returnType: string;
  visibility: string;
  parameters: UmlParameter[];
}

interface UmlNode extends d3.SimulationNodeDatum {
  id: string;
  name:string;
  properties: UmlProperty[];
  methods: UmlMethod[];
  width: number;
  height: number;
}

interface ApiLink {
  source: string;
  target: string;
  type: string;
}

const diagramContainer = ref<HTMLDivElement | null>(null);

async function handleClick() {
    console.log('Button clicked!')
    const response = await fetch(`${process.env.VUE_APP_API_URL}/metadata/retrieve`, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    });
    const data = await response.json();
    renderUML(data);
}

function renderUML(data: { nodes: UmlNode[], links: ApiLink[] }) {
    if (!diagramContainer.value) return;

    // Clear previous diagram
    d3.select(diagramContainer.value).select('svg').remove();

    const { nodes, links } = data;
    if (!nodes || !links) return;

    // Define dimensions
    const containerWidth = diagramContainer.value.clientWidth;
    const containerHeight = window.innerHeight - diagramContainer.value.offsetTop - 30;
    const itemHeight = 20;
    const padding = 10;
    const nameHeight = 30;

    // Calculate node dimensions
    nodes.forEach((node: UmlNode) => {
        const propertiesHeight = (node.properties?.length || 0) * itemHeight + padding;
        const methodsHeight = (node.methods?.length || 0) * itemHeight + padding;
        node.width = 250; // a fixed width
        node.height = nameHeight + propertiesHeight + methodsHeight;
    });

    const svg = d3.select(diagramContainer.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .call(d3.zoom<SVGSVGElement, unknown>().on("zoom", function (event) {
           g.attr("transform", event.transform)
        }));
    
    const g = svg.append('g');

    // Add arrow heads
    g.append('defs').selectAll('marker')
        .data(['association', 'dependency', 'implementation', 'aggregation', 'composition'])
        .enter().append('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d => {
            switch(d) {
                case 'association': return 'M0,-5L10,0L0,5'; // solid arrow
                case 'dependency': return 'M0,-5L10,0L0,5'; // open arrow
                case 'implementation': return 'M0,-5L10,0L0,5Z'; // triangle
                case 'aggregation': return 'M-5,-5L0,0L-5,5L-10,0Z'; // diamond
                case 'composition': return 'M-5,-5L0,0L-5,5L-10,0Z'; // filled diamond
                default: return 'M0,-5L10,0L0,5';
            }
        })
        .attr('fill', d => d === 'composition' ? 'black' : 'none')
        .attr('stroke', 'black');


    const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('marker-end', (d: ApiLink) => `url(#arrow-${d.type})`)
        .style('stroke-dasharray', (d: ApiLink) => d.type === 'dependency' || d.type === 'implementation' ? '5,5' : 'none');

    const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes, (d: unknown) => (d as UmlNode).id)
        .enter().append('g')
        .attr('class', 'node');

    // Draw the UML class boxes for each node
    node.each(function(d: UmlNode) {
        const group = d3.select(this);

        // Class rectangle
        group.append('rect')
            .attr('width', d.width)
            .attr('height', d.height)
            .attr('fill', '#fcfcfc')
            .attr('stroke', 'black');

        // Class name
        group.append('text')
            .attr('x', d.width / 2)
            .attr('y', nameHeight / 2 + 5)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(d.name);

        // Separator after name
        group.append('line')
            .attr('x1', 0)
            .attr('y1', nameHeight)
            .attr('x2', d.width)
            .attr('y2', nameHeight)
            .attr('stroke', 'black');

        const visibilitySymbol = (visibility: string) => {
            if (!visibility) return '~'; // package private
            switch (visibility.toLowerCase()) {
                case 'public': return '+';
                case 'private': return '-';
                case 'protected': return '#';
                default: return '~';
            }
        };

        const propertiesHeight = (d.properties?.length || 0) * itemHeight + padding;

        if (d.properties?.length > 0) {
            const propertiesGroup = group.append('g')
                .attr('transform', `translate(0, ${nameHeight})`);

            propertiesGroup.selectAll('text')
                .data(d.properties)
                .enter()
                .append('text')
                .attr('x', padding)
                .attr('y', (prop: UmlProperty, i: number) => i * itemHeight + padding + 5)
                .text((prop: UmlProperty) => `${visibilitySymbol(prop.visibility)} ${prop.name}: ${prop.type}`);
            
            // Separator after properties
            group.append('line')
                .attr('x1', 0)
                .attr('y1', nameHeight + propertiesHeight)
                .attr('x2', d.width)
                .attr('y2', nameHeight + propertiesHeight)
                .attr('stroke', 'black');
        }

        if (d.methods?.length > 0) {
            const methodsGroup = group.append('g')
                .attr('transform', `translate(0, ${nameHeight + propertiesHeight})`);
                
            methodsGroup.selectAll('text')
                .data(d.methods)
                .enter()
                .append('text')
                .attr('x', padding)
                .attr('y', (method: UmlMethod, i: number) => i * itemHeight + padding + 5)
                .text((method: UmlMethod) => {
                    const params = (method.parameters || []).map((p: UmlParameter) => `${p.name}: ${p.type}`).join(', ');
                    return `${visibilitySymbol(method.visibility)} ${method.name}(${params}): ${method.returnType}`;
                });
        }
    });

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink<UmlNode, ApiLink>(links).id((d: UmlNode) => d.id).distance(250).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
        .force('collision', d3.forceCollide().radius((d: d3.SimulationNodeDatum) => Math.max((d as UmlNode).width, (d as UmlNode).height)/2 + 20 ).strength(0.9));

    const getIntersection = (source: any, target: any) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);

        const sx = source.x + (Math.abs(source.width / 2 * Math.cos(angle)) < Math.abs(dx) ? source.width / 2 * Math.cos(angle) : dx)
        const sy = source.y + (Math.abs(source.height / 2 * Math.sin(angle)) < Math.abs(dy) ? source.height / 2 * Math.sin(angle) : dy)

        const tx = target.x - (Math.abs(target.width / 2 * Math.cos(angle)) < Math.abs(dx) ? target.width / 2 * Math.cos(angle) : dx)
        const ty = target.y - (Math.abs(target.height / 2 * Math.sin(angle)) < Math.abs(dy) ? target.height / 2 * Math.sin(angle) : dy)

        const sourceBorderX = source.x + Math.sign(dx) * Math.min(Math.abs(dx), source.width/2);
        const sourceBorderY = source.y + Math.sign(dy) * Math.min(Math.abs(dy), source.height/2);

        let m = dy / dx;

        let x, y;
        const w = source.width/2;
        const h = source.height/2;

        if (Math.abs(dy) < h && Math.abs(dx) > w) { // top/bottom
            x = source.x + (dx > 0 ? w: -w)
            y = source.y + m * (x-source.x)
        } else { // sides
            y = source.y + (dy > 0 ? h: -h)
            x = source.x + (y - source.y) / m
        }


        return {x, y};
    }
    
    function getEdgePoint(node: UmlNode, nextNode: UmlNode) {
        const dx = nextNode.x! - node.x!;
        const dy = nextNode.y! - node.y!;

        const w = node.width / 2;
        const h = node.height / 2;

        if (dx === 0 && dy === 0) return {x: node.x!, y: node.y!};

        const slope = dy / dx;
        const absSlope = Math.abs(slope);

        let x,y;

        if (absSlope * w < h) { // intersects with left/right
            x = node.x! + (dx > 0 ? w : -w);
            y = node.y! + slope * (x - node.x!);
        } else { // intersects with top/bottom
            y = node.y! + (dy > 0 ? h : -h);
            x = node.x! + (y - node.y!) / slope;
        }
        return {x,y}
    }


    simulation.on('tick', () => {
        link
            .each(function(d) {
                const simLink = d as d3.SimulationLinkDatum<UmlNode>;
                const sourcePoint = getEdgePoint(simLink.source as UmlNode, simLink.target as UmlNode);
                const targetPoint = getEdgePoint(simLink.target as UmlNode, simLink.source as UmlNode);

                d3.select(this)
                    .attr('x1', sourcePoint.x)
                    .attr('y1', sourcePoint.y)
                    .attr('x2', targetPoint.x)
                    .attr('y2', targetPoint.y);
            });


        node
            .attr('transform', (d: UmlNode) => `translate(${d.x! - d.width/2}, ${d.y! - d.height/2})`);
    });

    function dragstarted(event: any, d: UmlNode) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x!;
        d.fy = d.y!;
    }

    function dragged(event: any, d: UmlNode) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event: any, d: UmlNode) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    node.call(d3.drag<SVGGElement, UmlNode>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
}

onMounted(async () => {
    /* const response = await fetch('http://localhost:3000/api/retrieve', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
        }
    }); */
})
</script>

<style scoped>
.diagram-container {
    margin-top: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
