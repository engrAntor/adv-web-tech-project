// Seed script to create a test certificate for development
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Certificate } from "../certificates/certificate.entity";
import { Progress, ProgressStatus } from "../progress/progress.entity";
import { User } from "../users/users.entity";
import { Course } from "../courses/courses.entity";
import { randomBytes } from "crypto";

config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "adv_web_tech_db",
  entities: [Certificate, Progress, User, Course],
  synchronize: false,
});

async function seedCertificate() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const userRepo = AppDataSource.getRepository(User);
    const courseRepo = AppDataSource.getRepository(Course);
    const progressRepo = AppDataSource.getRepository(Progress);
    const certificateRepo = AppDataSource.getRepository(Certificate);

    // Get first user (or create one)
    let user = await userRepo.findOne({ where: { email: "test@test.com" } });
    if (!user) {
      user = await userRepo.findOne({ where: {} });
    }

    if (!user) {
      console.log("No users found. Please create a user first.");
      return;
    }

    console.log(`Using user: ${user.email} (ID: ${user.id})`);

    // Get first course
    const course = await courseRepo.findOne({
      where: { isPublished: true },
      relations: ["instructor"],
    });

    if (!course) {
      console.log("No courses found.");
      return;
    }

    console.log(`Using course: ${course.title} (ID: ${course.id})`);

    // Create or update progress as completed
    let progress = await progressRepo.findOne({
      where: { userId: user.id, courseId: course.id },
    });

    if (!progress) {
      progress = progressRepo.create({
        userId: user.id,
        courseId: course.id,
        status: ProgressStatus.COMPLETED,
        completionPercentage: 100,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    } else {
      progress.status = ProgressStatus.COMPLETED;
      progress.completionPercentage = 100;
      progress.completedAt = new Date();
    }

    await progressRepo.save(progress);
    console.log("Progress marked as completed");

    // Check if certificate already exists
    let certificate = await certificateRepo.findOne({
      where: { userId: user.id, courseId: course.id },
    });

    if (!certificate) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = randomBytes(4).toString("hex").toUpperCase();
      const certificateCode = `CERT-${timestamp}-${random}`;

      certificate = certificateRepo.create({
        certificateCode,
        userId: user.id,
        courseId: course.id,
        studentName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email,
      });
      await certificateRepo.save(certificate);
      console.log("Certificate created!");
    } else {
      console.log("Certificate already exists");
    }

    console.log("\n========================================");
    console.log("TEST CERTIFICATE CREATED SUCCESSFULLY!");
    console.log("========================================");
    console.log(`Certificate ID: ${certificate.id}`);
    console.log(`Certificate Code: ${certificate.certificateCode}`);
    console.log(`Student: ${certificate.studentName}`);
    console.log(`Course: ${course.title}`);
    console.log("");
    console.log("View at:");
    console.log(`  http://localhost:3001/certificates/${certificate.id}`);
    console.log("");
    console.log("Verify at:");
    console.log(
      `  http://localhost:3001/certificates/verify?code=${certificate.certificateCode}`,
    );
    console.log("========================================\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedCertificate();
