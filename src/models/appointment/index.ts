import type { IBaseCreateRequest, IBaseUpdateRequest } from "../base-type";

export interface IAppointmentPerson {
    reference: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    phoneCountry?: string;
    userType: number;
    patientNo?: number;
}

export interface IAppointmentTimeSlot {
    reference: string;
    startTime: string;
    endTime: string;
    duration: number;
}

export interface IAppointmentPill {
    dosage: number;
    name: string;
    fromDate: string;
    toDate: string;
    frequency: number[];
}

export interface IAppointmentMediaCategory {
    reference: string;
    name: string;
}

export interface IAppointmentMedia {
    category: IAppointmentMediaCategory;
    reference: string;
    file: string;
    name: string;
    thumbnail: string;
    duration: number;
}

export interface IAppointmentFileReport {
    file: string;
    thumbnail: string;
    fileType: number;
    name: string;
    _id: string;
}

export interface IAppointmentRateEntry {
    value: string;
    _createdAt: string;
}

export interface IAppointmentModal extends IBaseCreateRequest, IBaseUpdateRequest {
    _id: string;
    appointmentNo: number;
    appointmentDate: string;
    acuityLevel: number;
    status: number;
    ventricularRate?: number;
    systolicBp?: string;
    heartRate?: number;
    diastolicBp?: string;
    palpitations?: number;
    breath?: number;
    chestPain?: number;
    fatigue?: number;
    afInformation?: string;
    patient: IAppointmentPerson;
    specialist: IAppointmentPerson;
    referredBy: IAppointmentPerson;
    timeSlots: IAppointmentTimeSlot;
    pill: IAppointmentPill[];
    media: IAppointmentMedia[];
    ecgReports: IAppointmentFileReport[];
    medicalTests: IAppointmentFileReport[];
    hrRate: IAppointmentRateEntry[];
    bpRate: IAppointmentRateEntry[];
}

export interface IAppointmentListResponse {
    records: IAppointmentModal[];
    total: number;
}
