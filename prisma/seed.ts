import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const managers = [
  { email: 'manager1@airport.com', password: 'ManagerPass1!' },
  { email: 'manager2@airport.com', password: 'ManagerPass2!' },
];

const staff = [
  { email: 'staff1@airport.com', password: 'StaffPass1!' },
  { email: 'staff2@airport.com', password: 'StaffPass2!' },
];

const passengers = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'Passenger1!', phone: '9876543210' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'Passenger2!', phone: '9876543211' },
  { name: 'Carol Davis', email: 'carol@example.com', password: 'Passenger3!', phone: '9876543212' },
  { name: 'David Wilson', email: 'david@example.com', password: 'Passenger4!', phone: '9876543213' },
  { name: 'Eva Martinez', email: 'eva@example.com', password: 'Passenger5!', phone: '9876543214' },
  { name: 'Frank Brown', email: 'frank@example.com', password: 'Passenger6!', phone: '9876543215' },
  { name: 'Grace Lee', email: 'grace@example.com', password: 'Passenger7!', phone: '9876543216' },
  { name: 'Henry Taylor', email: 'henry@example.com', password: 'Passenger8!', phone: '9876543217' },
  { name: 'Ivy Anderson', email: 'ivy@example.com', password: 'Passenger9!', phone: '9876543218' },
  { name: 'Jack Thomas', email: 'jack@example.com', password: 'Passenger10!', phone: '9876543219' },
];

const flights = [
  {
    flightNumber: 'AI-101',
    airline: 'Air India',
    origin: 'DEL',
    destination: 'BOM',
    gate: 'A12',
    departureTime: new Date('2026-07-15T06:00:00Z'),
    arrivalTime: new Date('2026-07-15T08:15:00Z'),
    totalSeats: 180,
    availableSeats: 175,
  },
  {
    flightNumber: 'AI-102',
    airline: 'Air India',
    origin: 'BOM',
    destination: 'DEL',
    gate: 'B3',
    departureTime: new Date('2026-07-15T10:00:00Z'),
    arrivalTime: new Date('2026-07-15T12:15:00Z'),
    totalSeats: 180,
    availableSeats: 180,
  },
  {
    flightNumber: '6E-201',
    airline: 'IndiGo',
    origin: 'BLR',
    destination: 'HYD',
    gate: 'C7',
    departureTime: new Date('2026-07-16T09:30:00Z'),
    arrivalTime: new Date('2026-07-16T10:45:00Z'),
    totalSeats: 220,
    availableSeats: 218,
  },
  {
    flightNumber: '6E-202',
    airline: 'IndiGo',
    origin: 'HYD',
    destination: 'BLR',
    gate: 'D2',
    departureTime: new Date('2026-07-16T14:00:00Z'),
    arrivalTime: new Date('2026-07-16T15:15:00Z'),
    totalSeats: 220,
    availableSeats: 220,
  },
  {
    flightNumber: 'SG-301',
    airline: 'SpiceJet',
    origin: 'DEL',
    destination: 'BLR',
    gate: 'E5',
    departureTime: new Date('2026-07-17T07:00:00Z'),
    arrivalTime: new Date('2026-07-17T09:30:00Z'),
    totalSeats: 150,
    availableSeats: 148,
  },
  {
    flightNumber: 'SG-302',
    airline: 'SpiceJet',
    origin: 'BLR',
    destination: 'DEL',
    gate: 'F1',
    departureTime: new Date('2026-07-17T11:00:00Z'),
    arrivalTime: new Date('2026-07-17T13:30:00Z'),
    totalSeats: 150,
    availableSeats: 150,
  },
  {
    flightNumber: 'UK-401',
    airline: 'Vistara',
    origin: 'BOM',
    destination: 'BLR',
    gate: 'G8',
    departureTime: new Date('2026-07-18T08:00:00Z'),
    arrivalTime: new Date('2026-07-18T09:45:00Z'),
    totalSeats: 200,
    availableSeats: 195,
  },
  {
    flightNumber: 'UK-402',
    airline: 'Vistara',
    origin: 'BLR',
    destination: 'BOM',
    gate: 'H4',
    departureTime: new Date('2026-07-18T16:00:00Z'),
    arrivalTime: new Date('2026-07-18T17:45:00Z'),
    totalSeats: 200,
    availableSeats: 200,
  },
  {
    flightNumber: 'G8-501',
    airline: 'Go First',
    origin: 'DEL',
    destination: 'HYD',
    gate: 'J2',
    departureTime: new Date('2026-07-19T05:30:00Z'),
    arrivalTime: new Date('2026-07-19T07:45:00Z'),
    totalSeats: 170,
    availableSeats: 168,
  },
  {
    flightNumber: 'G8-502',
    airline: 'Go First',
    origin: 'HYD',
    destination: 'DEL',
    gate: 'K6',
    departureTime: new Date('2026-07-19T18:00:00Z'),
    arrivalTime: new Date('2026-07-19T20:15:00Z'),
    totalSeats: 170,
    availableSeats: 170,
  },
  {
    flightNumber: 'AI-203',
    airline: 'Air India',
    origin: 'DEL',
    destination: 'CCU',
    gate: 'L3',
    departureTime: new Date('2026-07-20T12:00:00Z'),
    arrivalTime: new Date('2026-07-20T14:00:00Z'),
    totalSeats: 180,
    availableSeats: 179,
  },
  {
    flightNumber: '6E-303',
    airline: 'IndiGo',
    origin: 'BOM',
    destination: 'GOI',
    gate: 'M9',
    departureTime: new Date('2026-07-21T06:30:00Z'),
    arrivalTime: new Date('2026-07-21T07:30:00Z'),
    totalSeats: 220,
    availableSeats: 220,
  },
  {
    flightNumber: 'SG-303',
    airline: 'SpiceJet',
    origin: 'BLR',
    destination: 'MAA',
    gate: 'N1',
    departureTime: new Date('2026-07-22T10:00:00Z'),
    arrivalTime: new Date('2026-07-22T11:00:00Z'),
    totalSeats: 150,
    availableSeats: 149,
  },
  {
    flightNumber: 'UK-403',
    airline: 'Vistara',
    origin: 'DEL',
    destination: 'AMD',
    gate: 'P4',
    departureTime: new Date('2026-07-23T09:00:00Z'),
    arrivalTime: new Date('2026-07-23T10:30:00Z'),
    totalSeats: 200,
    availableSeats: 200,
  },
  {
    flightNumber: 'G8-503',
    airline: 'Go First',
    origin: 'HYD',
    destination: 'BLR',
    gate: 'Q7',
    departureTime: new Date('2026-07-24T13:00:00Z'),
    arrivalTime: new Date('2026-07-24T14:15:00Z'),
    totalSeats: 170,
    availableSeats: 167,
  },
  {
    flightNumber: 'AI-104',
    airline: 'Air India',
    origin: 'MAA',
    destination: 'DEL',
    gate: 'R2',
    departureTime: new Date('2026-07-25T15:00:00Z'),
    arrivalTime: new Date('2026-07-25T17:45:00Z'),
    totalSeats: 180,
    availableSeats: 180,
  },
  {
    flightNumber: '6E-204',
    airline: 'IndiGo',
    origin: 'GOI',
    destination: 'BOM',
    gate: 'S5',
    departureTime: new Date('2026-07-26T08:00:00Z'),
    arrivalTime: new Date('2026-07-26T09:00:00Z'),
    totalSeats: 220,
    availableSeats: 219,
  },
  {
    flightNumber: 'SG-304',
    airline: 'SpiceJet',
    origin: 'AMD',
    destination: 'BOM',
    gate: 'T8',
    departureTime: new Date('2026-07-27T11:30:00Z'),
    arrivalTime: new Date('2026-07-27T13:00:00Z'),
    totalSeats: 150,
    availableSeats: 150,
  },
];

async function seedAdmins() {
  for (const manager of managers) {
    await prisma.admin.upsert({
      where: { email: manager.email },
      update: {},
      create: {
        email: manager.email,
        passwordHash: await bcrypt.hash(manager.password, SALT_ROUNDS),
        role: Role.MANAGER,
      },
    });
  }

  for (const member of staff) {
    await prisma.admin.upsert({
      where: { email: member.email },
      update: {},
      create: {
        email: member.email,
        passwordHash: await bcrypt.hash(member.password, SALT_ROUNDS),
        role: Role.STAFF,
      },
    });
  }
}

async function seedPassengers() {
  const created = [];
  for (const passenger of passengers) {
    const record = await prisma.passenger.upsert({
      where: { email: passenger.email },
      update: {},
      create: {
        name: passenger.name,
        email: passenger.email,
        passwordHash: await bcrypt.hash(passenger.password, SALT_ROUNDS),
        phone: passenger.phone,
      },
    });
    created.push(record);
  }
  return created;
}

async function seedFlights() {
  const created = [];
  for (const flight of flights) {
    const existing = await prisma.flight.findFirst({
      where: { flightNumber: flight.flightNumber },
    });

    if (existing) {
      created.push(existing);
      continue;
    }

    const record = await prisma.flight.create({ data: flight });
    created.push(record);
  }
  return created;
}

async function seedBookings(
  passengerRecords: { id: string }[],
  flightRecords: { id: string; availableSeats: number }[]
) {
  const sampleBookings = [
    { passengerIndex: 0, flightIndex: 0, seatNumber: 12 },
    { passengerIndex: 1, flightIndex: 0, seatNumber: 13 },
    { passengerIndex: 2, flightIndex: 2, seatNumber: 5 },
    { passengerIndex: 3, flightIndex: 4, seatNumber: 22 },
    { passengerIndex: 4, flightIndex: 6, seatNumber: 8 },
    { passengerIndex: 5, flightIndex: 8, seatNumber: 15 },
    { passengerIndex: 6, flightIndex: 10, seatNumber: 30 },
    { passengerIndex: 7, flightIndex: 12, seatNumber: 7 },
    { passengerIndex: 8, flightIndex: 14, seatNumber: 44 },
    { passengerIndex: 9, flightIndex: 16, seatNumber: 19 },
    { passengerIndex: 0, flightIndex: 3, seatNumber: 50 },
    { passengerIndex: 1, flightIndex: 5, seatNumber: 11, status: BookingStatus.CANCELLED },
  ];

  for (const sample of sampleBookings) {
    const passenger = passengerRecords[sample.passengerIndex];
    const flight = flightRecords[sample.flightIndex];
    const status = sample.status ?? BookingStatus.CONFIRMED;

    const existing = await prisma.booking.findFirst({
      where: {
        passengerId: passenger.id,
        flightId: flight.id,
        seatNumber: sample.seatNumber,
      },
    });

    if (existing) continue;

    await prisma.booking.create({
      data: {
        passengerId: passenger.id,
        flightId: flight.id,
        seatNumber: sample.seatNumber,
        status,
        cancelledAt: status === BookingStatus.CANCELLED ? new Date() : null,
      },
    });
  }
}

async function main() {
  logger.info('Starting database seed...');

  await seedAdmins();
  const passengerRecords = await seedPassengers();
  const flightRecords = await seedFlights();
  await seedBookings(passengerRecords, flightRecords);

  logger.info('Seed complete', {
    managers: managers.length,
    staff: staff.length,
    passengers: passengers.length,
    flights: flights.length,
  });

  logger.info('Sample credentials', {
    manager: 'manager1@airport.com / ManagerPass1!',
    staff: 'staff1@airport.com / StaffPass1!',
    passenger: 'alice@example.com / Passenger1!',
  });
}

main()
  .catch((error) => {
    logger.error('Seed failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
