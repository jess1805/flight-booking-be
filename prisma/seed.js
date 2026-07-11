"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const embedding_service_1 = require("../src/services/embedding.service");
const prisma = new client_1.PrismaClient();
const CHUNK_STRATEGIES = [
    { name: 'small', maxChars: 120 },
    { name: 'large', maxChars: 400 },
];
async function ingestFeedback() {
    const filePath = path_1.default.join(__dirname, '../data/customer_feedback.json');
    const raw = fs_1.default.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(raw);
    await prisma.feedbackChunk.deleteMany();
    const allChunks = [];
    for (const record of records) {
        const baseText = `Flight ${record.flightNumber} (${record.airline}) on ${record.travelDate}. Category: ${record.category}. Rating: ${record.rating}/5. Feedback: ${record.comments}`;
        for (const strategy of CHUNK_STRATEGIES) {
            const chunks = (0, embedding_service_1.chunkText)(baseText, strategy.maxChars);
            for (const chunk of chunks) {
                allChunks.push({
                    sourceId: record.id,
                    content: chunk,
                    embedding: (0, embedding_service_1.embedText)(chunk),
                    chunkStrategy: strategy.name,
                    flightNumber: record.flightNumber,
                    airline: record.airline,
                    travelDate: new Date(record.travelDate),
                    rating: record.rating,
                    category: record.category,
                    metadata: {
                        sourceId: record.id,
                        flightNumber: record.flightNumber,
                        airline: record.airline,
                        travelDate: record.travelDate,
                        rating: record.rating,
                        category: record.category,
                        chunkStrategy: strategy.name,
                    },
                });
            }
        }
    }
    // Prefer large chunks for retrieval queries; small chunks remain for quality comparison
    const largeChunks = allChunks.filter((c) => c.chunkStrategy === 'large');
    await prisma.feedbackChunk.createMany({ data: largeChunks });
    console.log(`Ingested ${largeChunks.length} large-strategy chunks from ${records.length} feedback records.`);
    console.log(`Also generated ${allChunks.filter((c) => c.chunkStrategy === 'small').length} small-strategy chunks for comparison (not stored by default).`);
}
async function seedUsersAndFlights(adminId) {
    const flights = [
        {
            flightNumber: 'AI-203',
            airline: 'Air India',
            origin: 'DEL',
            destination: 'BOM',
            departureTime: new Date('2026-06-15T08:00:00Z'),
            arrivalTime: new Date('2026-06-15T10:15:00Z'),
            totalSeats: 180,
            availableSeats: 180,
            createdById: adminId,
        },
        {
            flightNumber: '6E-441',
            airline: 'IndiGo',
            origin: 'BLR',
            destination: 'HYD',
            departureTime: new Date('2025-12-20T14:30:00Z'),
            arrivalTime: new Date('2025-12-20T15:45:00Z'),
            totalSeats: 220,
            availableSeats: 220,
            createdById: adminId,
        },
    ];
    for (const flight of flights) {
        const existing = await prisma.flight.findFirst({
            where: { flightNumber: flight.flightNumber },
        });
        if (!existing) {
            await prisma.flight.create({ data: flight });
        }
    }
}
async function main() {
    const adminEmail = 'admin@airline.com';
    const customerEmail = 'customer@example.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: await bcryptjs_1.default.hash('AdminPass123!', 12),
            role: 'AIRLINE_ADMIN',
        },
    });
    await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
            email: customerEmail,
            passwordHash: await bcryptjs_1.default.hash('CustomerPass123!', 12),
            role: 'CUSTOMER',
        },
    });
    await seedUsersAndFlights(admin.id);
    await ingestFeedback();
    console.log('Seed complete.');
    console.log('Admin login: admin@airline.com / AdminPass123!');
    console.log('Customer login: customer@example.com / CustomerPass123!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map