import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  fatherName: string;
  contact: string;
  section: string;
}

export interface ClassTestResult {
  rollNo: number;
  name: string;
  marks: number;
}

export interface ClassTest {
  id: string;
  subject: string;
  date: string;
  maxMarks: number;
  results: ClassTestResult[];
}

export interface SubjectTopic {
  id: string;
  title: string;
  description: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  topics: SubjectTopic[];
}

export interface SoftBoardPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  pinned: boolean;
  colorIndex: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  author: string;
}

// ── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  students: '@portal_students',
  classTests: '@portal_class_tests',
  subjects: '@portal_subjects',
  softBoard: '@portal_soft_board',
  notices: '@portal_notices',
} as const;

// ── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_STUDENTS: Student[] = [
  { id: 's1', rollNo: 1, name: 'Aarav Sharma', fatherName: 'Rajesh Sharma', contact: '9876543210', section: 'H' },
  { id: 's2', rollNo: 2, name: 'Priya Patel', fatherName: 'Suresh Patel', contact: '9876543211', section: 'H' },
  { id: 's3', rollNo: 3, name: 'Rohit Kumar', fatherName: 'Mahesh Kumar', contact: '9876543212', section: 'H' },
  { id: 's4', rollNo: 4, name: 'Anjali Singh', fatherName: 'Vijay Singh', contact: '9876543213', section: 'H' },
  { id: 's5', rollNo: 5, name: 'Karan Mehta', fatherName: 'Ashok Mehta', contact: '9876543214', section: 'H' },
];

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub1',
    name: 'Mathematics',
    teacher: 'Mr. Rajesh Verma',
    topics: [
      { id: 't1', title: 'Chapter 1: Real Numbers', description: 'Euclids Division Lemma, Fundamental Theorem of Arithmetic, Irrational Numbers, Decimal Expansions.' },
      { id: 't2', title: 'Chapter 2: Polynomials', description: 'Zeros of Polynomial, Relationship between Zeros and Coefficients, Division Algorithm.' },
      { id: 't3', title: 'Chapter 3: Pair of Linear Equations', description: 'Graphical Method, Algebraic Methods, Equations Reducible to Linear Form.' },
    ],
  },
  {
    id: 'sub2',
    name: 'Science',
    teacher: 'Mrs. Sunita Rao',
    topics: [
      { id: 't4', title: 'Chapter 1: Chemical Reactions', description: 'Types of Chemical Reactions, Oxidation and Reduction, Effects of Oxidation Reactions.' },
      { id: 't5', title: 'Chapter 2: Acids, Bases & Salts', description: 'Properties of Acids and Bases, pH Scale, Importance of pH, Salts.' },
    ],
  },
  {
    id: 'sub3',
    name: 'English',
    teacher: 'Mr. David Thomas',
    topics: [
      { id: 't6', title: 'First Flight - Prose', description: 'A Letter to God, Nelson Mandela, Two Stories about Flying, From the Diary of Anne Frank.' },
      { id: 't7', title: 'First Flight - Poetry', description: 'Dust of Snow, Fire and Ice, A Tiger in the Zoo, The Ball Poem.' },
    ],
  },
  {
    id: 'sub4',
    name: 'Hindi',
    teacher: 'Mrs. Priya Gupta',
    topics: [
      { id: 't8', title: 'Kshitij - Chapters 1-5', description: 'Kabir Ke Dohe, Meera Ke Pad, Ram-Lakshman-Parshuram Samvad, Saviya.' },
    ],
  },
  {
    id: 'sub5',
    name: 'Social Studies',
    teacher: 'Mr. Ramesh Joshi',
    topics: [
      { id: 't9', title: 'History: Nationalism in Europe', description: 'The Rise of Nationalism in Europe, The Making of Nationalism in Germany and Italy.' },
      { id: 't10', title: 'Geography: Resources', description: 'Resources and Development, Forest and Wildlife, Water Resources.' },
    ],
  },
];

const DEFAULT_CLASS_TESTS: ClassTest[] = [
  {
    id: 'ct1',
    subject: 'Mathematics',
    date: '2024-01-15',
    maxMarks: 25,
    results: [
      { rollNo: 1, name: 'Aarav Sharma', marks: 23 },
      { rollNo: 2, name: 'Priya Patel', marks: 21 },
      { rollNo: 3, name: 'Rohit Kumar', marks: 18 },
      { rollNo: 4, name: 'Anjali Singh', marks: 24 },
      { rollNo: 5, name: 'Karan Mehta', marks: 19 },
    ],
  },
  {
    id: 'ct2',
    subject: 'Science',
    date: '2024-01-20',
    maxMarks: 25,
    results: [
      { rollNo: 1, name: 'Aarav Sharma', marks: 20 },
      { rollNo: 2, name: 'Priya Patel', marks: 22 },
      { rollNo: 3, name: 'Rohit Kumar', marks: 17 },
      { rollNo: 4, name: 'Anjali Singh', marks: 25 },
      { rollNo: 5, name: 'Karan Mehta', marks: 21 },
    ],
  },
];

const DEFAULT_SOFT_BOARD: SoftBoardPost[] = [
  {
    id: 'sb1',
    title: 'Annual Sports Day',
    content: 'Annual Sports Day will be held on 15th February. All students are requested to participate enthusiastically. Practice sessions start from Monday.',
    date: '2024-01-10',
    author: 'Class Teacher',
    pinned: true,
    colorIndex: 0,
  },
  {
    id: 'sb2',
    title: 'Science Exhibition',
    content: 'Inter-class Science Exhibition scheduled for 20th February. Students interested in participating should submit their project topics by 5th February.',
    date: '2024-01-12',
    author: 'Class Teacher',
    pinned: false,
    colorIndex: 1,
  },
  {
    id: 'sb3',
    title: 'Library Week',
    content: 'School Library Week: 18th to 22nd February. Students can borrow extra books during this week. Book reviews competition also announced.',
    date: '2024-01-14',
    author: 'Class Teacher',
    pinned: false,
    colorIndex: 2,
  },
];

const DEFAULT_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Parent-Teacher Meeting',
    content: 'PTM is scheduled on Saturday, 3rd February from 9:00 AM to 12:00 PM. All parents are requested to attend and discuss their ward\'s academic progress.',
    date: '2024-01-18',
    priority: 'high',
    author: 'Class Teacher',
  },
  {
    id: 'n2',
    title: 'Holiday Notice - Republic Day',
    content: 'School will remain closed on 26th January on account of Republic Day. Flag hoisting ceremony will be held at 8:00 AM. Attendance is voluntary but encouraged.',
    date: '2024-01-20',
    priority: 'medium',
    author: 'Principal',
  },
  {
    id: 'n3',
    title: 'Pre-Board Examination Schedule',
    content: 'Pre-Board examinations will commence from 5th February. Timetable has been pinned on the notice board. Students are advised to prepare well.',
    date: '2024-01-22',
    priority: 'high',
    author: 'Exam Department',
  },
  {
    id: 'n4',
    title: 'Fee Payment Reminder',
    content: 'Last date for second term fee payment is 31st January. Late fee will be charged after the due date. Parents are requested to pay on time.',
    date: '2024-01-15',
    priority: 'medium',
    author: 'Accounts Office',
  },
];

// ── Context ────────────────────────────────────────────────────────────────

interface DataContextType {
  students: Student[];
  classTests: ClassTest[];
  subjects: Subject[];
  softBoardPosts: SoftBoardPost[];
  notices: Notice[];

  addStudent: (s: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, s: Partial<Omit<Student, 'id'>>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addClassTest: (t: Omit<ClassTest, 'id'>) => Promise<void>;
  updateClassTest: (id: string, t: Partial<Omit<ClassTest, 'id'>>) => Promise<void>;
  deleteClassTest: (id: string) => Promise<void>;

  addSubject: (s: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, s: Partial<Omit<Subject, 'id'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopicToSubject: (subjectId: string, topic: Omit<SubjectTopic, 'id'>) => Promise<void>;
  deleteTopicFromSubject: (subjectId: string, topicId: string) => Promise<void>;

  addSoftBoardPost: (p: Omit<SoftBoardPost, 'id'>) => Promise<void>;
  updateSoftBoardPost: (id: string, p: Partial<Omit<SoftBoardPost, 'id'>>) => Promise<void>;
  deleteSoftBoardPost: (id: string) => Promise<void>;

  addNotice: (n: Omit<Notice, 'id'>) => Promise<void>;
  updateNotice: (id: string, n: Partial<Omit<Notice, 'id'>>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function genId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

async function loadOrSeed<T>(key: string, defaults: T[]): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T[];
  await AsyncStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

async function persist<T>(key: string, data: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [softBoardPosts, setSoftBoardPosts] = useState<SoftBoardPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    (async () => {
      const [s, ct, sub, sb, n] = await Promise.all([
        loadOrSeed(KEYS.students, DEFAULT_STUDENTS),
        loadOrSeed(KEYS.classTests, DEFAULT_CLASS_TESTS),
        loadOrSeed(KEYS.subjects, DEFAULT_SUBJECTS),
        loadOrSeed(KEYS.softBoard, DEFAULT_SOFT_BOARD),
        loadOrSeed(KEYS.notices, DEFAULT_NOTICES),
      ]);
      setStudents(s);
      setClassTests(ct);
      setSubjects(sub);
      setSoftBoardPosts(sb);
      setNotices(n);
    })();
  }, []);

  // Students
  async function addStudent(data: Omit<Student, 'id'>) {
    const updated = [...students, { ...data, id: genId() }];
    setStudents(updated);
    await persist(KEYS.students, updated);
  }
  async function updateStudent(id: string, data: Partial<Omit<Student, 'id'>>) {
    const updated = students.map((s) => (s.id === id ? { ...s, ...data } : s));
    setStudents(updated);
    await persist(KEYS.students, updated);
  }
  async function deleteStudent(id: string) {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    await persist(KEYS.students, updated);
  }

  // Class Tests
  async function addClassTest(data: Omit<ClassTest, 'id'>) {
    const updated = [...classTests, { ...data, id: genId() }];
    setClassTests(updated);
    await persist(KEYS.classTests, updated);
  }
  async function updateClassTest(id: string, data: Partial<Omit<ClassTest, 'id'>>) {
    const updated = classTests.map((t) => (t.id === id ? { ...t, ...data } : t));
    setClassTests(updated);
    await persist(KEYS.classTests, updated);
  }
  async function deleteClassTest(id: string) {
    const updated = classTests.filter((t) => t.id !== id);
    setClassTests(updated);
    await persist(KEYS.classTests, updated);
  }

  // Subjects
  async function addSubject(data: Omit<Subject, 'id'>) {
    const updated = [...subjects, { ...data, id: genId() }];
    setSubjects(updated);
    await persist(KEYS.subjects, updated);
  }
  async function updateSubject(id: string, data: Partial<Omit<Subject, 'id'>>) {
    const updated = subjects.map((s) => (s.id === id ? { ...s, ...data } : s));
    setSubjects(updated);
    await persist(KEYS.subjects, updated);
  }
  async function deleteSubject(id: string) {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    await persist(KEYS.subjects, updated);
  }
  async function addTopicToSubject(subjectId: string, topic: Omit<SubjectTopic, 'id'>) {
    const updated = subjects.map((s) =>
      s.id === subjectId
        ? { ...s, topics: [...s.topics, { ...topic, id: genId() }] }
        : s
    );
    setSubjects(updated);
    await persist(KEYS.subjects, updated);
  }
  async function deleteTopicFromSubject(subjectId: string, topicId: string) {
    const updated = subjects.map((s) =>
      s.id === subjectId
        ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
        : s
    );
    setSubjects(updated);
    await persist(KEYS.subjects, updated);
  }

  // Soft Board
  async function addSoftBoardPost(data: Omit<SoftBoardPost, 'id'>) {
    const updated = [{ ...data, id: genId() }, ...softBoardPosts];
    setSoftBoardPosts(updated);
    await persist(KEYS.softBoard, updated);
  }
  async function updateSoftBoardPost(id: string, data: Partial<Omit<SoftBoardPost, 'id'>>) {
    const updated = softBoardPosts.map((p) => (p.id === id ? { ...p, ...data } : p));
    setSoftBoardPosts(updated);
    await persist(KEYS.softBoard, updated);
  }
  async function deleteSoftBoardPost(id: string) {
    const updated = softBoardPosts.filter((p) => p.id !== id);
    setSoftBoardPosts(updated);
    await persist(KEYS.softBoard, updated);
  }

  // Notices
  async function addNotice(data: Omit<Notice, 'id'>) {
    const updated = [{ ...data, id: genId() }, ...notices];
    setNotices(updated);
    await persist(KEYS.notices, updated);
  }
  async function updateNotice(id: string, data: Partial<Omit<Notice, 'id'>>) {
    const updated = notices.map((n) => (n.id === id ? { ...n, ...data } : n));
    setNotices(updated);
    await persist(KEYS.notices, updated);
  }
  async function deleteNotice(id: string) {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    await persist(KEYS.notices, updated);
  }

  return (
    <DataContext.Provider
      value={{
        students, classTests, subjects, softBoardPosts, notices,
        addStudent, updateStudent, deleteStudent,
        addClassTest, updateClassTest, deleteClassTest,
        addSubject, updateSubject, deleteSubject, addTopicToSubject, deleteTopicFromSubject,
        addSoftBoardPost, updateSoftBoardPost, deleteSoftBoardPost,
        addNotice, updateNotice, deleteNotice,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
