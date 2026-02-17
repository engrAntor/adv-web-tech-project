// src/auth/auth.module.ts
import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("JWT_SECRET") || "your-jwt-secret",
        signOptions: { expiresIn: "24h" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
