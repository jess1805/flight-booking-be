"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const feedback_repository_1 = require("../src/repositories/feedback.repository");
const embedding_service_1 = require("../src/services/embedding.service");
const prisma_1 = require("../src/utils/prisma");
const logger_1 = require("../src/utils/logger");
const STRATEGIES = [
    { name: 'small', maxChars: 120 },
    { name: 'large', maxChars: 400 },
];
async function run(strategy = 'large') {
    const filePath = path_1.default.resolve(__dirname, '../data/customer_feedback.json');
    const records = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
    await feedback_repository_1.feedbackRepository.deleteAll();
    const selected = strategy === 'both' ? STRATEGIES : STRATEGIES.filter((s) => s.name === strategy);
    const chunks = [];
    for (const record of records) {
        const text = `Flight ${record.flightNumber} (${record.airline}) on ${record.travelDate}. Category: ${record.category}. Rating: ${record.rating}/5. Feedback: ${record.comments}`;
        for (const { name, maxChars } of selected) {
            for (const content of (0, embedding_service_1.chunkText)(text, maxChars)) {
                chunks.push({
                    sourceId: record.id,
                    content,
                    embedding: (0, embedding_service_1.embedText)(content),
                    chunkStrategy: name,
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
                        chunkStrategy: name,
                    },
                });
            }
        }
    }
    const count = await feedback_repository_1.feedbackRepository.insertMany(chunks);
    logger_1.logger.info('Feedback ingestion complete', { strategy, records: records.length, chunks: count });
}
const strategyArg = process.argv[2] ?? 'large';
run(strategyArg)
    .catch((error) => {
    logger_1.logger.error('Ingestion failed', { message: error instanceof Error ? error.message : 'unknown' });
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=ingest-feedback.js.map