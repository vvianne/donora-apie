import axios from "axios";

const api = axios.create({
  baseURL: "http://10.172.122.32:5000",
});

export default api;
