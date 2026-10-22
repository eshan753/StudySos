export type PriorityLevel = 'low' | 'medium' | 'high';

export type PriorityScoreLabel = 'Urgent' | 'High' | 'Medium' | 'Low' | 'Completed';

export interface PriorityBreakdown {
  score: number;
  label: PriorityScoreLabel;
  importancePoints: number;
  urgencyPoints: number;
  effortPoints: number;
  urgencyReason: string;
  isOverdue: boolean;
  hoursRemaining: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm, default "23:59"
  priority: PriorityLevel;
  estimatedMinutes: number; // 5–600, step 5
  notes: string; // max 1000 chars
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  sessionMinutes: number; // default 45, range 10–180
  shortBreakMinutes: number; // default 10, range 1–60
  longBreakMinutes: number; // default 20, range 5–90
  sessionsBeforeLongBreak: number; // default 4, range 2–8
  dailyStudyStart: string; // HH:mm, default "16:00"
  dailyCapacityMinutes: number; // default 180, range 30–720
  subjects: string[]; // default: ['Math', 'Science', 'English', 'History', 'Languages', 'Other']
}

export interface PersistState {
  version: 1;
  assignments: Assignment[];
  settings: Settings;
  completedSessionIds?: string[];
}

export interface StudySessionBlock {
  id: string;
  type: 'session' | 'shortBreak' | 'longBreak';
  assignmentId?: string;
  taskTitle?: string;
  subject?: string;
  sessionNumber?: number;
  totalSessionsForTask?: number;
  durationMinutes: number;
  startTime: string; // "YYYY-MM-DD HH:mm"
  endTime: string;   // "YYYY-MM-DD HH:mm"
  date: string;      // "YYYY-MM-DD"
  isAtRisk?: boolean;
  atRiskReason?: string;
  completed?: boolean;
}

export interface DailySchedule {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Monday", etc.
  formattedDate: string; // "Oct 21, 2026"
  blocks: StudySessionBlock[];
  totalStudyMinutes: number;
  totalBreakMinutes: number;
  capacityMinutes: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

export interface AssignmentFilterState {
  search: string;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  priority: 'all' | PriorityLevel;
  subject: string;
  sortBy: 'priority' | 'dueDate' | 'title' | 'duration' | 'created';
}

export interface SubjectProgress {
  subject: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number; // 0-100
  estimatedMinutesTotal: number;
  estimatedMinutesCompleted: number;
}

export interface DailyCompletionCount {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue"
  count: number;
}
