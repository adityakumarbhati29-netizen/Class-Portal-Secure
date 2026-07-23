import { db } from "@workspace/db";
import {
  usersTable, studentsTable, classTestsTable, classTestResultsTable,
  subjectsTable, subjectTopicsTable, softBoardPostsTable, noticesTable,
} from "@workspace/db";
import { v4 as uuid } from "uuid";

export async function seedIfEmpty() {
  // Only seed if users table is empty
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) return;

  // Users
  await db.insert(usersTable).values([
    { id: uuid(), username: "admin",    password: "admin123", role: "admin",   name: "Class Teacher" },
    { id: uuid(), username: "student1", password: "pass1234", role: "student", name: "Aarav Sharma"  },
    { id: uuid(), username: "student2", password: "pass1234", role: "student", name: "Priya Patel"   },
  ]);

  // Students
  const students = [
    { id: uuid(), rollNo: 1, name: "Aarav Sharma",  fatherName: "Rajesh Sharma",  contact: "9876543210", section: "H" },
    { id: uuid(), rollNo: 2, name: "Priya Patel",   fatherName: "Suresh Patel",   contact: "9876543211", section: "H" },
    { id: uuid(), rollNo: 3, name: "Rohit Kumar",   fatherName: "Mahesh Kumar",   contact: "9876543212", section: "H" },
    { id: uuid(), rollNo: 4, name: "Anjali Singh",  fatherName: "Vijay Singh",    contact: "9876543213", section: "H" },
    { id: uuid(), rollNo: 5, name: "Karan Mehta",   fatherName: "Ashok Mehta",    contact: "9876543214", section: "H" },
  ];
  await db.insert(studentsTable).values(students);

  // Subjects + topics
  const subjectData = [
    {
      id: uuid(), name: "Mathematics", teacher: "Mr. Rajesh Verma",
      topics: [
        { title: "Chapter 1: Real Numbers",           description: "Euclids Division Lemma, Fundamental Theorem of Arithmetic, Irrational Numbers." },
        { title: "Chapter 2: Polynomials",            description: "Zeros of Polynomial, Relationship between Zeros and Coefficients." },
        { title: "Chapter 3: Pair of Linear Equations", description: "Graphical Method, Algebraic Methods, Equations Reducible to Linear Form." },
      ],
    },
    {
      id: uuid(), name: "Science", teacher: "Mrs. Sunita Rao",
      topics: [
        { title: "Chapter 1: Chemical Reactions", description: "Types of Chemical Reactions, Oxidation and Reduction." },
        { title: "Chapter 2: Acids, Bases & Salts", description: "Properties of Acids and Bases, pH Scale, Salts." },
      ],
    },
    {
      id: uuid(), name: "English", teacher: "Mr. David Thomas",
      topics: [
        { title: "First Flight - Prose",   description: "A Letter to God, Nelson Mandela, Two Stories about Flying." },
        { title: "First Flight - Poetry",  description: "Dust of Snow, Fire and Ice, A Tiger in the Zoo." },
      ],
    },
    {
      id: uuid(), name: "Hindi", teacher: "Mrs. Priya Gupta",
      topics: [
        { title: "Kshitij - Chapters 1-5", description: "Kabir Ke Dohe, Meera Ke Pad, Ram-Lakshman-Parshuram Samvad." },
      ],
    },
    {
      id: uuid(), name: "Social Studies", teacher: "Mr. Ramesh Joshi",
      topics: [
        { title: "History: Nationalism in Europe", description: "The Rise of Nationalism, Making of Germany and Italy." },
        { title: "Geography: Resources",           description: "Resources and Development, Forest and Wildlife, Water Resources." },
      ],
    },
  ];
  for (const s of subjectData) {
    const { topics, ...subjectRow } = s;
    await db.insert(subjectsTable).values(subjectRow);
    await db.insert(subjectTopicsTable).values(
      topics.map((t) => ({ id: uuid(), subjectId: s.id, ...t }))
    );
  }

  // Class tests
  const test1Id = uuid();
  const test2Id = uuid();
  await db.insert(classTestsTable).values([
    { id: test1Id, subject: "Mathematics", date: "2024-01-15", maxMarks: 25 },
    { id: test2Id, subject: "Science",     date: "2024-01-20", maxMarks: 25 },
  ]);
  await db.insert(classTestResultsTable).values([
    { id: uuid(), testId: test1Id, rollNo: 1, name: "Aarav Sharma", marks: 23 },
    { id: uuid(), testId: test1Id, rollNo: 2, name: "Priya Patel",  marks: 21 },
    { id: uuid(), testId: test1Id, rollNo: 3, name: "Rohit Kumar",  marks: 18 },
    { id: uuid(), testId: test1Id, rollNo: 4, name: "Anjali Singh", marks: 24 },
    { id: uuid(), testId: test1Id, rollNo: 5, name: "Karan Mehta",  marks: 19 },
    { id: uuid(), testId: test2Id, rollNo: 1, name: "Aarav Sharma", marks: 20 },
    { id: uuid(), testId: test2Id, rollNo: 2, name: "Priya Patel",  marks: 22 },
    { id: uuid(), testId: test2Id, rollNo: 3, name: "Rohit Kumar",  marks: 17 },
    { id: uuid(), testId: test2Id, rollNo: 4, name: "Anjali Singh", marks: 25 },
    { id: uuid(), testId: test2Id, rollNo: 5, name: "Karan Mehta",  marks: 21 },
  ]);

  // Soft board
  await db.insert(softBoardPostsTable).values([
    { id: uuid(), title: "Annual Sports Day",   content: "Annual Sports Day will be held on 15th February. All students are requested to participate.", date: "2024-01-10", author: "Class Teacher", pinned: true,  colorIndex: 0 },
    { id: uuid(), title: "Science Exhibition",  content: "Inter-class Science Exhibition scheduled for 20th February. Submit project topics by 5th Feb.", date: "2024-01-12", author: "Class Teacher", pinned: false, colorIndex: 1 },
    { id: uuid(), title: "Library Week",        content: "School Library Week: 18th–22nd February. Students can borrow extra books during this week.", date: "2024-01-14", author: "Class Teacher", pinned: false, colorIndex: 2 },
  ]);

  // Notices
  await db.insert(noticesTable).values([
    { id: uuid(), title: "Parent-Teacher Meeting",     content: "PTM is scheduled on Saturday, 3rd February from 9:00 AM to 12:00 PM.", date: "2024-01-18", priority: "high",   author: "Class Teacher"   },
    { id: uuid(), title: "Holiday Notice - Republic Day", content: "School will remain closed on 26th January on account of Republic Day.",  date: "2024-01-20", priority: "medium", author: "Principal"       },
    { id: uuid(), title: "Pre-Board Examination Schedule", content: "Pre-Board exams commence from 5th February. Timetable pinned on board.", date: "2024-01-22", priority: "high",   author: "Exam Department" },
    { id: uuid(), title: "Fee Payment Reminder",       content: "Last date for second term fee payment is 31st January.",                   date: "2024-01-15", priority: "medium", author: "Accounts Office" },
  ]);
}
