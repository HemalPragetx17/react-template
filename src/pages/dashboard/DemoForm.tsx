import { Field, Form, Formik } from "formik";
import React from "react";
import { Button, Checkbox, CheckboxGroup, DateInput, DateTimePicker, FileInput, Input, PhoneNumberInput, Radio, SelectDropdown, Switch, Textarea, TimePicker } from "../../components/ui";
import type { IFormModal } from "../../models/dashboard";
import { FormValidationSchema } from "../../validation/dashboard";

interface DemoFormProps {
    user: IFormModal | null;
    onUserAdd: () => void;
    handleDialogClose: () => void;
}

const initialState: IFormModal = {
    name: "",
    email: "",
    joiningDate: "",
    document: "",
    age: null,
    gender: "Male",
    technologies: [] as string[],
    hobbies: [] as string[],
    role: "",
    status: true,
    agreeToTerms: false,
    bio: "",
    startDate: null,
    endDate: null,
    phone: "",
    phoneCountry: "",
    profilePic: "",
    image: "",
    images: [],
    imageToDelete: [],
    birthTime: "",
    appointment: ""
};

const DemoForm: React.FC<DemoFormProps> = ({ user, onUserAdd, handleDialogClose }) => {
    const initialValues = React.useMemo(() => {
        return user ? { ...user, imageToDelete: user.imageToDelete || [] } : initialState;
    }, [user]);

    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
    ];

    const technologyOptions = [
        { label: "React", value: "React" },
        { label: "Node.js", value: "Node.js" },
        { label: "TypeScript", value: "TypeScript" },
        { label: "Tailwind CSS", value: "Tailwind CSS" },
        { label: "Python", value: "Python" },
        { label: "Django", value: "Django" },
        { label: "FastAPI", value: "FastAPI" },
    ];

    const hobbiesOptions = [
        { label: "Reading", value: "Reading" },
        { label: "Coding", value: "Coding" },
        { label: "Gaming", value: "Gaming" },
        { label: "Sports", value: "Sports" },
        { label: "Music", value: "Music" },
    ];

    const roleOptions = [
        { label: "Admin", value: "Admin" },
        { label: "User", value: "User" },
        { label: "Manager", value: "Manager" },
    ];

    const handleSubmit = (value: IFormModal) => {
        console.log("🚀 ~ handleSubmit ~ value:", value)

        const { images: _, ...data } = {
            ...value,
            productImages: value.images?.filter((img) => typeof img.url !== 'string').map((img) => img?.url)
        };

        const formData = new FormData();

        // Append key-value pairs to the FormData object
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Handle arrays
                if (key === 'images' || key === 'productImages') {
                    (value as any[]).forEach((image) => {
                        if (image instanceof File) {
                            formData.append(`${key}`, image);
                        } else if (image && (image as any).name) {
                            const file = new File([image], (image as any).name); // Assuming 'image' is a File object
                            formData.append(`${key}`, file);
                        }
                    });
                } else {
                    formData.append(`${key}`, JSON.stringify(value));
                }
            } else if (typeof value === 'object' && value !== null) {
                // Handle nested objects
                if (key === 'image' || key === 'profilePic') {
                    if (value instanceof File) {
                        // If value is already a File, no need to create a new one
                        formData.append(`${key}`, value);
                    } else {
                        // Convert IProductCategoriesModel to Blob and then create a File
                        const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
                        const file = new File([blob], 'filename.json');
                        formData.append(`${key}`, file);
                    }
                } else {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        formData.append(`${key}[${subKey}]`, subValue as string);
                    });
                }
            } else {
                // Handle other types
                formData.append(key, value as string);
            }
        });

        onUserAdd();
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={FormValidationSchema}
            onSubmit={handleSubmit}
            validateOnBlur={false}
            validateOnChange={true}
            enableReinitialize={true}
        >
            {({ handleSubmit, values, setFieldValue }) => (
                <Form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Pic */}
                    <Field
                        label="Profile Pic"
                        name="profilePic"
                        radius="full"
                        mode="profile"
                        component={FileInput}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <Field
                            name="name"
                            label="Full Name"
                            placeholder="Enter full name"
                            component={Input}
                        />

                        {/* Email Address */}
                        <Field
                            name="email"
                            type="email"
                            label="Email Address"
                            placeholder="Enter email address"
                            component={Input}
                        />

                        {/* Joining Date */}
                        <Field
                            name="joiningDate"
                            label="Joining Date"
                            placeholder="Select joining date"
                            isClearable={true}
                            component={DateInput}
                        />

                        {/* Phone Number */}
                        <Field
                            country={'in'}
                            type="tel"
                            name='phone'
                            label="Phone Number"
                            inputProps={{
                                name: 'phone',
                                required: true,
                            }}
                            value={values?.phone}
                            onChange={(value: string, country: any) => {
                                setFieldValue('phoneCountry', `+${country.dialCode}`);
                                setFieldValue('phone', value);
                            }}
                            component={PhoneNumberInput}
                        />

                        {/* Document */}
                        <Field
                            name="document"
                            label="Document"
                            placeholder="Enter document"
                            component={FileInput}
                        />

                        {/* Age */}
                        <Field
                            name="age"
                            type="number"
                            label="Age"
                            placeholder="Enter age"
                            component={Input}
                        />

                        {/* Birth Time */}
                        <Field
                            name="birthTime"
                            label="Birth Time"
                            mode="clock"
                            isClearable={true}
                            component={TimePicker}
                        />

                        {/* Appointment */}
                        <Field
                            name="appointment"
                            label="Appointment"
                            timeMode="clock"
                            isClearable={true}
                            component={DateTimePicker}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gender (Radio) */}
                        <Field
                            name="gender"
                            label="Gender"
                            orientation="horizontal"
                            component={Radio}
                            options={genderOptions}
                        />

                        {/* Status (Switch) */}
                        <Field
                            name="status"
                            label="Account Status"
                            component={Switch}
                            activeLabel="Active"
                            inactiveLabel="Inactive"
                        />
                    </div>

                    <Field
                        label="Image"
                        name="image"
                        size="sm"
                        mode="dropzone"
                        component={FileInput}
                    />

                    <Field
                        name="images"
                        deleteName="imageToDelete"
                        imageArray={user?.images ?? []}
                        label="Images"
                        size="sm"
                        mode="multi"
                        component={FileInput}
                    />

                    {/* Technologies Stack (SelectDropdown - multi select) */}
                    <Field
                        name="technologies"
                        label="Technologies Stack"
                        component={SelectDropdown}
                        options={technologyOptions}
                        isMulti
                        isClearable
                        showCheckbox
                    />

                    <Field
                        name="hobbies"
                        label="Hobbies"
                        component={CheckboxGroup}
                        options={hobbiesOptions}
                        orientation="horizontal"
                    />

                    {/* Role (SelectDropdown - single select) */}
                    <Field
                        name="role"
                        label="Role"
                        component={SelectDropdown}
                        options={roleOptions}
                    />

                    <Field
                        name="startDate"
                        endDateName="endDate"
                        label="Project Duration"
                        placeholder="Select date range"
                        selectsRange={true}
                        isClearable={true}
                        component={DateInput}
                    />

                    {/* User Bio / Notes (Textarea) */}
                    <Field
                        name="bio"
                        label="User Bio / Notes (Optional)"
                        placeholder="Enter short bio or background notes"
                        isClearable={true}
                        component={Textarea}
                        rows={3}
                    />

                    {/* Agree to Terms Checkbox */}
                    <Field
                        name="agreeToTerms"
                        label="Agree to terms"
                        component={Checkbox}
                    />

                    {/* Footer Action Area */}
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="bordered" color="danger" onClick={handleDialogClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="solid" color="primary">
                            Add User
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default DemoForm;
