// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';  // Import UsersService
import { JwtService } from '@nestjs/jwt';  // Import JwtService
import * as bcrypt from 'bcrypt';  // Import bcrypt for hashing passwords

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,  // Inject UsersService
    private jwtService: JwtService,  // Inject JwtService
  ) {}

  // Register new user (sign up)
  async register(email: string, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password
    const newUser = await this.usersService.createUser(email, hashedPassword);  // Create user in the database
    return this.generateToken(newUser);  // Generate and return JWT token for the user
  }

  // Login user (sign in)
  async login(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);  // Correct method name: findByEmail

    // Check if user is found
    if (!user) {
      throw new Error('Invalid credentials');  // If user not found, throw error
    }

    // Check if the passwords match
    const isMatch = await bcrypt.compare(password, user.password);  // Compare passwords
    if (!isMatch) {
      throw new Error('Invalid credentials');  // If passwords don't match, throw error
    }

    return this.generateToken(user);  // Generate and return JWT token for the user
  }

  // Helper method to generate JWT token
  private generateToken(user: any): any {
    const payload = { email: user.email, sub: user.id };  // JWT payload with user email and ID
    return {
      access_token: this.jwtService.sign(payload),  // Generate JWT token
    };
  }
}
