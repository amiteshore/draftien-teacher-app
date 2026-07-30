import { api } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export type Banner = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  ctaText: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  scheduledFrom: string | null;
  scheduledTo: string | null;
  displayOrder: number;
  impressionsCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
};

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Banner[] }>("/banners");
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrackBannerImpression() {
  return useMutation({
    mutationFn: async (bannerId: number) => {
      await api.post(`/banners/${bannerId}/impression`);
    },
  });
}

export function useTrackBannerClick() {
  return useMutation({
    mutationFn: async (bannerId: number) => {
      await api.post(`/banners/${bannerId}/click`);
    },
  });
}
