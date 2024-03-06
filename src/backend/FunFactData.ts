//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

import { getData } from '../utils/SystemUtils';
import { prisma } from './backend';
import { CronJob } from 'cron';

const REPO = "partly-sane-skies-public-data";
const OWNER = "PartlySaneStudios";
const FILE_PATH = "data/constants/fun_facts.json";

export async function getDailyFunFact(): Promise<string> {
    try {
        await prisma.$connect();
        let foundData = await prisma.funFact.findFirst({
            where: {
                isTodaysFact: true
            }
        })

        if (foundData == null) {
            foundData = await prisma.funFact.findFirst({
                where: {
                    id: 1
                }
            })
        }
        await prisma.$disconnect();

        return foundData?.fact ?? "No fun fact found";
    } catch (error) {
        console.error("Error fetching daily fun fact:", error);
        return "Error fetching fun fact";
    }
}

export async function handleDailyFunFact(): Promise<void> {
    try {
        console.log("Fetching fun facts...");

        // Find the fun facts ordered by id
        const funFacts = await prisma.funFact.findMany({
            orderBy: {
                id: "asc"
            }
        });

        if (funFacts.length > 0) {
            // Get previous funfact index
            const previousFactIndex = funFacts.find(fact => fact.isTodaysFact)?.id ?? 0;

            await prisma.$connect();
            // Set all isTodayFact to false
            await prisma.funFact.updateMany({
                where: {
                    isTodaysFact: true
                },
                data: {
                    isTodaysFact: false
                }
            });
            await prisma.$disconnect();

            // Set the next fun fact to true
            const nextFunFactId = previousFactIndex + 1 > funFacts.length ? 0 : previousFactIndex + 1;

            console.log(`Setting fun fact ${nextFunFactId} as today's fact`)

            await prisma.$connect();
            await prisma.funFact.update({
                where: {
                    id: nextFunFactId
                },
                data: {
                    isTodaysFact: true
                }
            });
            await prisma.$disconnect();

            console.log(`Daily fun fact updated for ${new Date().toLocaleDateString()}`);
        }
    } catch (error) {
        console.error("Error updating daily fun fact:", error);
    }
}

export async function loadFunFactData(override: boolean = false): Promise<void> {
    const funFacts = await prisma.funFact.findMany();
    if (funFacts.length == 0 || override) {
        // Clear old fun facts
        await prisma.$connect();
        await prisma.funFact.deleteMany({});
        await prisma.$disconnect();

        console.log("No fun facts found. Loading from repo...");
        const rawFunFactData = await getData(FILE_PATH, OWNER, REPO);

        try {
            const funFactData = JSON.parse(rawFunFactData);
            const factsArray = funFactData["facts"];

            await prisma.$connect();
            for (const fact of factsArray) {
                await prisma.funFact.create({
                    data: {
                        id: factsArray.indexOf(fact) + 1,
                        fact: fact,
                        isTodaysFact: false
                    }
                });
            }
            await prisma.$disconnect();
            console.log(`${factsArray.length} Fun facts loaded from Repo.`);
        } catch (error) {
            console.error("Error loading fun facts from repo:", error);
        }
    }
}

const dailyFunFact = new CronJob(
    '0 0 0 * * *',
    //'*/60 * * * * *',
    async () => {
        await loadFunFactData();
        await handleDailyFunFact();
    },
    null,
    true,
    'America/New_York'
);