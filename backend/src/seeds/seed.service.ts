import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Course,
  CourseCategory,
  CourseDifficulty,
} from "../courses/courses.entity";
import { User, UserRole } from "../users/users.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedCourses();
  }

  private async seedCourses() {
    const count = await this.courseRepository.count();
    if (count > 0) {
      this.logger.log(`Courses already seeded (${count} found). Skipping.`);
      return;
    }

    this.logger.log("No courses found. Seeding 53 courses...");

    // Create instructor user if not exists
    let instructor = await this.userRepository.findOne({
      where: { email: "instructor@university.edu" },
    });

    if (!instructor) {
      const hashedPassword = await bcrypt.hash("instructor123", 10);
      instructor = this.userRepository.create({
        email: "instructor@university.edu",
        password: hashedPassword,
        firstName: "University",
        lastName: "Instructor",
        role: UserRole.INSTRUCTOR,
        isEmailVerified: true,
        isActive: true,
      });
      await this.userRepository.save(instructor);
      this.logger.log("Created instructor user: instructor@university.edu");
    }

    // Seed free university courses (45)
    for (const courseData of this.getFreeCourses()) {
      const course = this.courseRepository.create({
        title: `${courseData.code}: ${courseData.title}`,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty,
        duration: courseData.credits * 45 * 15,
        price: 0,
        isFree: true,
        isPublished: true,
        instructor: instructor,
        instructorId: instructor.id,
      });
      await this.courseRepository.save(course);
    }

    // Seed paid courses (8)
    for (const courseData of this.getPaidCourses()) {
      const course = this.courseRepository.create({
        ...courseData,
        isPublished: true,
        instructorId: instructor.id,
      });
      await this.courseRepository.save(course);
    }

    const total = await this.courseRepository.count();
    this.logger.log(`Seeded ${total} courses successfully!`);
  }

  private getFreeCourses() {
    return [
      {
        code: "CSC4181",
        title: "Advanced Database Management System",
        description:
          "Advanced concepts in database management including distributed databases, database security, performance tuning, and modern NoSQL systems. Prerequisites: CSC2108",
        category: CourseCategory.DATABASE,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "MIS3101",
        title: "Management Information System",
        description:
          "Study of information systems in organizations, including system analysis, design, implementation, and management. Prerequisites: CSC3112",
        category: CourseCategory.INFORMATION_SYSTEMS,
        difficulty: CourseDifficulty.INTERMEDIATE,
        credits: 3,
      },
      {
        code: "MIS4011",
        title: "Enterprise Resource Planning",
        description:
          "Comprehensive study of ERP systems, their implementation, integration, and management in modern enterprises. Prerequisites: MIS3101 & CSC3112",
        category: CourseCategory.INFORMATION_SYSTEMS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4285",
        title: "Data Warehouse and Data Mining",
        description:
          "Design and implementation of data warehouses, ETL processes, OLAP, and data mining techniques for business intelligence. Prerequisites: CSC2211 & MAT3103",
        category: CourseCategory.DATA_SCIENCE,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4182",
        title: "Human Computer Interaction",
        description:
          "Principles of HCI design, usability engineering, user experience design, and accessibility in software systems. Prerequisites: CSC3217 & CSC3215",
        category: CourseCategory.DESIGN,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "MIS4014",
        title: "Business Intelligence and Decision Support Systems",
        description:
          "Study of BI tools, analytics, dashboards, and decision support systems for organizational decision making.",
        category: CourseCategory.BUSINESS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4180",
        title: "Introduction to Data Science",
        description:
          "Fundamentals of data science including data collection, cleaning, analysis, visualization, and basic machine learning concepts.",
        category: CourseCategory.DATA_SCIENCE,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4183",
        title: "Cyber Laws and Information Security",
        description:
          "Study of cyber laws, regulations, information security policies, digital forensics, and ethical hacking fundamentals.",
        category: CourseCategory.CYBERSECURITY,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "MIS4007",
        title: "Digital Marketing",
        description:
          "Comprehensive study of digital marketing strategies, SEO, social media marketing, analytics, and online advertising.",
        category: CourseCategory.BUSINESS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "MIS4012",
        title: "E-Commerce, E-Governance and E-Series",
        description:
          "Study of electronic commerce systems, e-government initiatives, and various e-business models and implementations.",
        category: CourseCategory.BUSINESS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4270",
        title: "Software Development Project Management",
        description:
          "Project management methodologies including Agile, Scrum, risk management, and team leadership in software projects. Prerequisites: CSC3112",
        category: CourseCategory.SOFTWARE_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4160",
        title: "Software Requirement Engineering",
        description:
          "Techniques for requirements elicitation, analysis, specification, validation, and management in software development. Prerequisites: CSC3112",
        category: CourseCategory.SOFTWARE_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4271",
        title: "Software Quality and Testing",
        description:
          "Software quality assurance, testing methodologies, test automation, CI/CD pipelines, and quality metrics. Prerequisites: CSC3112",
        category: CourseCategory.SOFTWARE_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4162",
        title: "Programming in Python",
        description:
          "Comprehensive Python programming including data structures, OOP, libraries for data science, web development, and automation. Prerequisites: CSC3215",
        category: CourseCategory.PROGRAMMING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4274",
        title: "Virtual Reality Systems Design",
        description:
          "Design and development of VR/AR applications, 3D graphics, immersive environments, and interaction techniques. Prerequisites: CSC2210",
        category: CourseCategory.DESIGN,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4163",
        title: "Advanced Programming with Java",
        description:
          "Advanced Java concepts including multithreading, networking, JavaFX, Spring Framework, and enterprise applications. Prerequisites: CSC3215",
        category: CourseCategory.PROGRAMMING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4164",
        title: "Advanced Programming with .NET",
        description:
          "Advanced .NET development including C#, ASP.NET Core, Entity Framework, and enterprise application development. Prerequisites: CSC3215",
        category: CourseCategory.PROGRAMMING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4161",
        title: "Advanced Programming in Web Technology",
        description:
          "Modern web development with React, Node.js, TypeScript, REST APIs, and full-stack application development. Prerequisites: CSC3215",
        category: CourseCategory.WEB_DEVELOPMENT,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4272",
        title: "Mobile Application Development",
        description:
          "Cross-platform mobile development using React Native, Flutter, iOS and Android native development. Prerequisites: CSC3215",
        category: CourseCategory.MOBILE_DEVELOPMENT,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4273",
        title: "Software Architecture and Design Patterns",
        description:
          "Study of software architecture styles, design patterns, microservices, and system design principles. Prerequisites: CSC3112",
        category: CourseCategory.SOFTWARE_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4125",
        title: "Computer Science Mathematics",
        description:
          "Mathematical foundations for CS including discrete mathematics, logic, set theory, and combinatorics. Prerequisites: CSC2211 & MAT3101",
        category: CourseCategory.OTHER,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4126",
        title: "Basic Graph Theory",
        description:
          "Study of graphs, trees, networks, graph algorithms, and their applications in computer science. Prerequisites: CSC2211",
        category: CourseCategory.OTHER,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4127",
        title: "Advanced Algorithm Techniques",
        description:
          "Advanced algorithmic paradigms including dynamic programming, greedy algorithms, approximation algorithms, and complexity analysis. Prerequisites: CSC3217",
        category: CourseCategory.PROGRAMMING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4233",
        title: "Natural Language Processing",
        description:
          "NLP fundamentals including text processing, sentiment analysis, machine translation, and language models. Prerequisites: CSC3217 & CSC4162",
        category: CourseCategory.ARTIFICIAL_INTELLIGENCE,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4128",
        title: "Linear Programming",
        description:
          "Linear optimization techniques, simplex method, duality theory, and applications in operations research. Prerequisites: CSC3217 & MAT3103",
        category: CourseCategory.OTHER,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4231",
        title: "Parallel Computing",
        description:
          "Parallel programming models, multi-threading, GPU computing, distributed systems, and high-performance computing. Prerequisites: CSC3217",
        category: CourseCategory.PROGRAMMING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "CSC4232",
        title: "Machine Learning",
        description:
          "Supervised and unsupervised learning, neural networks, deep learning, and practical ML applications. Prerequisites: CSC3217",
        category: CourseCategory.MACHINE_LEARNING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "BAE1201",
        title: "Basic Mechanical Engineering",
        description:
          "Fundamentals of mechanical engineering including thermodynamics, mechanics, and manufacturing processes. Prerequisites: PHY1203",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.INTERMEDIATE,
        credits: 3,
      },
      {
        code: "EEE3103",
        title: "Digital Signal Processing",
        description:
          "DSP fundamentals including discrete-time signals, Z-transform, filter design, and FFT applications. Prerequisites: EEE2213",
        category: CourseCategory.ELECTRONICS,
        difficulty: CourseDifficulty.INTERMEDIATE,
        credits: 3,
      },
      {
        code: "EEE4217",
        title: "VLSI Circuit Design",
        description:
          "VLSI design methodology, CMOS technology, logic synthesis, and physical design automation. Prerequisites: EEE3101 & EEE3102",
        category: CourseCategory.ELECTRONICS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "EEE2213",
        title: "Signals and Linear System",
        description:
          "Continuous and discrete-time signals, system analysis, Fourier and Laplace transforms. Prerequisites: MAT2202",
        category: CourseCategory.ELECTRONICS,
        difficulty: CourseDifficulty.INTERMEDIATE,
        credits: 3,
      },
      {
        code: "COE4128",
        title: "Digital System Design",
        description:
          "Advanced digital design, FSM, FPGA programming, and hardware description languages. Prerequisites: COE3205",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4231",
        title: "Image Processing",
        description:
          "Digital image processing techniques, filtering, segmentation, feature extraction, and computer vision basics. Prerequisites: CSC4118 & EEE2213",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4129",
        title: "Multimedia Systems",
        description:
          "Multimedia data representation, compression techniques, streaming protocols, and multimedia applications. Prerequisites: CSC3215",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4230",
        title: "Simulation and Modeling",
        description:
          "Computer simulation techniques, discrete event simulation, Monte Carlo methods, and system modeling. Prerequisites: CSC3217",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4126",
        title: "Advanced Computer Networks",
        description:
          "Advanced networking concepts including network security, wireless networks, SDN, and network programming. Prerequisites: COE3206",
        category: CourseCategory.NETWORKING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4234",
        title: "Computer Vision and Pattern Recognition",
        description:
          "Computer vision algorithms, object detection, recognition systems, and deep learning for vision. Prerequisites: CSC4118",
        category: CourseCategory.ARTIFICIAL_INTELLIGENCE,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4232",
        title: "Network Security",
        description:
          "Network security protocols, cryptography, firewalls, intrusion detection, and secure network design. Prerequisites: COE3103",
        category: CourseCategory.CYBERSECURITY,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4125",
        title: "Advanced Operating System",
        description:
          "Advanced OS concepts including distributed systems, real-time OS, virtualization, and kernel development. Prerequisites: CSC3214",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "EEE4233",
        title: "Digital Design with System (Verilog, VHDL & FPGAs)",
        description:
          "Hardware description languages, FPGA design flow, synthesis, and verification techniques. Prerequisites: EEE4217",
        category: CourseCategory.ELECTRONICS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4235",
        title: "Robotics Engineering",
        description:
          "Robot kinematics, dynamics, sensors, actuators, control systems, and autonomous navigation. Prerequisites: CSC3217",
        category: CourseCategory.COMPUTER_ENGINEERING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "EEE4209",
        title: "Telecommunications Engineering",
        description:
          "Telecommunication systems, modulation techniques, wireless communication, and network protocols. Prerequisites: COE3103",
        category: CourseCategory.NETWORKING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4127",
        title: "Network Resource Management and Organization",
        description:
          "Network resource allocation, QoS, traffic management, and network optimization techniques. Prerequisites: COE3103",
        category: CourseCategory.NETWORKING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "COE4233",
        title: "Wireless Sensor Networks",
        description:
          "WSN architectures, protocols, energy efficiency, IoT applications, and sensor network deployment. Prerequisites: COE3103",
        category: CourseCategory.NETWORKING,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
      {
        code: "EEE4241",
        title: "Industrial Electronics, Drives and Instrumentation",
        description:
          "Power electronics, motor drives, industrial automation, and instrumentation systems. Prerequisites: EEE3101",
        category: CourseCategory.ELECTRONICS,
        difficulty: CourseDifficulty.ADVANCED,
        credits: 3,
      },
    ];
  }

  private getPaidCourses() {
    return [
      {
        title: "Complete React & Next.js Developer Course",
        description:
          "Master React 18, Next.js 14, TypeScript, Redux Toolkit, and build production-ready applications. This comprehensive course covers everything from fundamentals to advanced patterns including Server Components, App Router, and deployment strategies.",
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
        duration: 2400,
        price: 79.99,
        isFree: false,
      },
      {
        title: "Machine Learning A-Z: From Zero to Hero",
        description:
          "Learn Machine Learning from scratch! This course covers supervised learning, unsupervised learning, deep learning with TensorFlow and PyTorch. Build real-world ML projects including image classification, NLP, and recommendation systems.",
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
        duration: 3600,
        price: 129.99,
        isFree: false,
      },
      {
        title: "AWS Solutions Architect Professional",
        description:
          "Prepare for the AWS Solutions Architect Professional certification. Master advanced AWS services, design patterns, cost optimization, and enterprise architecture. Includes hands-on labs and practice exams.",
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
        duration: 1800,
        price: 149.99,
        isFree: false,
      },
      {
        title: "Full-Stack Mobile Development with React Native",
        description:
          "Build cross-platform mobile apps for iOS and Android using React Native and Expo. Learn navigation, state management, native modules, and publish your apps to the App Store and Google Play.",
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
        duration: 1500,
        price: 59.99,
        isFree: false,
      },
      {
        title: "DevOps Engineering: CI/CD, Docker & Kubernetes",
        description:
          "Master DevOps practices with hands-on experience in Docker, Kubernetes, Jenkins, GitHub Actions, and Terraform. Build automated pipelines and deploy microservices at scale.",
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
        duration: 2100,
        price: 89.99,
        isFree: false,
      },
      {
        title: "Ethical Hacking & Penetration Testing",
        description:
          "Learn ethical hacking from scratch. Master reconnaissance, vulnerability assessment, exploitation, and post-exploitation techniques. Prepare for CEH and OSCP certifications.",
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
        duration: 2700,
        price: 119.99,
        isFree: false,
      },
      {
        title: "Python Programming Masterclass",
        description:
          "Complete Python course from basics to advanced. Learn OOP, file handling, web scraping, automation, and build real projects. Perfect for beginners wanting to master Python.",
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
        duration: 1200,
        price: 49.99,
        isFree: false,
      },
      {
        title: "UI/UX Design with Figma",
        description:
          "Master UI/UX design principles and Figma. Create wireframes, prototypes, and design systems. Learn user research, accessibility, and design handoff to developers.",
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
        duration: 900,
        price: 39.99,
        isFree: false,
      },
    ];
  }
}
