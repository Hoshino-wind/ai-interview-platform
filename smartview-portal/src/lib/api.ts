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

// Auth endpoints that should not trigger token refresh on 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Check if this is an auth endpoint that should not trigger token refresh
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => requestUrl.startsWith(endpoint));
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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

export interface CodingEvent {
  type: 'keystroke' | 'paste' | 'tab_away' | 'tab_return' | 'run_code' | 'snapshot' | 'undo' | 'redo';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface Submission {
  id: string;
  examId: string;
  questionId: string;
  language: Language;
  code: string;
  codingEvents?: CodingEvent[];
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
  saveSubmission: (examId: string, questionId: string, data: { language: Language; code: string; codingEvents?: CodingEvent[] }) =>
    api.put<ApiResponse<Submission>>(`/exams/${examId}/submissions/${questionId}`, data),
  runCode: (examId: string, questionId: string, data: { language: Language; code: string }) =>
    api.post<ApiResponse<RunCodeResult>>(`/exams/${examId}/submissions/${questionId}/run`, data),
  // AI generation endpoints
  generatePreview: (applicationId: string) =>
    api.post<ApiResponse<{ questions: AIGeneratedQuestion[] }>>('/exams/generate/preview', { applicationId }),
  generateExam: (applicationId: string) =>
    api.post<ApiResponse<Exam>>('/exams/generate', { applicationId }),
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

// Application with exam info
export interface ApplicationWithExam extends Application {
  resume?: {
    id: string;
    fileUrl: string | null;
    parsedData: ParsedData | null;
  } | null;
  exam?: {
    id: string;
    status: ExamStatus;
    title: string;
    duration: number;
    createdAt: string;
  } | null;
  scoringStatus?: 'NOT_STARTED' | 'PENDING' | 'COMPLETED';
}

// AI Generated Question Preview
export interface AIGeneratedQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTime: number;
  relatedSkills: string[];
  scoringCriteria: string;
}

// Applications API
export const applicationsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ items: ApplicationWithExam[]; total: number }>>('/applications', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<ApplicationWithExam>>(`/applications/${id}`),
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

// Resume types
export interface ExperienceItem {
  company: string;
  role: string;
  years: number;
  techStack: string[];
  description: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  major: string;
  year: number;
}

export interface ProjectItem {
  name: string;
  description: string;
  techStack: string[];
}

export interface ParsedData {
  skills: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  yearsOfExperience: number;
  seniorityLevel: 'junior' | 'mid' | 'mid-senior' | 'senior' | 'expert';
}

export interface Resume {
  id: string;
  candidateId: string;
  fileUrl: string | null;
  parsedData: ParsedData | null;
  skills: string[];
  experience: ExperienceItem[] | null;
  education: EducationItem[] | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
}

// Resumes API
export const resumesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ id: string; fileUrl: string; createdAt: string }>>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  parse: () => api.post<ApiResponse<ParsedData>>('/resumes/parse'),
  getMyResume: () => api.get<ApiResponse<Resume | null>>('/resumes/me'),
  updateParsedData: (data: { parsedData: ParsedData }) =>
    api.put<ApiResponse<Resume>>('/resumes/me', data),
};

// LLM Provider types
export interface LlmProvider {
  id: string;
  name: string;
  model: string;
  isDefault: boolean;
  enabled: boolean;
}

export interface TestProviderResult {
  success: boolean;
  response?: string;
  error?: string;
}

// LLM API
export const llmApi = {
  getProviders: () => api.get<ApiResponse<LlmProvider[]>>('/llm/providers'),
  setDefaultProvider: (providerId: string) =>
    api.put<ApiResponse<{ success: boolean; defaultProvider: string }>>('/llm/providers/default', { providerId }),
  testProvider: (providerId: string) =>
    api.post<ApiResponse<TestProviderResult>>('/llm/providers/test', { providerId }),
};

export default api;
