// src/seeds/seed-paid-courses.ts
import { DataSource } from 'typeorm';
import { Course, CourseCategory, CourseDifficulty } from '../courses/courses.entity';
import { User, UserRole } from '../users/users.entity';
import { Progress } from '../progress/progress.entity';
import { Certificate } from '../certificates/certificate.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Notification } from '../notifications/notification.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'adv_web_tech_db',
  entities: [Course, User, Progress, Certificate, Enrollment, Notification],
  synchronize: false,
});

const paidCourses = [
  {
    title: 'Complete React & Next.js Developer Course',
    description: 'Master React 18, Next.js 14, TypeScript, Redux Toolkit, and build production-ready applications. This comprehensive course covers everything from fundamentals to advanced patterns including Server Components, App Router, and deployment strategies.',
    syllabus: `Week 1: React Fundamentals
- JSX and Components
- Props and State
- Hooks (useState, useEffect, useRef)

Week 2: Advanced React
- Context API
- Custom Hooks
- Performance Optimization

Week 3: Next.js Basics
- File-based Routing
- API Routes
- Static and Dynamic Rendering

Week 4: Next.js Advanced
- App Router
- Server Components
- Server Actions

Week 5: State Management
- Redux Toolkit
- React Query
- Zustand

Week 6: Production & Deployment
- Testing
- CI/CD
- Vercel Deployment`,
    category: CourseCategory.WEB_DEVELOPMENT,
    difficulty: CourseDifficulty.INTERMEDIATE,
    duration: 2400, // 40 hours
    price: 79.99,
    isFree: false,
  },
  {
    title: 'Machine Learning A-Z: From Zero to Hero',
    description: 'Learn Machine Learning from scratch! This course covers supervised learning, unsupervised learning, deep learning with TensorFlow and PyTorch. Build real-world ML projects including image classification, NLP, and recommendation systems.',
    syllabus: `Module 1: Python for ML
- NumPy & Pandas
- Data Visualization
- Scikit-learn Basics

Module 2: Supervised Learning
- Linear Regression
- Logistic Regression
- Decision Trees & Random Forests

Module 3: Unsupervised Learning
- K-Means Clustering
- PCA
- Anomaly Detection

Module 4: Deep Learning
- Neural Networks
- CNNs for Computer Vision
- RNNs for Sequences

Module 5: Advanced Topics
- Transfer Learning
- GANs
- Reinforcement Learning`,
    category: CourseCategory.MACHINE_LEARNING,
    difficulty: CourseDifficulty.ADVANCED,
    duration: 3600, // 60 hours
    price: 129.99,
    isFree: false,
  },
  {
    title: 'AWS Solutions Architect Professional',
    description: 'Prepare for the AWS Solutions Architect Professional certification. Master advanced AWS services, design patterns, cost optimization, and enterprise architecture. Includes hands-on labs and practice exams.',
    syllabus: `Section 1: Advanced Networking
- VPC Design Patterns
- Transit Gateway
- Direct Connect

Section 2: Security & Compliance
- IAM Advanced
- KMS & Secrets Manager
- Security Hub

Section 3: Compute & Containers
- ECS & EKS
- Lambda Advanced
- Batch Processing

Section 4: Data & Analytics
- Redshift
- EMR
- Kinesis

Section 5: Architecture Patterns
- Multi-Region Deployments
- Disaster Recovery
- Cost Optimization`,
    category: CourseCategory.CLOUD_COMPUTING,
    difficulty: CourseDifficulty.ADVANCED,
    duration: 1800, // 30 hours
    price: 149.99,
    isFree: false,
  },
  {
    title: 'Full-Stack Mobile Development with React Native',
    description: 'Build cross-platform mobile apps for iOS and Android using React Native and Expo. Learn navigation, state management, native modules, and publish your apps to the App Store and Google Play.',
    syllabus: `Part 1: React Native Basics
- Expo Setup
- Core Components
- Styling

Part 2: Navigation
- Stack Navigator
- Tab Navigator
- Drawer Navigation

Part 3: State & Data
- AsyncStorage
- Redux
- API Integration

Part 4: Native Features
- Camera & Gallery
- Location Services
- Push Notifications

Part 5: Publishing
- App Store Submission
- Play Store Submission
- OTA Updates`,
    category: CourseCategory.MOBILE_DEVELOPMENT,
    difficulty: CourseDifficulty.INTERMEDIATE,
    duration: 1500, // 25 hours
    price: 59.99,
    isFree: false,
  },
  {
    title: 'DevOps Engineering: CI/CD, Docker & Kubernetes',
    description: 'Master DevOps practices with hands-on experience in Docker, Kubernetes, Jenkins, GitHub Actions, and Terraform. Build automated pipelines and deploy microservices at scale.',
    syllabus: `Chapter 1: Docker Fundamentals
- Containerization
- Dockerfile Best Practices
- Docker Compose

Chapter 2: Kubernetes
- Pods & Deployments
- Services & Ingress
- Helm Charts

Chapter 3: CI/CD Pipelines
- Jenkins
- GitHub Actions
- GitLab CI

Chapter 4: Infrastructure as Code
- Terraform
- Ansible
- Cloud Formation

Chapter 5: Monitoring & Logging
- Prometheus & Grafana
- ELK Stack
- Distributed Tracing`,
    category: CourseCategory.DEVOPS,
    difficulty: CourseDifficulty.INTERMEDIATE,
    duration: 2100, // 35 hours
    price: 89.99,
    isFree: false,
  },
  {
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Learn ethical hacking from scratch. Master reconnaissance, vulnerability assessment, exploitation, and post-exploitation techniques. Prepare for CEH and OSCP certifications.',
    syllabus: `Module 1: Reconnaissance
- OSINT Techniques
- Network Scanning
- Vulnerability Assessment

Module 2: Web Application Security
- OWASP Top 10
- SQL Injection
- XSS & CSRF

Module 3: Network Attacks
- Man-in-the-Middle
- Wireless Hacking
- Social Engineering

Module 4: System Exploitation
- Metasploit Framework
- Privilege Escalation
- Post Exploitation

Module 5: Reporting
- Documentation
- Risk Assessment
- Remediation Strategies`,
    category: CourseCategory.CYBERSECURITY,
    difficulty: CourseDifficulty.ADVANCED,
    duration: 2700, // 45 hours
    price: 119.99,
    isFree: false,
  },
  {
    title: 'Python Programming Masterclass',
    description: 'Complete Python course from basics to advanced. Learn OOP, file handling, web scraping, automation, and build real projects. Perfect for beginners wanting to master Python.',
    syllabus: `Week 1-2: Python Basics
- Variables & Data Types
- Control Flow
- Functions

Week 3-4: Data Structures
- Lists & Tuples
- Dictionaries & Sets
- Comprehensions

Week 5-6: OOP
- Classes & Objects
- Inheritance
- Magic Methods

Week 7-8: Advanced Topics
- Decorators
- Generators
- Context Managers

Week 9-10: Projects
- Web Scraping
- Automation
- API Development`,
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.BEGINNER,
    duration: 1200, // 20 hours
    price: 49.99,
    isFree: false,
  },
  {
    title: 'UI/UX Design with Figma',
    description: 'Master UI/UX design principles and Figma. Create wireframes, prototypes, and design systems. Learn user research, accessibility, and design handoff to developers.',
    syllabus: `Section 1: Design Fundamentals
- Design Principles
- Color Theory
- Typography

Section 2: Figma Basics
- Interface Overview
- Components
- Auto Layout

Section 3: UX Research
- User Personas
- User Flows
- Wireframing

Section 4: UI Design
- Design Systems
- Responsive Design
- Micro-interactions

Section 5: Prototyping
- Interactive Prototypes
- Usability Testing
- Developer Handoff`,
    category: CourseCategory.DESIGN,
    difficulty: CourseDifficulty.BEGINNER,
    duration: 900, // 15 hours
    price: 39.99,
    isFree: false,
  },
];

async function seedPaidCourses() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    const courseRepo = dataSource.getRepository(Course);
    const userRepo = dataSource.getRepository(User);

    // Find an instructor (admin or first user)
    const instructor = await userRepo.findOne({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.INSTRUCTOR }],
      order: { id: 'ASC' },
    });

    if (!instructor) {
      console.log('No instructor found. Creating courses without instructor.');
    }

    for (const courseData of paidCourses) {
      // Check if course already exists
      const existing = await courseRepo.findOne({
        where: { title: courseData.title },
      });

      if (existing) {
        console.log(`Course "${courseData.title}" already exists, skipping...`);
        continue;
      }

      const course = courseRepo.create({
        ...courseData,
        isPublished: true,
        instructorId: instructor?.id,
      });

      await courseRepo.save(course);
      console.log(`Created course: "${courseData.title}" - $${courseData.price}`);
    }

    console.log('\nPaid courses seeded successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding paid courses:', error);
    process.exit(1);
  }
}

seedPaidCourses();
