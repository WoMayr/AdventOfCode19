import { Dictionary } from "lodash";
import _sum from "lodash-es/sum";

import rawInput from "./input";
import { output, run } from "./pageObjects";

enum Direction {
    Up = "U".charCodeAt(0),
    Right = "R".charCodeAt(0),
    Down = "D".charCodeAt(0),
    Left = "L".charCodeAt(0)
}

interface WirePath {
    direction: Direction;
    length: number;
}

interface Point {
    x: number;
    y: number;
}

function readWireInput(input: string): WirePath[] {
    return input
        .split(",")
        .map(x => ({
            length: +(x.substr(1)),
            direction: x.charCodeAt(0)
        }));
}

function placeWires(area: Map<string, Dictionary<number>>, wire: WirePath[], name: string): Point[] {
    let x = 0,
        y = 0,
        steps = 0;

    let intersections: Point[] = [];

    for (const step of wire) {
        for (let i = 0; i < step.length; i++) {
            // Check for intersection
            const key = `${x}_${y}`;
            let field = area.get(key);
            if (!field) {
                field = {};
                area.set(key, field);
            }

            if (!field[name]) {
                field[name] = steps;
            }

            if (Object.keys(field).filter(x => x !== name).length > 0) {
                intersections.push({ x, y });
            }

            // Step forward
            if (step.direction === Direction.Up) {
                y++;
            } else if (step.direction === Direction.Right) {
                x++;
            } else if (step.direction === Direction.Down) {
                y--;
            } else if (step.direction === Direction.Left) {
                x--;
            }
            steps++;
        }
    }

    return intersections;
}

function main() {
    const input = rawInput
        .split('\n');

    // Code here
    const wires = input.map(wireDesc => readWireInput(wireDesc));
    const [wire1, wire2] = wires;

    const occupiedPlaces = new Map<string, Dictionary<number>>();

    placeWires(occupiedPlaces, wire1, "wire1");
    const intersections = placeWires(occupiedPlaces, wire2, "wire2");

    let minDistance = -1;

    // for (const point of intersections) {
    //     if (point.x === 0 && point.y === 0) {
    //         continue;
    //     }

    //     const dist = Math.abs(point.x) + Math.abs(point.y);
    //     if (minDistance < 0 || dist < minDistance) {
    //         minDistance = dist;
    //     }
    // }

    for (const point of intersections) {
        if (point.x === 0 && point.y === 0) {
            continue;
        }

        const { x, y } = point;
        const key = `${x}_${y}`;
        const field = occupiedPlaces.get(key);
        const dist = _sum(Object.values(field));
        if (minDistance < 0 || dist < minDistance) {
            minDistance = dist;
        }
    }

    output.textContent = minDistance.toString();;
}

run.addEventListener("click", () => main());
