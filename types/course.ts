export type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  teacherId: string;
  teacherName: string;
  price: number;
  discountType?: "fixed" | "percentage" | null;
  discountValue?: number | null;
  effectivePrice?: number;
  durationHours: number | null;
  level: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MyCoursesApiResponse = {
  success: boolean;
  data: Course[];
};
