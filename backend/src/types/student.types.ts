export interface IUser {
  _id: string;
  email: string;
  password: string;
  profile: IProfile;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  education?: {
    level: string;
    institution?: string;
    fieldOfStudy?: string;
    gpa?: number;
    graduationYear?: number;
  };
  avatar?: string;
}

export interface IScholarship {
  _id: string;
  title: string;
  description: string;
  amount: number;
  deadline: Date;
  eligibility: {
    minGPA?: number;
    educationLevel?: string[];
    fieldOfStudy?: string[];
    countries?: string[];
  };
  provider: string;
  applicationUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserScholarship {
  _id: string;
  userId: string;
  scholarshipId: string;
  status: "bookmarked" | "applied";
  appliedAt?: Date;
  bookmarkedAt?: Date;
  notes?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}
