type CheckIn = {
   id: string;
   notes?: string;
   mood: number;
   pain: number;
   fatigue: number;
   nausea: number;
   weight?: number;
   date: string;
};

type SaveCheckInDto = {
   mood: number;
   pain: number;
   fatigue: number;
   nausea: number;
   weight?: number;
   date: string;
   notes?: string;
};

type UserDto = {
   username: string;
   email: string;
   token: string;
   reminderEnabled: boolean;
   touredPages: string[];
};

type LoginDto = {
   email: string;
   password: string;
};

type RegisterDto = {
   username: string;
   email: string;
   password: string;
};

type QuestionDto = {
   id: string;
   text: string;
   isAsked: boolean;
   createdAt: string;
};

type CreateQuestionDto = {
   text: string;
};

type ShareLink = {
   id: string;
   token: string;
   label?: string;
   createdAt: string;
   expiresAt?: string;
   isRevoked: boolean;
   lastViewedAt?: string;
};

type CreateShareLinkDto = {
   label?: string;
   expiresAt?: string;
};

type MedicationSchedule = {
   dayOfWeek: number;
   time: string;
};

type Medication = {
   id: string;
   name: string;
   dosage?: string;
   targetSymptom?: string;
   isActive: boolean;
   schedules: MedicationSchedule[];
};

type SaveMedicationDto = {
   name: string;
   dosage?: string;
   targetSymptom?: string;
   isActive: boolean;
   schedules: MedicationSchedule[];
};

type AdherenceSummary = {
   medicationId: string;
   takenDays: number;
   scheduledDays: number;
};

type MetricAverages = {
   mood: number;
   pain: number;
   fatigue: number;
   nausea: number;
};

type SharedView = {
   ownerName: string;
   earliestDate?: string;
   latestDate?: string;
   checkIns: CheckIn[];
   pendingQuestions: QuestionDto[];
   averages?: MetricAverages;
};
