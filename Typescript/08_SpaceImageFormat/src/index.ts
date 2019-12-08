import rawInput from "./input";
import { output, run } from "./pageObjects";

function outputImage(layers: number[][][]) {
    const container = document.createElement("div");
    container.classList.add("layer-container");

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const layerContainer = document.createElement("div");
        layerContainer.classList.add("layer", "layer-" + i);
        layerContainer.style.zIndex = (10 + layers.length - i).toString();
        const label = document.createElement("h3");
        label.textContent = `Layer ${i}: `
        layerContainer.appendChild(label);
        const layerTable = document.createElement("table");
        layerContainer.appendChild(layerTable);
        container.appendChild(layerContainer);

        for (let y = 0; y < layer[0].length; y++) {
            const row = document.createElement("tr");
            layerTable.appendChild(row);
            for (let x = 0; x < layer.length; x++) {
                const cell = document.createElement("td");
                row.appendChild(cell);
                const cellValue = layer[x][y];
                cell.textContent = cellValue.toString();
                cell.classList.add(`val-${cellValue}`);
            }
        }
    }

    return container;
}

function main() {
    const input = rawInput
        .split('')
        .map(x => +x)

    // Code here
    const width = 25;
    const height = 6;

    const pixelsPerLayer = width * height;
    const numberOfLayers = input.length / pixelsPerLayer;
    const layers: number[][][] = [];

    output.innerHTML = "";

    for (let i = 0; i < input.length; i++) {
        const layerIdx = Math.floor(i / pixelsPerLayer);
        const layerPixelIdx = i % pixelsPerLayer;

        const x = layerPixelIdx % width;
        const y = Math.floor(layerPixelIdx / width);

        if (layerIdx >= layers.length) {
            layers.push([]);
        }
        if (y === 0) {
            layers[layerIdx].push([]);
        }

        layers[layerIdx][x][y] = input[i];
    }

    output.appendChild(outputImage(layers));

    let minLayer = -1;
    let minLayerSum = Infinity;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const countOfZero = layer
            .reduce(
                (acc, col) => acc + col.reduce(
                    (colSum, cell) => colSum + (cell === 0 ? 1 : 0),
                    0),
                0);
        
        if (countOfZero < minLayerSum) {
            minLayer = i;
            minLayerSum = countOfZero;
        }
    }

    let countOne = 0,
        countTwo = 0;
    const minZeroLayer = layers[minLayer];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cell = minZeroLayer[x][y];
            if (cell === 1) {
                countOne++;
            } else if (cell === 2) {
                countTwo++;
            }
        }
    }

    const resultObj = document.createElement("div");
    resultObj.textContent = `Result: Layer ${minLayer} --> ${countOne * countTwo}`;
    resultObj.style.fontWeight = "bold";
    output.prepend(resultObj);
}

run.addEventListener("click", () => main());
