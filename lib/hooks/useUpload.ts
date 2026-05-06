import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

type UploadResponse = {
  success: boolean;
  data: {
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  };
};

// Get video upload URL
export function useVideoUpload() {
  return useMutation({
    mutationFn: async (data: { fileName: string; contentType: string }) => {
      const response = await api.post<UploadResponse>("/upload/video", data);
      return response.data.data;
    },
  });
}

// Get PDF upload URL
export function usePdfUpload() {
  return useMutation({
    mutationFn: async (data: { fileName: string; contentType: string }) => {
      const response = await api.post<UploadResponse>("/upload/pdf", data);
      return response.data.data;
    },
  });
}

// Get image upload URL
export function useImageUpload() {
  return useMutation({
    mutationFn: async (data: { fileName: string; contentType: string }) => {
      const response = await api.post<UploadResponse>("/upload/image", data);
      return response.data.data;
    },
  });
}

// Upload file to signed URL
export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
}
