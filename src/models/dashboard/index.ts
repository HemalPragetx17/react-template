export interface IFormModal {
    _id?: string;
    name: string;
    email: string;
    joiningDate?: string;
    document: File | string;
    age: number | null;
    gender: string;
    role: string;
    status: boolean;
    technologies?: string[];
    hobbies?: string[];
    agreeToTerms?: boolean;
    bio?: string;
    startDate?: string | null;
    endDate?: string | null;
    phone: string;
    phoneCountry: string;
    profilePic: File | string;
    image: File | string;
    images: {
        _id: string;
        url: string;
    }[];
    imageToDelete: string[];
    birthTime?: string;
    appointment?: string;
}