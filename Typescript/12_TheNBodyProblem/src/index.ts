import rawInput from "./input";
import { output, run } from "./pageObjects";

import _zip from "lodash-es/zip";
import { leastCommonMultiple } from "./lcm";

const inputRegex = /^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/;

interface Point {
    x: number;
    y: number;
    z: number;
}

const pointZero = () => ({ x: 0, y: 0, z: 0 });

class Moon {
    constructor(
        public position: Point,
        public velocity: Point = pointZero()
    ) { }

    getPotentialEnergy() {
        return Math.abs(this.position.x) + Math.abs(this.position.y) + Math.abs(this.position.z);
    }
    getKineticEnergy() {
        return Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z);
    }
}

function performStep(moons: Moon[]) {
    // Apply gravity
    for (let i = 0; i < moons.length; i++) {
        for (let j = i + 1; j < moons.length; j++) {
            const moonA = moons[i];
            const moonB = moons[j];
            // console.log("Updating: ", [i, j]);

            if (moonA.position.x > moonB.position.x) {
                moonA.velocity.x -= 1;
                moonB.velocity.x += 1;
            } else if (moonA.position.x < moonB.position.x) {
                moonA.velocity.x += 1;
                moonB.velocity.x -= 1;
            }
            if (moonA.position.y > moonB.position.y) {
                moonA.velocity.y -= 1;
                moonB.velocity.y += 1;
            } else if (moonA.position.y < moonB.position.y) {
                moonA.velocity.y += 1;
                moonB.velocity.y -= 1;
            }
            if (moonA.position.z > moonB.position.z) {
                moonA.velocity.z -= 1;
                moonB.velocity.z += 1;
            } else if (moonA.position.z < moonB.position.z) {
                moonA.velocity.z += 1;
                moonB.velocity.z -= 1;
            }
        }
    }

    // Apply velocity
    for (const moon of moons) {
        moon.position.x += moon.velocity.x;
        moon.position.y += moon.velocity.y;
        moon.position.z += moon.velocity.z;
    }
}

function printPoint(point: Point, pad = 3) {
    const x = point.x.toString().padStart(pad, "    ");
    const y = point.y.toString().padStart(pad, "    ");
    const z = point.z.toString().padStart(pad, "    ");

    return `x=${x}, y=${y}, z=${z}`;
}

function printMoons(moons: Moon[]) {
    return moons.map(moon => {
        return `pos=<${printPoint(moon.position)}>, vel=<${printPoint(moon.velocity)}>`
    }).join("\r\n");
}

function main() {
    const input = rawInput
        .split('\n')
        .map(x => {
            const match = x.match(inputRegex);
            return new Moon({
                x: +match[1],
                y: +match[2],
                z: +match[3]
            });
        });

    // clone initial state
    const initialState = input.map(x => new Moon({ x: x.position.x, y: x.position.y, z: x.position.z }));

    // Code here
    output.textContent = "";
    // let minPeriod: number[] = new Array(input.length).fill(-1); // minPeriod.some(x => x === -1)
    for (let i = 0; i < 1000; i++) {
        performStep(input);

        // for (let a = 0; a < input.length; a++) {
        //     if (input[a].velocity.x === 0 && input[a].velocity.y === 0 && input[a].velocity.z === 0 &&
        //         input[a].position.x === initialState[a].position.x &&
        //         input[a].position.y === initialState[a].position.y &&
        //         input[a].position.z === initialState[a].position.z) {
        //         if (minPeriod[a] === -1) {
        //             console.log("Moon " + (a + 1) + " reached initial state after " + (i + 1) + " steps");
        //             minPeriod[a] = i + 1;
        //         }
        //     }
        // }
        // output.textContent += printMoons(input);
        // output.textContent += "\r\n\r\n";
    }
    console.log(minPeriod);
    const totalEnergy = input.reduce((acc, val) =>  acc + (val.getKineticEnergy() * val.getPotentialEnergy()), 0);
    output.textContent += "Total energy: " + totalEnergy;
    // output.textContent += "It matches after: " + leastCommonMultiple(minPeriod) + " ticks!";
}

run.addEventListener("click", () => main());
