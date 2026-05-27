import api from "../api";

export const exportAccountData = async () => {
  const response = await api.get("/api/account/privacy/export-data/");
  return response.data;
};

export const deleteAccount = async (currentPassword: string) => {
  const response = await api.delete("/api/account/privacy/delete-account/", {
    data: {
      current_password: currentPassword,
    },
  });

  return response.data;
};
