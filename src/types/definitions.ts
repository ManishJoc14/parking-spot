export interface SignUpWithEmailPROPS {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  hasAcceptedTerms: boolean;
  redirectUrl: string;
  accountType: "DRIVER" | "OWNER";
}

export interface User {
  id: number;
  photo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roles: string[];
  phoneNo: string;

  dateJoined?: string;
  fullName?: string;
  bio?: string;
  redirectUrl?: string;
  uuid?: string;
  status?: string;
}

export interface AdminParkingSpot {
  id: string;
  name: string;
  coverImage: string;
  address: string;
  postcode: string;
  ratePerHour: string;
  ratePerDay: string;
}

export interface Feedback {
  id?: number;
  fullName: string;
  email: string;
  role: string;
  rating: number;
  message: string;
}

export interface ParkingLocation {
  id: number; // unique id of each parking location
  uuid: string; // non-unique uuid of each parking spot (i.e one parking spot can have multiple parking locations)
  name: string;
  coverImage: string;
  description: string;
  address: string;
  ratePerHour: string;
  latitude: number;
  longitude: number;
  postcode: string;
  ratePerDay: string;
  totalReviews: number;
  averageRating: number;
}

export type OrderingOptions =
  | "rate_per_hour"
  | "-rate_per_hour"
  | "average_rating"
  | "-average_rating"
  | "distance"
  | "-distance";

export enum VehicleType {
  SMALL = "Small Car",
  MEDIUM = "Medium Car",
  SUV = "Large Car (SUV)",
  BIKE = "Bike",
  TRUCK = "Truck",
  MINIBUS = "Minibus",
  VAN = "Van",
}

export enum ParkingFeature {
  CCTV = "CCTV",
  EV_CHARGING = "EV Charging",
  SECURITY_LIGHTING = "Security Lighting",
  HANDICAP_ACCESSIBLE = "Handicap Accessible",
  COVERED = "Covered Parking",
  GUARDS = "Security Guards",
}

export enum DayOfWeek {
  MON = "Monday",
  TUE = "Tuesday",
  WED = "Wednesday",
  THU = "Thursday",
  FRI = "Friday",
  SAT = "Saturday",
  SUN = "Sunday",
}

export interface VehicleCapacity {
  id?: number;
  vehicleType: string;
  capacity: number;
}

export interface Feature {
  id?: number;
  feature: string;
}

export interface Availability {
  id?: number;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Review {
  id?: number;
  reviewer: {
    uuid: string;
    fullName: string;
    photo: string | null;
  };
  rating: number;
  comments: string;
  createdAt: string;
}

export interface ParkingDetailed {
  id: number;
  name: string;
  coverImage: string;
  description: string;
  address: string;
  ratePerHour: string;
  ratePerDay: string;
  latitude: number;
  longitude: number;
  totalReviews: number;
  averageRating: number;
  postcode?: string;
  distance?: number;
  vehiclesCapacity: VehicleCapacity[];
  features: Feature[];
  availabilities: Availability[];
  reviews: Review[];
}

export enum BookingStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
}

export interface BookingResponse {
  message: string;
  bookingNo: string;
  vehicleNo: string;
  vehicle: VehicleType;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  paymentStatus: PaymentStatus;
  amount: number;
}

export interface Booking {
  id: number;
  userId: string;
  parkingSpot: number;
  status: BookingStatus;
  bookingNo: string;
  startTime: string;
  endTime: string;
  amount: string;
  paymentStatus: PaymentStatus;
  vehicleNo: string;
  vehicle: VehicleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
