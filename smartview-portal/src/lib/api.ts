import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// API Response types
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "INTERVIEWER" | "HR" | "ADMIN";
  avatar: string | null;
  phone: string | null;
  companyId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refresh_token') : null;
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await api.post('/auth/refresh', { 
          refresh_token: refreshToken 
        });
        
        const { access_token, refresh_token: newRefreshToken } = response.data.data || response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
        }

        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  refresh: (refresh_token: string) =>
    api.post<ApiResponse<AuthResponse>>("/auth/refresh", { refresh_token }),

  me: () => api.get<ApiResponse<User>>("/auth/me"),

  logout: () => api.post<ApiResponse<void>>("/auth/logout"),
};

// Users API
export const usersApi = {
  getProfile: () => api.get<ApiResponse<User>>("/users/profile"),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put<ApiResponse<User>>("/users/profile", data),
  getUsers: () => api.get<ApiResponse<User[]>>('/users'),
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
};

// Question types
export type QuestionType = "ALGORITHM" | "SYSTEM_DESIGN" | "REFACTORING" | "DEBUGGING" | "PROJECT";
export type DifficultyLevel = "L1" | "L2" | "L3" | "L4";
export type Language = "javascript" | "typescript" | "python" | "java" | "cpp" | "go";

export interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface StarterCode {
  language: Language;
  code: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  timeLimit: number;
  tags: string[];
  languageSupport: Language[];
  starterCode: StarterCode[];
  testCases: TestCase[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  title: string;
  description: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  timeLimit: number;
  tags: string[];
  languageSupport: Language[];
  starterCode: StarterCode[];
  testCases: TestCase[];
}

export interface QueryQuestionDto {
  type?: QuestionType;
  difficulty?: DifficultyLevel;
  search?: string;
  page?: number;
  limit?: number;
}

// Questions API
export const questionsApi = {
  getQuestions: (params?: QueryQuestionDto) =>
    api.get<ApiResponse<{ items: Question[]; total: number }>>("/questions", { params }),
  getQuestionById: (id: string) =>
    api.get<ApiResponse<Question>>(`/questions/${id}`),
  createQuestion: (data: CreateQuestionDto) =>
    api.post<ApiResponse<Question>>("/questions", data),
  updateQuestion: (id: string, data: CreateQuestionDto) =>
    api.put<ApiResponse<Question>>(`/questions/${id}`, data),
  deleteQuestion: (id: string) =>
    api.delete<ApiResponse<void>>(`/questions/${id}`),
};

// Exam types
export type ExamStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "GRADING" | "COMPLETED";

export interface ExamQuestion {
  id: string;
  questionId: string;
  question: Question;
  order: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: ExamStatus;
  questions: ExamQuestion[];
  startedAt?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  examId: string;
  questionId: string;
  language: Language;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface RunCodeResult {
  stdout: string;
  stderr: string;
  executionTime: number;
  testResults: TestResult[];
  passedCount: number;
  totalCount: number;
}

// Exams API
export const examsApi = {
  getExam: (id: string) =>
    api.get<ApiResponse<Exam>>(`/exams/${id}`),
  startExam: (id: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${id}/start`),
  submitExam: (id: string) =>
    api.post<ApiResponse<void>>(`/exams/${id}/submit`),
  saveSubmission: (examId: string, questionId: string, data: { language: Language; code: string }) =>
    api.put<ApiResponse<Submission>>(`/exams/${examId}/submissions/${questionId}`, data),
  runCode: (examId: string, questionId: string, data: { language: Language; code: string }) =>
    api.post<ApiResponse<RunCodeResult>>(`/exams/${examId}/submissions/${questionId}/run`, data),
};

// Interview types
export interface Interview {
  id: string;
  applicationId: string;
  interviewerIds: string[];
  type: 'VIDEO' | 'ONSITE';
  scheduledAt: string;
  status: string;
  application?: Application;
  scores?: InterviewerScore[];
}

export interface InterviewerScore {
  id: string;
  interviewId: string;
  interviewerId: string;
  techDepth: number;
  communication: number;
  overallQuality: number;
  cultureFit: number;
  totalScore: number;
  comments?: string;
  interviewer?: { name: string; email: string };
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  candidate?: { name: string; email: string };
  job?: { title: string };
  finalScore?: FinalScore;
}

export interface FinalScore {
  id: string;
  aiScore: number;
  interviewerScore: number;
  finalScore: number;
  decision: 'RECOMMEND' | 'MAYBE' | 'REJECT';
}

export interface AIScoreReport {
  totalScore: number;
  breakdown: {
    codingAbility: number;
    engineeringMindset: number;
    problemSolving: number;
  };
  codeAnnotations: CodeAnnotation[];
  suggestedQuestions: string[];
}

export interface CodeAnnotation {
  line: number;
  type: 'highlight' | 'issue';
  message: string;
}

export interface SubmissionWithCode {
  id: string;
  examId: string;
  questionId: string;
  language: Language;
  code: string;
  createdAt: string;
  updatedAt: string;
  question?: Question;
}

export interface QueryInterviewDto {
  status?: string;
  page?: number;
  limit?: number;
}

export interface SubmitScoreDto {
  techDepth: number;
  communication: number;
  overallQuality: number;
  cultureFit: number;
  comments: string;
}

export interface UpdateDecisionDto {
  decision: 'RECOMMEND' | 'MAYBE' | 'REJECT';
}

// Interviews API
export const interviewsApi = {
  list: (params?: QueryInterviewDto) =>
    api.get<ApiResponse<{ items: Interview[]; total: number }>>('/interviews', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Interview>>(`/interviews/${id}`),
  submitScore: (id: string, data: SubmitScoreDto) =>
    api.post<ApiResponse<InterviewerScore>>(`/interviews/${id}/score`, data),
  getScores: (id: string) =>
    api.get<ApiResponse<InterviewerScore[]>>(`/interviews/${id}/scores`),
};

// Applications API
export const applicationsApi = {
  getById: (id: string) =>
    api.get<ApiResponse<Application>>(`/applications/${id}`),
  getReport: (id: string) =>
    api.get<ApiResponse<AIScoreReport>>(`/applications/${id}/report`),
  finalize: (id: string) =>
    api.post<ApiResponse<FinalScore>>(`/applications/${id}/finalize`),
  updateDecision: (id: string, data: UpdateDecisionDto) =>
    api.put<ApiResponse<FinalScore>>(`/applications/${id}/decision`, data),
};

// Scoring API
export const scoringApi = {
  getBySubmission: (submissionId: string) =>
    api.get<ApiResponse<AIScoreReport>>(`/scoring/${submissionId}`),
  getByExam: (examId: string) =>
    api.get<ApiResponse<{ submissions: SubmissionWithCode[]; reports: Record<string, AIScoreReport> }>>(`/scoring/exam/${examId}`),
};

export default api;
