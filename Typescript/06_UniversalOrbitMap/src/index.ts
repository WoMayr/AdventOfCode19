import * as d3 from "d3";
import { tree, hierarchy } from "d3-hierarchy"

import rawInput from "./input";
import { output, run, graphContainer } from "./pageObjects";

class Planet {
    parent: Planet;

    moons: Planet[] = [];

    constructor(public name: string) { }
}

function printMap(center: Planet) {
    const width = 2000;
    const height = 1000;
    const planetHierachy = hierarchy(center, p => p.moons);
    const planetTree = tree()
        .size([height, width]);
    const root: d3.HierarchyPointNode<Planet> = planetTree(planetHierachy) as any;
    const dx = 10;
    const dy = width / (root.height + 1);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // const nodes = planetTree(root).descendants;
    // const links = root.links();

    const svg = d3.create("svg")
        .attr("viewBox", [-20, 0, width + 80, x1 - x0 + dx * 2] as any)
        .attr("width", width);

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${dy / 3},${dx - x0})`);

    const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x) as any);

    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);;

    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");

    graphContainer.append(svg.node());
}

function countOrbitsOfPlanet(planet: Planet): number {
    let i = 0;

    let current = planet.parent;
    while (current) {
        i++;
        current = current.parent;
    }

    return i;
}

function countOrbits(planets: Planet[]): number {
    let orbits = 0;

    for (const planet of planets) {
        orbits += countOrbitsOfPlanet(planet)
    }

    return orbits;
}

function findPathToSanta(planetMap: Map<string, Planet>): number {
    const start = planetMap.get("YOU");
    const end = planetMap.get("SAN");

    const startToCom = [];

    let current = start;
    while (current) {
        startToCom.push(current.name);
        current = current.parent;
    }

    current = end;
    let i = 0;
    while (current) {
        const crossPointIdx = startToCom.indexOf(current.name);
        if (crossPointIdx >= 0) {
            return i + crossPointIdx - 2;
        }
        current = current.parent;
        i++;
    }
}

function main() {
    const input = rawInput
        .split('\n')
        .map(line => line.split(')'));

    // Code here
    const planets = input
        .reduce(
            (acc, val) => {
                for (const planet of val) {
                    if (acc.indexOf(planet) === -1) {
                        acc.push(planet);
                    }
                }
                return acc;
            },
            [])
        .map(planetName => new Planet(planetName));
    console.log("List of planets: ", planets);

    const planetMap = new Map<string, Planet>();
    for (const planet of planets) {
        planetMap.set(planet.name, planet);
    }

    for (const [planetName, orbiterName] of input) {
        const planet = planetMap.get(planetName);
        const orbiter = planetMap.get(orbiterName);

        planet.moons.push(orbiter);
        orbiter.parent = planet;
    }
    let root: Planet = undefined;
    for (const planet of planets) {
        if (!planet.parent) {
            root = planet;
            break;
        }
    }

    printMap(root);

    // output.textContent = countOrbits(planets).toString();

    output.textContent = findPathToSanta(planetMap).toString();
}

run.addEventListener("click", () => main());
