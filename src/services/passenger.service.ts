import bcrypt from 'bcryptjs';
import { passengerRepository } from '../repositories/passenger.repository';
import { signPassengerToken } from '../utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

const SALT_ROUNDS = 12;

export interface PassengerRegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface PassengerLoginInput {
  email: string;
  password: string;
}

export const passengerService = {
  async register(input: PassengerRegisterInput) {
    const existing = await passengerRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A passenger with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const passenger = await passengerRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    const token = signPassengerToken({
      id: passenger.id,
      email: passenger.email,
      type: 'PASSENGER',
    });

    return {
      token,
      passenger: {
        id: passenger.id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        createdAt: passenger.createdAt,
        updatedAt: passenger.updatedAt,
      },
    };
  },

  async login(input: PassengerLoginInput) {
    const passenger = await passengerRepository.findByEmail(input.email);
    if (!passenger) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, passenger.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signPassengerToken({
      id: passenger.id,
      email: passenger.email,
      type: 'PASSENGER',
    });

    return {
      token,
      passenger: {
        id: passenger.id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        createdAt: passenger.createdAt,
        updatedAt: passenger.updatedAt,
      },
    };
  },

  async getProfile(passengerId: string) {
    const passenger = await passengerRepository.findById(passengerId);
    if (!passenger) {
      throw new NotFoundError('Passenger');
    }
    return passenger;
  },
};
