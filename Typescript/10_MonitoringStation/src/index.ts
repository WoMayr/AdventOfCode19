import rawInput from "./input";
import { output, run, visual, visualizeIt } from "./pageObjects";

import _maxBy from "lodash-es/maxBy";

interface Asteroid {
    x: number;
    y: number;

    visible?: number;
    visibleAsteroids?: Map<number, AsteroidSightLine[]>;
}

interface AsteroidSightLine {
    distanceSqr: number;
    asteroid: Asteroid;
}

const asteroidChar = "#";

function findVisible(origin: Asteroid, asteroids: Asteroid[]): [number, Map<number, AsteroidSightLine[]>] {
    let count = 0;

    const visibleAsteroids = new Map<number, AsteroidSightLine[]>();

    for (const asteroid of asteroids) {
        if (asteroid === origin) {
            continue;
        }

        const dY = origin.y - asteroid.y;
        const dX = asteroid.x - origin.x;

        const rawAngle = Math.atan2(dY, dX);

        // Corrected angle (0 is up. clockwise)
        const angle = (Math.PI * 4 - (rawAngle - (Math.PI / 2))) % (Math.PI * 2)

        let sightLine = visibleAsteroids.get(angle);
        if (!sightLine) {
            sightLine = [];
            visibleAsteroids.set(angle, sightLine);

            count++;
        }

        sightLine.push({
            asteroid,
            distanceSqr: dX * dX + dY * dY
        });
    }

    for (const [angle, sightLines] of visibleAsteroids) {
        sightLines.sort((a, b) => a.distanceSqr - b.distanceSqr);
    }

    return [count, visibleAsteroids];
}

function visualizeStep(origin: Asteroid, asteroids: Asteroid[], target: Asteroid, vaporizedAsteroids: Set<Asteroid>) {
    while (visual.firstChild) {
        visual.removeChild(visual.firstChild);
    }

    let maxX = 0;
    let maxY = 0;

    for (const asteroid of asteroids) {
        if (asteroid.x > maxX) {
            maxX = asteroid.x;
        }
        if (asteroid.y > maxY) {
            maxY = asteroid.y;
        }
    }

    const laserElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    laserElement.setAttribute("x1", (origin.x * 10).toString());
    laserElement.setAttribute("y1", ((origin.y) * 10).toString());
    laserElement.setAttribute("x2", (target.x * 10).toString());
    laserElement.setAttribute("y2", ((target.y) * 10).toString());
    laserElement.setAttribute("stroke", "red");
    visual.appendChild(laserElement);

    for (const asteroid of asteroids) {
        let color = "black";
        if (asteroid === origin) {
            color = "blue";
        } else if (asteroid === target) {
            color = "red";
        } else if (vaporizedAsteroids.has(asteroid)) { 
            color = "lightgray";
        }

        const asteroidElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        asteroidElement.setAttribute("r", "4");
        asteroidElement.setAttribute("cx", (asteroid.x * 10).toString());
        asteroidElement.setAttribute("cy", ((asteroid.y) * 10).toString());
        asteroidElement.setAttribute("fill", color);
        visual.appendChild(asteroidElement);
    }

    visual.setAttribute("width", ((maxX + 1) * 10).toString());
    visual.setAttribute("height", ((maxY + 1) * 10).toString());
}

function timeout(delay = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function getVaporizedAsteroid(origin: Asteroid, asteroids: Asteroid[], visibleAsteroids: Map<number, AsteroidSightLine[]>, targetAsteroid: number): Promise<Asteroid> {

    const entries = [...visibleAsteroids.entries()];
    entries.sort((a, b) => a[0] - b[0]);

    const vaporizedAsteroid = new Set<Asteroid>();

    const visulize = visualizeIt.checked;

    let cnt = 0;
    let currentIndex = 0;

    let lastVaporized: Asteroid;
    while (cnt < targetAsteroid) {
        let target: Asteroid;
        let laserAngle: number;
        // get asteroid to vaporize
        while (!target) {
            const [, sightLine] = entries[currentIndex];
            laserAngle = entries[currentIndex][0];
            for (let i = 0; i < sightLine.length && !target; i++) {
                const item = sightLine[i].asteroid;
                if (!vaporizedAsteroid.has(item)) {
                    target = item;
                } else {
                    console.log("found already vaporized asteroid", item);
                }
            }

            currentIndex++;
        }

        lastVaporized = target;
        vaporizedAsteroid.add(target);
        cnt++;
        if (visulize) {
            visualizeStep(origin, asteroids, target, vaporizedAsteroid);
            await timeout(0);
        }
        console.log("vaporized", laserAngle, target);
    }

    return lastVaporized;
}

async function main() {
    const input = rawInput
        .split('\n')
        .map(x => x.split(""))

    // Code here
    output.textContent = input.map(line => line.join("")).join("\r\n");

    const asteroids: Asteroid[] = [];

    for (let y = 0; y < input.length; y++) {
        for (let x = 0; x < input[y].length; x++) {
            if (input[y][x] === asteroidChar) {
                asteroids.push({
                    x,
                    y
                });
            }
        }
    }

    const countArray = [];
    for (let i = 0; i < input.length; i++) {
        countArray.push(new Array(input[i].length).fill(undefined));
    }

    for (const asteroid of asteroids) {
        [asteroid.visible, asteroid.visibleAsteroids] = findVisible(asteroid, asteroids);
        countArray[asteroid.y][asteroid.x] = asteroid.visible;
    }
    output.textContent += "\r\n\r\n" + countArray.map(line => line.map(cnt => cnt ? cnt : ".").join("")).join("\r\n");

    const bestAsteroid = _maxBy(asteroids, a => a.visible);
    output.textContent += `\r\n\r\nBest result: ${bestAsteroid.x}/${bestAsteroid.y} with ${bestAsteroid.visible} asteroids`;

    const vaporizedAsteroid = await getVaporizedAsteroid(bestAsteroid, asteroids, bestAsteroid.visibleAsteroids, 200);
    output.textContent += `\r\n\r\n200th vaporized asteroid: ${vaporizedAsteroid.x}/${vaporizedAsteroid.y} (${vaporizedAsteroid.x * 100 + vaporizedAsteroid.y})`;
}

run.addEventListener("click", () => main());
