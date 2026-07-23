import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { studentsApi, classTestsApi, subjectsApi, softBoardApi, noticesApi, getToken } from '@/lib/api';

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

// ── Context ────────────────────────────────────────────────────────────────

interface DataContextType {
  students: Student[];
  classTests: ClassTest[];
  subjects: Subject[];
  softBoardPosts: SoftBoardPost[];
  notices: Notice[];
  isLoading: boolean;
  refresh: () => Promise<void>;

  addStudent: (s: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addClassTest: (t: Omit<ClassTest, 'id'>) => Promise<void>;
  deleteClassTest: (id: string) => Promise<void>;

  addSubject: (s: Omit<Subject, 'id'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopicToSubject: (subjectId: string, topic: Omit<SubjectTopic, 'id'>) => Promise<void>;
  deleteTopicFromSubject: (subjectId: string, topicId: string) => Promise<void>;

  addSoftBoardPost: (p: Omit<SoftBoardPost, 'id'>) => Promise<void>;
  updateSoftBoardPost: (id: string, p: Partial<Omit<SoftBoardPost, 'id'>>) => Promise<void>;
  deleteSoftBoardPost: (id: string) => Promise<void>;

  addNotice: (n: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [softBoardPosts, setSoftBoardPosts] = useState<SoftBoardPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const [s, ct, sub, sb, n] = await Promise.all([
        studentsApi.list(),
        classTestsApi.list(),
        subjectsApi.list(),
        softBoardApi.list(),
        noticesApi.list(),
      ]);
      setStudents(s);
      setClassTests(ct as ClassTest[]);
      setSubjects(sub as Subject[]);
      setSoftBoardPosts(sb as SoftBoardPost[]);
      setNotices(n as Notice[]);
    } catch {
      // silently keep existing data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Students
  async function addStudent(data: Omit<Student, 'id'>) {
    const created = await studentsApi.create(data);
    setStudents((prev) => [...prev, created as Student].sort((a, b) => a.rollNo - b.rollNo));
  }
  async function deleteStudent(id: string) {
    await studentsApi.delete(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }

  // Class Tests
  async function addClassTest(data: Omit<ClassTest, 'id'>) {
    const created = await classTestsApi.create(data);
    setClassTests((prev) => [...prev, created as ClassTest]);
  }
  async function deleteClassTest(id: string) {
    await classTestsApi.delete(id);
    setClassTests((prev) => prev.filter((t) => t.id !== id));
  }

  // Subjects
  async function addSubject(data: Omit<Subject, 'id'>) {
    const created = await subjectsApi.create({ name: data.name, teacher: data.teacher });
    setSubjects((prev) => [...prev, { ...(created as Subject), topics: [] }]);
  }
  async function deleteSubject(id: string) {
    await subjectsApi.delete(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }
  async function addTopicToSubject(subjectId: string, topic: Omit<SubjectTopic, 'id'>) {
    const created = await subjectsApi.addTopic(subjectId, topic);
    setSubjects((prev) =>
      prev.map((s) => s.id === subjectId ? { ...s, topics: [...s.topics, created as SubjectTopic] } : s)
    );
  }
  async function deleteTopicFromSubject(subjectId: string, topicId: string) {
    await subjectsApi.deleteTopic(subjectId, topicId);
    setSubjects((prev) =>
      prev.map((s) => s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s)
    );
  }

  // Soft Board
  async function addSoftBoardPost(data: Omit<SoftBoardPost, 'id'>) {
    const created = await softBoardApi.create(data);
    setSoftBoardPosts((prev) => [created as SoftBoardPost, ...prev]);
  }
  async function updateSoftBoardPost(id: string, data: Partial<Omit<SoftBoardPost, 'id'>>) {
    const post = softBoardPosts.find((p) => p.id === id);
    if (!post) return;
    const updated = { ...post, ...data };
    await softBoardApi.update(id, updated);
    setSoftBoardPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }
  async function deleteSoftBoardPost(id: string) {
    await softBoardApi.delete(id);
    setSoftBoardPosts((prev) => prev.filter((p) => p.id !== id));
  }

  // Notices
  async function addNotice(data: Omit<Notice, 'id'>) {
    const created = await noticesApi.create(data);
    setNotices((prev) => [created as Notice, ...prev]);
  }
  async function deleteNotice(id: string) {
    await noticesApi.delete(id);
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <DataContext.Provider value={{
      students, classTests, subjects, softBoardPosts, notices, isLoading, refresh,
      addStudent, deleteStudent,
      addClassTest, deleteClassTest,
      addSubject, deleteSubject, addTopicToSubject, deleteTopicFromSubject,
      addSoftBoardPost, updateSoftBoardPost, deleteSoftBoardPost,
      addNotice, deleteNotice,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
