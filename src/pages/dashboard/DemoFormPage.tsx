import { Field, Form, Formik } from "formik";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Checkbox,
    CheckboxGroup,
    DateInput,
    DateTimePicker,
    FileInput,
    Input,
    PhoneNumberInput,
    Radio,
    SelectDropdown,
    Switch,
    Textarea,
    TimePicker
} from "../../components/ui";
import type { IFormModal } from "../../models/dashboard";
import { Routing } from "../../routes/routing";
import { FormValidationSchema } from "../../validation/dashboard";

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

const DemoFormPage: React.FC = () => {
    const navigate = useNavigate();

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

    const handleBack = () => {
        navigate(Routing.Dashboard);
    };

    const handleSubmit = (value: IFormModal) => {

        const { images: _, ...data } = {
            ...value,
            productImages: value.images?.filter((img) => typeof img.url !== 'string').map((img) => img?.url)
        };

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (key === 'images' || key === 'productImages') {
                    (value as any[]).forEach((image) => {
                        if (image instanceof File) {
                            formData.append(`${key}`, image);
                        } else if (image && (image as any).name) {
                            const file = new File([image], (image as any).name);
                            formData.append(`${key}`, file);
                        }
                    });
                } else {
                    formData.append(`${key}`, JSON.stringify(value));
                }
            } else if (typeof value === 'object' && value !== null) {
                if (key === 'image' || key === 'profilePic') {
                    if (value instanceof File) {
                        formData.append(`${key}`, value);
                    } else {
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
                formData.append(key, value as string);
            }
        });
    };

    return (
        <section>
            <div className="flex justify-between items-center">
                <p className="text-2xl">Create New User</p>
                <Button type="button" variant="bordered" onClick={handleBack} className="shadow-sm">
                    Back to Dashboard
                </Button>
            </div>

            {/* Form Container */}
            <Card className="mt-10 w-full mx-auto overflow-hidden" shadow="md" fullWidth>
                <Formik
                    initialValues={initialState}
                    validationSchema={FormValidationSchema}
                    onSubmit={handleSubmit}
                    validateOnBlur={false}
                    validateOnChange={true}
                    enableReinitialize={true}
                >
                    {({ handleSubmit, values, setFieldValue }) => (
                        <Form onSubmit={handleSubmit} className="flex flex-col h-full relative">
                            {/* Scrollable Form Body */}
                            <div className="p-6 md:p-8 space-y-10">

                                {/* Section 1: Personal Details */}
                                <div className="space-y-6">
                                    <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Personal Information</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Provide profile credentials and contact details.</p>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Profile Picture */}
                                        <div className="w-full md:w-auto flex flex-col items-center md:items-start shrink-0">
                                            <Field
                                                label="Profile Pic"
                                                name="profilePic"
                                                radius='full'
                                                mode="profile"
                                                component={FileInput}
                                            />
                                        </div>

                                        {/* Information Fields */}
                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                placeholder="Enter birth time"
                                                mode="clock"
                                                isClearable={true}
                                                component={TimePicker}
                                            />

                                            {/* Appointment */}
                                            <Field
                                                name="appointment"
                                                label="Appointment"
                                                placeholder="Select appointment"
                                                timeMode="clock"
                                                isClearable={true}
                                                component={DateTimePicker}
                                            />

                                            {/* Gender */}
                                            <div className="md:col-span-1">
                                                <Field
                                                    name="gender"
                                                    label="Gender"
                                                    orientation="horizontal"
                                                    component={Radio}
                                                    options={genderOptions}
                                                />
                                            </div>

                                            {/* Status */}
                                            <div className="md:col-span-1">
                                                <Field
                                                    name="status"
                                                    label="Account Status"
                                                    component={Switch}
                                                    size="lg"
                                                    activeLabel="Active"
                                                    inactiveLabel="Inactive"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Professional Profile */}
                                <div className="space-y-6 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Professional Details</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure role assignment, stack experience, and hobbies.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Role */}
                                        <Field
                                            name="role"
                                            label="Role"
                                            placeholder="Select role"
                                            component={SelectDropdown}
                                            options={roleOptions}
                                        />

                                        {/* Joining Date */}
                                        <Field
                                            name="joiningDate"
                                            label="Joining Date"
                                            placeholder="Select joining date"
                                            isClearable={true}
                                            component={DateInput}
                                        />

                                        {/* Split Columns: Left (Tech, Duration, Hobbies) & Right (Bio) */}
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Left Side */}
                                            <div className="space-y-5">
                                                {/* Technologies */}
                                                <Field
                                                    name="technologies"
                                                    label="Technologies Stack"
                                                    placeholder="Select technologies"
                                                    component={SelectDropdown}
                                                    options={technologyOptions}
                                                    isMulti
                                                    isClearable
                                                    showCheckbox
                                                />

                                                {/* Project Duration */}
                                                <Field
                                                    name="startDate"
                                                    endDateName="endDate"
                                                    label="Project Duration"
                                                    placeholder="Select date range"
                                                    selectsRange={true}
                                                    isClearable={true}
                                                    component={DateInput}
                                                />

                                                {/* Hobbies */}
                                                <Field
                                                    name="hobbies"
                                                    label="Hobbies"
                                                    component={CheckboxGroup}
                                                    options={hobbiesOptions}
                                                    orientation="horizontal"
                                                />
                                            </div>

                                            {/* Right Side */}
                                            <div className="flex flex-col h-full justify-start">
                                                {/* User Bio */}
                                                <Field
                                                    name="bio"
                                                    label="User Bio / Notes (Optional)"
                                                    placeholder="Enter short bio or background notes"
                                                    isClearable={true}
                                                    component={Textarea}
                                                    minRows={7}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Attachments */}
                                <div className="space-y-6 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Media Attachments</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Upload primary documents or gallery files.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <Field
                                            label="Primary Image"
                                            name="image"
                                            size="sm"
                                            mode="dropzone"
                                            component={FileInput}
                                        />

                                        <Field
                                            name="images"
                                            deleteName="imageToDelete"
                                            imageArray={[]}
                                            label="Gallery Images"
                                            size="sm"
                                            mode="multi"
                                            component={FileInput}
                                        />
                                    </div>
                                </div>

                                {/* Section 4: Validation / Terms */}
                                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <Field
                                        name="agreeToTerms"
                                        label="I agree to terms and conditions"
                                        component={Checkbox}
                                    />
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-content1 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 md:px-8 flex justify-end gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
                                <Button type="button" variant="bordered" color="danger" onClick={handleBack} className="shadow-sm">
                                    Cancel
                                </Button>
                                <Button type="submit" variant="solid" color="primary" className="shadow-sm">
                                    Add User
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </section>
    );
};

export default DemoFormPage;
