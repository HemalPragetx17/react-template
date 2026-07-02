import * as Yup from 'yup';
import { RegularExpression } from '../../shared/constants/regular-expression';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export const FormValidationSchema = () => {
    return Yup.object().shape({
        name: Yup.string().matches(RegularExpression.FullName, 'Invalid name').required("Full name is required"),
        email: Yup.string().matches(RegularExpression.Email, 'Invalid email').email("Invalid email address").required("Email is required"),
        joiningDate: Yup.string().required("Joining date is required"),
        age: Yup.number()
            .typeError("Age must be a valid number")
            .positive("Age must be positive")
            .integer("Age must be an integer")
            .required("Age is required"),
        technologies: Yup.array()
            .min(1, "Please select at least one technology")
            .required("Technologies stack is required"),
        hobbies: Yup.array()
            .min(1, "Please select at least one hobbies")
            .required("Hobbies stack is required"),
        role: Yup.string().required("Role is required"),
        bio: Yup.string()
            .matches(RegularExpression.Description, 'Invalid bio')
            .max(300, "Bio must be at most 300 characters")
            .optional(),
        startDate: Yup.string()
            .nullable()
            .test("is-start-date", "Select start date and end date", (value, context) => {
                const { endDate } = context.parent || {};
                const hasStart = value !== null && value !== undefined && value !== "";
                const hasEnd = endDate !== null && endDate !== undefined && endDate !== "";
                if (!hasStart && !hasEnd) {
                    return context.createError({ message: "Select start date and end date" });
                }
                if (!hasStart) {
                    return context.createError({ message: "Select start date" });
                }
                return true;
            }),
        endDate: Yup.string()
            .nullable()
            .test("is-end-date", "Select end date", (value, context) => {
                const { startDate } = context.parent || {};
                const hasStart = startDate !== null && startDate !== undefined && startDate !== "";
                const hasEnd = value !== null && value !== undefined && value !== "";
                if (!hasStart && !hasEnd) {
                    return context.createError({ message: "Select start date and end date" });
                }
                if (hasStart && !hasEnd) {
                    return context.createError({ message: "Select end date" });
                }
                return true;
            }),
        phone: Yup.string()
            .required("Phone number is required")
            .test("is-phone-valid", "Invalid phone number", (value) => {
                if (!value) return true;
                const formatted = value.startsWith("+") ? value : `+${value}`;
                const parsed = parsePhoneNumberFromString(formatted);
                if (!parsed || !parsed.isValid()) {
                    return false;
                }
                const type = parsed.getType();
                return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
            }),
        phoneCountry: Yup.string().required("Country code is required"),
        profilePic: Yup.mixed()
            .nullable()
            .required('Profile picture is required!')
            .test("fileFormat", "Unsupported file format", (value) => {
                if (!value) return true;
                if (typeof value === "string") return true;
                const file = value as File;
                const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
                return validTypes.includes(file.type);
            })
            .test("fileSize", "File size must be less than 2MB", (value) => {
                if (!value) return true;
                if (typeof value === "string") return true;
                const file = value as File;
                return file.size <= 2097152; // 2MB in bytes
            }),
        image: Yup.mixed()
            .nullable()
            .required('Image is required!')
            .test("fileFormat", "Unsupported file format", (value) => {
                if (!value) return true;
                if (typeof value === "string") return true;
                const file = value as File;
                const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf", "video/mp4" ];
                return validTypes.includes(file.type);
            })
            .test("fileSize", "File size must be less than 2MB", (value) => {
                if (!value) return true;
                if (typeof value === "string") return true;
                const file = value as File;
                return file.size <= 2097152; // 2MB in bytes
            }),
        images: Yup.array()
            .required("Images stack is required")
            .min(1, "Please upload at least one image")
            .test("fileFormat", "Unsupported file format in one or more images", (value) => {
                if (!value) return true;
                const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
                return value.every((img: any) => {
                    if (typeof img.url === "string") return true;
                    if (img.url instanceof File) {
                        return validTypes.includes(img.url.type);
                    }
                    return false;
                });
            })
            .test("fileSize", "Each image size must be less than 2MB", (value) => {
                if (!value) return true;
                return value.every((img: any) => {
                    if (typeof img.url === "string") return true;
                    if (img.url instanceof File) {
                        return img.url.size <= 2097152;
                    }
                    return false;
                });
            }),
    });
}