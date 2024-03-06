//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

import { getData } from '../utils/SystemUtils';
import { prisma } from './backend';

const START_TIME = Number(process.env.FUN_FACT_START_TIME) || 1709701200000;
const REPO = "partly-sane-skies-public-data";
const OWNER = "PartlySaneStudios";
const FILE_PATH = "data/constants/fun_facts.json";

export async function getDailyFunFact(): Promise<string> {
    try {
        await prisma.$connect();
        const funFactAmount = await prisma.funFact.count();
        const currentDay = Math.floor((Date.now() - START_TIME) / (1000 * 60 * 60 * 24)) // Days since start

        const foundData = (await prisma.funFact.findFirst({
            where: {
                day: currentDay % funFactAmount
            }
        })) ?? (await prisma.funFact.findFirst({}));

        await prisma.$disconnect();

        return foundData?.fact ?? "No fun fact found";
    } catch (error) {
        console.error("Error fetching daily fun fact:", error);
        return "Error fetching fun fact";
    }
}

export async function loadFunFactData(): Promise<void> {
    // Clear old fun facts
    await prisma.$connect();
    await prisma.funFact.deleteMany({});
    await prisma.$disconnect();

    console.log("Loading fun facts from repo...");
    const rawFunFactData = await getData(FILE_PATH, OWNER, REPO);

    try {
        const funFactData = JSON.parse(rawFunFactData);
        const factsArray = funFactData["facts"];

        await prisma.$connect();
        for (const fact of factsArray) {
            await prisma.funFact.create({
                data: {
                    day: factsArray.indexOf(fact),
                    fact: fact
                }
            });
        }
        await prisma.$disconnect();
        console.log(`${factsArray.length} Fun facts loaded from Repo.`);
    } catch (error) {
        console.error("Error loading fun facts from repo:", error);
    }
}