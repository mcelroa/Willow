type CheckIn = {
   id: string;
   notes: string;
   mood: number;
   pain: number;
   fatigue: number;
   nausea: number;
   date: string;
};

type SaveCheckInDto = {
   mood: number;
   pain: number;
   fatigue: number;
   nausea: number;
   date: string;
   notes?: string;
};

type UserDto = {
   username: string;
   email: string;
   token: string;
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
