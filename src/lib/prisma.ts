import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }

    // Use Neon serverless adapter for Prisma 7
    // PrismaNeon accepts the connection config directly
    const adapter = new PrismaNeon({ connectionString: databaseUrl });

    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}