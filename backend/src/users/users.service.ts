// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';  // Import User Entity

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,  // Inject User Repository
  ) {}

  // Method to find user by email
  async findByEmail(email: string): Promise<User | null> {  // Allow null to be returned
    return this.userRepository.findOne({ where: { email } });  // This may return null if no user is found
  }

  
  // Method to create a user
  async createUser(email: string, password: string): Promise<User> {
    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }
}
