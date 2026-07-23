import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";

// ── Users ──────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id:       text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role:     text("role").notNull().default("student"), // 'admin' | 'student'
  name:     text("name").notNull(),
});

// ── Students ───────────────────────────────────────────────────────────────
export const studentsTable = pgTable("students", {
  id:         text("id").primaryKey(),
  rollNo:     integer("roll_no").notNull(),
  name:       text("name").notNull(),
  fatherName: text("father_name").notNull().default(""),
  contact:    text("contact").notNull().default(""),
  section:    text("section").notNull().default("H"),
});

// ── Class Tests ────────────────────────────────────────────────────────────
export const classTestsTable = pgTable("class_tests", {
  id:       text("id").primaryKey(),
  subject:  text("subject").notNull(),
  date:     text("date").notNull(),
  maxMarks: integer("max_marks").notNull(),
});

export const classTestResultsTable = pgTable("class_test_results", {
  id:     text("id").primaryKey(),
  testId: text("test_id").notNull().references(() => classTestsTable.id, { onDelete: "cascade" }),
  rollNo: integer("roll_no").notNull(),
  name:   text("name").notNull(),
  marks:  integer("marks").notNull(),
});

// ── Subjects ───────────────────────────────────────────────────────────────
export const subjectsTable = pgTable("subjects", {
  id:      text("id").primaryKey(),
  name:    text("name").notNull(),
  teacher: text("teacher").notNull(),
});

export const subjectTopicsTable = pgTable("subject_topics", {
  id:          text("id").primaryKey(),
  subjectId:   text("subject_id").notNull().references(() => subjectsTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description").notNull().default(""),
});

// ── Soft Board ─────────────────────────────────────────────────────────────
export const softBoardPostsTable = pgTable("soft_board_posts", {
  id:         text("id").primaryKey(),
  title:      text("title").notNull(),
  content:    text("content").notNull(),
  date:       text("date").notNull(),
  author:     text("author").notNull(),
  pinned:     boolean("pinned").notNull().default(false),
  colorIndex: integer("color_index").notNull().default(0),
});

// ── Notices ────────────────────────────────────────────────────────────────
export const noticesTable = pgTable("notices", {
  id:       text("id").primaryKey(),
  title:    text("title").notNull(),
  content:  text("content").notNull(),
  date:     text("date").notNull(),
  priority: text("priority").notNull().default("medium"), // 'high' | 'medium' | 'low'
  author:   text("author").notNull(),
});
