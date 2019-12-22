import * as d3 from "d3";
import { tree, hierarchy } from "d3-hierarchy"

import rawInput from "./input";
import { output, run, graphContainer } from "./pageObjects";

interface Recipe {
    resultName: string;
    resultAmount: number;

    usedIn?: Recipe[];

    ingredientsNames: string[];
    ingredientsAmounts: number[];
    ingredientsRecipes?: Recipe[];
}


function printMap(center: Recipe) {
    const width = 1800;
    const height = 1000;
    const RecipeHierachy = hierarchy(center, p => p.ingredientsRecipes);
    const RecipeTree = tree()
        .size([height, width]);
    const root: d3.HierarchyPointNode<Recipe> = RecipeTree(RecipeHierachy) as any;
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
        .attr("viewBox", [-20, 0, width + 200, x1 - x0 + dx * 2] as any)
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
        .text(d => d.data.resultName)
        .clone(true).lower()
        .attr("stroke", "white");

    graphContainer.append(svg.node());
}

function readRecipes(): Recipe[] {
    const recipeRegex = /^(.+) => (\d+) (\w+)$/;

    const input = rawInput
        .split('\n');

    const recipes: Recipe[] = input.map(line => {
        const match = line.match(recipeRegex);
        const inputs = match[1]
            .split(",")
            .map(x => x
                .trim()
                .split(" "))
            .map(([amount, name]) => [+amount, name]) as [number, string][];
        const resultName = match[3];
        const resultAmount = +match[2];

        return {
            resultName,
            resultAmount,
            ingredientsNames: inputs.map(([, name]) => name),
            ingredientsAmounts: inputs.map(([amount]) => amount),
        };
    });
    // Add ore recipe
    recipes.push({
        ingredientsAmounts: [],
        ingredientsNames: [],
        resultAmount: 1,
        resultName: "ORE"
    });

    for (const recipe of recipes) {
        recipe.ingredientsRecipes = recipe.ingredientsNames.map(name => recipes.find(x => x.resultName === name));
        recipe.usedIn = recipes.filter(r => r.ingredientsNames.indexOf(recipe.resultName) >= 0);
    }

    return recipes;
}

function tryCreateFuel(recipes: Recipe[], oreAmount: number, leftOvers: Map<string, number>, howMuch: number): number {
    const fuelRecipe = recipes.find(x => x.resultName === "FUEL");
    const ore = recipes.find(x => x.resultName === "ORE");

    const toCraftStack: [number, Recipe][] = [
        [howMuch, fuelRecipe]
    ];
    do {
        const [amount, recipe] = toCraftStack.shift();
        if (recipe === ore) {
            oreAmount += amount;
            continue;
        }

        // How many is left over from previous reactions
        let leftOver = leftOvers.get(recipe.resultName) || 0;

        if (leftOver >= amount) {
            // We actually got enough from a previous step
            leftOver -= amount;
            leftOvers.set(recipe.resultName, leftOver);
        } else {
            // We have to create new ones
            const howOften = Math.ceil((amount - leftOver) / recipe.resultAmount);

            // Push the parts to create into the queue
            for (let i = 0; i < recipe.ingredientsAmounts.length; i++) {
                const ingredientRecipe = recipe.ingredientsRecipes[i];
                const ingredientAmount = recipe.ingredientsAmounts[i];

                toCraftStack.push([howOften * ingredientAmount, ingredientRecipe]);
            }

            // Add any leftovers to the pile
            const createdAmount = howOften * recipe.resultAmount;
            leftOver += (createdAmount - amount);
            leftOvers.set(recipe.resultName, leftOver);
        }
    } while (toCraftStack.length > 0);

    return oreAmount;
}

function main() {
    // Code here
    const recipes = readRecipes();

    let leftOvers = new Map<string, number>();

    let oreAmount = 0;
    let fuelAmount = 0;

    // 1 Fuel costs ~ 612880
    let jump = 100000000;

    while (jump >= 1) {
        const newLeftOvers = new Map(leftOvers.entries());
        const newOreAmount = tryCreateFuel(recipes, oreAmount, newLeftOvers, jump);

        if (newOreAmount < 1000000000000) {
            fuelAmount += jump;
            oreAmount = newOreAmount;
            leftOvers = newLeftOvers;
        } else {
            jump = Math.floor(jump / 2);
        }
    }

    output.textContent = "Ore: " + oreAmount + "; Fuel: " + fuelAmount;

    // printMap(fuelRecipe);
}

run.addEventListener("click", () => main());
