import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const agent = {
   CheckIns: {
      list: () => axios.get<CheckIn[]>("/checkins").then((r) => r.data),
   },
};

export default agent;
