import axios, { type AxiosResponse } from "axios";

const axiosInstance = axios.create({
   baseURL: import.meta.env.VITE_API_URL,
});

// Runs before every request - reads token from localStorage and injects header
axiosInstance.interceptors.request.use((config) => {
   const token = localStorage.getItem("jwt");
   if (token) config.headers.Authorization = `Bearer ${token}`;
   return config;
});

// Unwraps response.data so callers get the payload directly, not the full AxiosResponse
const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// Generic helpers - one line per HTTP verb
const requests = {
   get: <T>(url: string) => axiosInstance.get<T>(url).then(responseBody),
   post: <T>(url: string, body: object) =>
      axiosInstance.post<T>(url, body).then(responseBody),
   put: <T>(url: string, body: object) =>
      axiosInstance.put<T>(url, body).then(responseBody),
   delete: <T>(url: string) => axiosInstance.delete<T>(url).then(responseBody),
   patch: <T>(url: string) =>
      axiosInstance.patch<T>(url, {}).then(responseBody),
};

const agent = {
   Account: {
      login: (creds: LoginDto) =>
         requests.post<UserDto>("/account/login", creds),
      register: (creds: RegisterDto) =>
         requests.post<UserDto>("/account/register", creds),
      current: () => requests.get<UserDto>("/account"),
      forgotPassword: (dto: { email: string }) =>
         requests.post<void>("/account/forgot-password", dto),
      resetPassword: (dto: { email: string; token: string; newPassword: string }) =>
         requests.post<void>("/account/reset-password", dto),
   },
   CheckIns: {
      list: () => requests.get<CheckIn[]>("/checkins"),
      details: (id: string) => requests.get<CheckIn>(`/checkins/${id}`),
      create: (checkIn: SaveCheckInDto) =>
         requests.post<CheckIn>("/checkins", checkIn),
      update: (id: string, checkIn: SaveCheckInDto) =>
         requests.put<CheckIn>(`/checkins/${id}`, checkIn),
      delete: (id: string) => requests.delete<void>(`/checkins/${id}`),
   },
   Questions: {
      list: () => requests.get<QuestionDto[]>("/questions"),
      create: (dto: CreateQuestionDto) =>
         requests.post<string>("/questions", dto),
      delete: (id: string) => requests.delete<void>(`/questions/${id}`),
      markAsked: (id: string) =>
         requests.patch<void>(`/questions/${id}/mark-asked`),
   },
   Export: {
      pdf: () =>
         axiosInstance
            .get("/export/pdf", { responseType: "blob" })
            .then((res) => res.data as Blob),
   },
};

export default agent;
