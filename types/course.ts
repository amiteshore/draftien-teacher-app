export type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  teacherId: string;
  teacherName: string;
  teachers?: { id: string; name: string | null; email: string | null; isPrimary?: boolean }[];
  price: number;
  discountType?: "fixed" | "percentage" | null;
  discountValue?: number | null;
  effectivePrice?: number;
  durationHours: number | null;
  durationType?: string | null;
  durationValue?: number | null;
  availabilityType?: string;
  startDate?: string | null;
  endDate?: string | null;
  level: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MyCoursesApiResponse = {
  success: boolean;
  data: Course[];
};
