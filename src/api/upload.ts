import client from "./client";

export const uploadApi = {
  upload: async (
    file: File,
    folder:
      | "listings"
      | "avatars"
      | "vets"
      | "stores"
      | "lost-found"
      | "products" = "listings",
  ): Promise<{ url: string; path: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await client.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
