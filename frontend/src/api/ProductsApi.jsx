import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const axiosJWT = axios.create();

axiosJWT.interceptors.request.use(
  async (config) => {
    const [name, setName] = useState("");
    const [token, setToken] = useState("");
    const [expire, setExpire] = useState("");
    const currentDate = new Date();
    if (expire * 1000 < currentDate.getTime()) {
      const response = await AuthApi.refreshToken();
      config.headers.Authorization = `Bearer ${response.data.accessToken}`;
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const fetch = async (token) => {
  const response = await axiosJWT.get("http://localhost:3000/api/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export default { fetch };
