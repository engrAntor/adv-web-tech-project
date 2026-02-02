import { DataSource } from 'typeorm';
import { Course, CourseCategory, CourseDifficulty } from '../courses/courses.entity';
import { User, UserRole } from '../users/users.entity';
import { Progress } from '../progress/progress.entity';
import { Certificate } from '../certificates/certificate.entity';
import { Rating } from '../ratings/rating.entity';
import { Notification } from '../notifications/notification.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const courses = [
  // Major in Information Systems
  {
    code: 'CSC4181',
    title: 'Advanced Database Management System',
    description: 'Advanced concepts in database management including distributed databases, database security, performance tuning, and modern NoSQL systems. Prerequisites: CSC2108',
    category: CourseCategory.DATABASE,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'MIS3101',
    title: 'Management Information System',
    description: 'Study of information systems in organizations, including system analysis, design, implementation, and management. Prerequisites: CSC3112',
    category: CourseCategory.INFORMATION_SYSTEMS,
    difficulty: CourseDifficulty.INTERMEDIATE,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'MIS4011',
    title: 'Enterprise Resource Planning',
    description: 'Comprehensive study of ERP systems, their implementation, integration, and management in modern enterprises. Prerequisites: MIS3101 & CSC3112',
    category: CourseCategory.INFORMATION_SYSTEMS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4285',
    title: 'Data Warehouse and Data Mining',
    description: 'Design and implementation of data warehouses, ETL processes, OLAP, and data mining techniques for business intelligence. Prerequisites: CSC2211 & MAT3103',
    category: CourseCategory.DATA_SCIENCE,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4182',
    title: 'Human Computer Interaction',
    description: 'Principles of HCI design, usability engineering, user experience design, and accessibility in software systems. Prerequisites: CSC3217 & CSC3215',
    category: CourseCategory.DESIGN,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'MIS4014',
    title: 'Business Intelligence and Decision Support Systems',
    description: 'Study of BI tools, analytics, dashboards, and decision support systems for organizational decision making.',
    category: CourseCategory.BUSINESS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4180',
    title: 'Introduction to Data Science',
    description: 'Fundamentals of data science including data collection, cleaning, analysis, visualization, and basic machine learning concepts.',
    category: CourseCategory.DATA_SCIENCE,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4183',
    title: 'Cyber Laws and Information Security',
    description: 'Study of cyber laws, regulations, information security policies, digital forensics, and ethical hacking fundamentals.',
    category: CourseCategory.CYBERSECURITY,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'MIS4007',
    title: 'Digital Marketing',
    description: 'Comprehensive study of digital marketing strategies, SEO, social media marketing, analytics, and online advertising.',
    category: CourseCategory.BUSINESS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'MIS4012',
    title: 'E-Commerce, E-Governance and E-Series',
    description: 'Study of electronic commerce systems, e-government initiatives, and various e-business models and implementations.',
    category: CourseCategory.BUSINESS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },

  // Major in Software Engineering
  {
    code: 'CSC4270',
    title: 'Software Development Project Management',
    description: 'Project management methodologies including Agile, Scrum, risk management, and team leadership in software projects. Prerequisites: CSC3112',
    category: CourseCategory.SOFTWARE_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4160',
    title: 'Software Requirement Engineering',
    description: 'Techniques for requirements elicitation, analysis, specification, validation, and management in software development. Prerequisites: CSC3112',
    category: CourseCategory.SOFTWARE_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4271',
    title: 'Software Quality and Testing',
    description: 'Software quality assurance, testing methodologies, test automation, CI/CD pipelines, and quality metrics. Prerequisites: CSC3112',
    category: CourseCategory.SOFTWARE_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4162',
    title: 'Programming in Python',
    description: 'Comprehensive Python programming including data structures, OOP, libraries for data science, web development, and automation. Prerequisites: CSC3215',
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4274',
    title: 'Virtual Reality Systems Design',
    description: 'Design and development of VR/AR applications, 3D graphics, immersive environments, and interaction techniques. Prerequisites: CSC2210',
    category: CourseCategory.DESIGN,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4163',
    title: 'Advanced Programming with Java',
    description: 'Advanced Java concepts including multithreading, networking, JavaFX, Spring Framework, and enterprise applications. Prerequisites: CSC3215',
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4164',
    title: 'Advanced Programming with .NET',
    description: 'Advanced .NET development including C#, ASP.NET Core, Entity Framework, and enterprise application development. Prerequisites: CSC3215',
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4161',
    title: 'Advanced Programming in Web Technology',
    description: 'Modern web development with React, Node.js, TypeScript, REST APIs, and full-stack application development. Prerequisites: CSC3215',
    category: CourseCategory.WEB_DEVELOPMENT,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4272',
    title: 'Mobile Application Development',
    description: 'Cross-platform mobile development using React Native, Flutter, iOS and Android native development. Prerequisites: CSC3215',
    category: CourseCategory.MOBILE_DEVELOPMENT,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4273',
    title: 'Software Architecture and Design Patterns',
    description: 'Study of software architecture styles, design patterns, microservices, and system design principles. Prerequisites: CSC3112',
    category: CourseCategory.SOFTWARE_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },

  // Major in Computational Theory
  {
    code: 'CSC4125',
    title: 'Computer Science Mathematics',
    description: 'Mathematical foundations for CS including discrete mathematics, logic, set theory, and combinatorics. Prerequisites: CSC2211 & MAT3101',
    category: CourseCategory.OTHER,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4126',
    title: 'Basic Graph Theory',
    description: 'Study of graphs, trees, networks, graph algorithms, and their applications in computer science. Prerequisites: CSC2211',
    category: CourseCategory.OTHER,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4127',
    title: 'Advanced Algorithm Techniques',
    description: 'Advanced algorithmic paradigms including dynamic programming, greedy algorithms, approximation algorithms, and complexity analysis. Prerequisites: CSC3217',
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4233',
    title: 'Natural Language Processing',
    description: 'NLP fundamentals including text processing, sentiment analysis, machine translation, and language models. Prerequisites: CSC3217 & CSC4162',
    category: CourseCategory.ARTIFICIAL_INTELLIGENCE,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4128',
    title: 'Linear Programming',
    description: 'Linear optimization techniques, simplex method, duality theory, and applications in operations research. Prerequisites: CSC3217 & MAT3103',
    category: CourseCategory.OTHER,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'CSC4231',
    title: 'Parallel Computing',
    description: 'Parallel programming models, multi-threading, GPU computing, distributed systems, and high-performance computing. Prerequisites: CSC3217',
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'CSC4232',
    title: 'Machine Learning',
    description: 'Supervised and unsupervised learning, neural networks, deep learning, and practical ML applications. Prerequisites: CSC3217',
    category: CourseCategory.MACHINE_LEARNING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },

  // Major in Computer Engineering
  {
    code: 'BAE1201',
    title: 'Basic Mechanical Engineering',
    description: 'Fundamentals of mechanical engineering including thermodynamics, mechanics, and manufacturing processes. Prerequisites: PHY1203',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.INTERMEDIATE,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'EEE3103',
    title: 'Digital Signal Processing',
    description: 'DSP fundamentals including discrete-time signals, Z-transform, filter design, and FFT applications. Prerequisites: EEE2213',
    category: CourseCategory.ELECTRONICS,
    difficulty: CourseDifficulty.INTERMEDIATE,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'EEE4217',
    title: 'VLSI Circuit Design',
    description: 'VLSI design methodology, CMOS technology, logic synthesis, and physical design automation. Prerequisites: EEE3101 & EEE3102',
    category: CourseCategory.ELECTRONICS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'EEE2213',
    title: 'Signals and Linear System',
    description: 'Continuous and discrete-time signals, system analysis, Fourier and Laplace transforms. Prerequisites: MAT2202',
    category: CourseCategory.ELECTRONICS,
    difficulty: CourseDifficulty.INTERMEDIATE,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4128',
    title: 'Digital System Design',
    description: 'Advanced digital design, FSM, FPGA programming, and hardware description languages. Prerequisites: COE3205',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4231',
    title: 'Image Processing',
    description: 'Digital image processing techniques, filtering, segmentation, feature extraction, and computer vision basics. Prerequisites: CSC4118 & EEE2213',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4129',
    title: 'Multimedia Systems',
    description: 'Multimedia data representation, compression techniques, streaming protocols, and multimedia applications. Prerequisites: CSC3215',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4230',
    title: 'Simulation and Modeling',
    description: 'Computer simulation techniques, discrete event simulation, Monte Carlo methods, and system modeling. Prerequisites: CSC3217',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'COE4126',
    title: 'Advanced Computer Networks',
    description: 'Advanced networking concepts including network security, wireless networks, SDN, and network programming. Prerequisites: COE3206',
    category: CourseCategory.NETWORKING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'COE4234',
    title: 'Computer Vision and Pattern Recognition',
    description: 'Computer vision algorithms, object detection, recognition systems, and deep learning for vision. Prerequisites: CSC4118',
    category: CourseCategory.ARTIFICIAL_INTELLIGENCE,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4232',
    title: 'Network Security',
    description: 'Network security protocols, cryptography, firewalls, intrusion detection, and secure network design. Prerequisites: COE3103',
    category: CourseCategory.CYBERSECURITY,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4125',
    title: 'Advanced Operating System',
    description: 'Advanced OS concepts including distributed systems, real-time OS, virtualization, and kernel development. Prerequisites: CSC3214',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'EEE4233',
    title: 'Digital Design with System (Verilog, VHDL & FPGAs)',
    description: 'Hardware description languages, FPGA design flow, synthesis, and verification techniques. Prerequisites: EEE4217',
    category: CourseCategory.ELECTRONICS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4235',
    title: 'Robotics Engineering',
    description: 'Robot kinematics, dynamics, sensors, actuators, control systems, and autonomous navigation. Prerequisites: CSC3217',
    category: CourseCategory.COMPUTER_ENGINEERING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'EEE4209',
    title: 'Telecommunications Engineering',
    description: 'Telecommunication systems, modulation techniques, wireless communication, and network protocols. Prerequisites: COE3103',
    category: CourseCategory.NETWORKING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4127',
    title: 'Network Resource Management and Organization',
    description: 'Network resource allocation, QoS, traffic management, and network optimization techniques. Prerequisites: COE3103',
    category: CourseCategory.NETWORKING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: false,
  },
  {
    code: 'COE4233',
    title: 'Wireless Sensor Networks',
    description: 'WSN architectures, protocols, energy efficiency, IoT applications, and sensor network deployment. Prerequisites: COE3103',
    category: CourseCategory.NETWORKING,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
  {
    code: 'EEE4241',
    title: 'Industrial Electronics, Drives and Instrumentation',
    description: 'Power electronics, motor drives, industrial automation, and instrumentation systems. Prerequisites: EEE3101',
    category: CourseCategory.ELECTRONICS,
    difficulty: CourseDifficulty.ADVANCED,
    credits: 3,
    hasLab: true,
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'learning_platform',
    entities: [Course, User, Progress, Certificate, Rating, Notification],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const courseRepo = dataSource.getRepository(Course);
  const userRepo = dataSource.getRepository(User);

  // Create an instructor user if not exists
  let instructor = await userRepo.findOne({ where: { email: 'instructor@university.edu' } });
  if (!instructor) {
    const hashedPassword = await bcrypt.hash('instructor123', 10);
    instructor = userRepo.create({
      email: 'instructor@university.edu',
      password: hashedPassword,
      firstName: 'University',
      lastName: 'Instructor',
      role: UserRole.INSTRUCTOR,
      isEmailVerified: true,
      isActive: true,
    });
    await userRepo.save(instructor);
    console.log('Created instructor user');
  }

  // Insert courses
  let created = 0;
  let skipped = 0;

  for (const courseData of courses) {
    const existing = await courseRepo.findOne({ where: { title: courseData.title } });
    if (existing) {
      skipped++;
      continue;
    }

    const course = courseRepo.create({
      title: `${courseData.code}: ${courseData.title}`,
      description: courseData.description,
      category: courseData.category,
      difficulty: courseData.difficulty,
      duration: courseData.credits * 45 * 15, // credits * 45 mins/class * 15 weeks
      price: 0,
      isFree: true,
      isPublished: true,
      instructor: instructor,
      instructorId: instructor.id,
    });

    await courseRepo.save(course);
    created++;
    console.log(`Created: ${course.title}`);
  }

  console.log(`\nSeeding complete! Created: ${created}, Skipped: ${skipped}`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
