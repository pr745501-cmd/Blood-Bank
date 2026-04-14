import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ IMPORTANT
});

// GET ALL CAMPS
export const getAllCamps = async () => {
  const res = await API.get("/camps");
  return res.data;
};

// GET SINGLE
export const getCampById = async (id) => {
  const res = await API.get(`/camps/${id}`);
  return res.data;
};

// REGISTER
export const registerForCamp = async (campId, data) => {
  const res = await API.post("/camps/register", {
    campId,
    ...data,
  });
  return res.data;
};

// MY CAMPS
export const getMyCamps = async () => {
  const res = await API.get("/camps/my");
  return res.data;
};

// ADMIN
export const createCamp = async (data) => {
  const res = await API.post("/camps", data);
  return res.data;
};

export const deleteCamp = async (id) => {
  const res = await API.delete(`/camps/${id}`);
  return res.data;
};