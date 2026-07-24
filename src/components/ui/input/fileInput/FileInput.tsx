import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import {
  FaFile,
} from "react-icons/fa";
import { FaRegTrashCan, FaUserLarge, FaXmark } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import Button from "../../button/Button";
import { DEFAULT_RADIUS, getRadiusClass, type Radius } from "../../shared/radius";
import {
  fieldPlaceholderClasses,
  fieldValueClasses,
  errorClasses,
  focusBorderColors,
  focusTextColors,
  getInputVariantClasses,
  getInteractiveBorderClass,
  getWrapperBaseClasses,
  inputDisabledOpacityClass,
  inputDisabledWrapperClasses,
  labelClasses,
  labelFloatingClasses,
  underlineColors,
  type FieldColor,
} from "../../shared/fieldStyles";
import { FieldLabelContent } from "../../shared/FieldLabelContent";
import "./index.css";

const PdfPreview = React.lazy(() => import("./PdfPreview"));

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface Image {
  _id: string;
  url: File | string;
}

export type FileInputMode = "profile" | "dropzone" | "multi" | "normal";

export interface FileInputProps {
  mode?: FileInputMode;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
  isPreviewOn?: boolean;
  accept?: Record<string, string[]>;

  // For single-file modes ("profile", "dropzone", "normal")
  value?: string | File | null;
  onChange?: (value: File | null) => void;

  // For multi-file mode ("multi")
  images?: Image[];
  setImages?: (images: Image[]) => void;
  deleteImages?: Image[];
  setDeleteImages?: (deleteImages: Image[]) => void;
  deleteName?: string;
  imageArray?: Image[];

  // Styling / Theme variants (for "normal" mode)
  variant?: "flat" | "bordered" | "underlined" | "faded";
  size?: "sm" | "md" | "lg";
  radius?: Radius;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  labelPlacement?: "inside" | "outside" | "outside-left" | "outside-top" | "outlined";
  containerClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isRequired?: boolean;
  inputClassName?: string;

  // Formik integration
  field?: FieldInputProps<any>;
  form?: {
    values: any;
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void;
    setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void;
  };
  error?: string;
  touched?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Helpers & Subcomponents                       */
/* -------------------------------------------------------------------------- */

const getFileType = (file: any): "image" | "video" | "pdf" | "unknown" => {
  if (!file) return "unknown";
  const type = file.type || "";
  const name =
    file instanceof File
      ? file.name.toLowerCase()
      : typeof file.url === "string"
        ? file.url.toLowerCase()
        : typeof file === "string"
          ? file.toLowerCase()
          : "";

  if (
    type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  ) {
    return "image";
  }
  if (
    type.startsWith("video/") ||
    name.endsWith(".mp4") ||
    name.endsWith(".webm") ||
    name.endsWith(".ogg") ||
    name.includes("video")
  ) {
    return "video";
  }
  if (type === "application/pdf" || name.endsWith(".pdf") || name.includes("pdf")) {
    return "pdf";
  }
  return "unknown";
};

/* -------------------------------------------------------------------------- */
/*                         Multi Mode Preview Item                            */
/* -------------------------------------------------------------------------- */

const ImagePreviewItem = ({
  image,
  onDelete,
  isPreviewOn,
  disabled,
  size = "md",
  radius = DEFAULT_RADIUS,
}: {
  image: Image;
  onDelete: () => void;
  isPreviewOn?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  radius?: Radius;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (image.url instanceof File) {
      const url = URL.createObjectURL(image.url);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof image.url === "string") {
      setPreviewUrl(image.url);
    }
  }, [image.url]);

  const fileType = getFileType(image.url instanceof File ? image.url : image);
  const isPdf = fileType === "pdf";
  const isImage = fileType === "image";
  const isVideo = fileType === "video";

  const handleCardClick = () => {
    if (isPdf) {
      window.open(previewUrl || (image.url as string), "_blank");
    } else {
      setIsModalOpen(true);
    }
  };

  const dropzoneSizeConfigs = {
    sm: {
      val: 150,
      icon: "w-6 h-6",
      text: "text-[10px]",
    },
    md: {
      val: 200,
      icon: "w-8 h-8",
      text: "text-xs",
    },
    lg: {
      val: 250,
      icon: "w-10 h-10",
      text: "text-sm",
    },
  };
  const dropzoneSize = dropzoneSizeConfigs[size] || dropzoneSizeConfigs.md;
  const dropzoneSizeVal = dropzoneSize.val;

  const dropzoneRadiusClass = getRadiusClass(radius);

  return (
    <div className="relative" style={{ width: `${dropzoneSizeVal}px`, height: `${dropzoneSizeVal}px` }}>
      <div
        {...(isPreviewOn && !disabled ? { onClick: handleCardClick } : {})}
        className={`border-2 relative w-full h-full overflow-hidden group ${isPreviewOn && !disabled ? "cursor-pointer" : ""
          } ${isPdf ? "form-upload-pdf" : "form-upload-img"} ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : ""
          } ${dropzoneRadiusClass}`}
      >
        <div className={`w-full h-full overflow-hidden ${dropzoneRadiusClass}`}>
          {isPdf ? (
            <Suspense fallback={<div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
              <PdfPreview file={image.url} />
            </Suspense>
          ) : isVideo ? (
            <video
              src={previewUrl}
              className="w-full h-full object-contain bg-black"
              preload="auto"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : isImage && previewUrl ? (
            <img src={previewUrl} alt={`Images ${image?._id}`} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400">
              <FaFile className={`${dropzoneSize.icon} mb-1`} aria-hidden />
              <span className={`${dropzoneSize.text} font-semibold uppercase`}>
                {image.url instanceof File ? image.url.name.split(".").pop() : "FILE"}
              </span>
            </div>
          )}
        </div>
      </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`absolute z-50 bg-white/95 dark:bg-neutral-800/90 hover:bg-red-500 border border-neutral-200/80 dark:border-neutral-700/80 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md group/btn cursor-pointer ${radius === "full" ? "" : "-top-3 -right-3"
            }`}
          style={
            radius === "full"
              ? (
                size === "sm"
                  ? { top: "0px", right: "10px" }
                  : size === "md"
                    ? { top: "4px", right: "24px" }
                    : { top: "8px", right: "32px" }
              ) : { top: "-12px", right: "-12px" }
          }
          title="Remove File"
        >
          <FaRegTrashCan
            className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 group-hover/btn:text-white transition-colors duration-200"
            aria-hidden
          />
        </div>

      {/* Full Preview Modal */}
      {isModalOpen &&
        createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors text-white duration-200 focus:outline-none"
                title="Close"
              >
                <FaXmark className="w-6 h-6 text-white" aria-hidden />
              </button>

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
              >
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className={`max-w-full max-h-full ${getRadiusClass()} shadow-2xl object-contain bg-black`}
                  />
                ) : isImage ? (
                  <img
                    src={previewUrl}
                    alt="Full Preview"
                    className={`max-w-full max-h-full ${getRadiusClass()} shadow-2xl object-contain bg-neutral-900`}
                  />
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                         Main FileInput Component                      */
/* -------------------------------------------------------------------------- */

const FileInput = ({
  mode = "normal",
  label,
  placeholder,
  disabled = false,
  isClearable = true,
  isPreviewOn = true,
  accept,

  // Single file props
  value,
  onChange,

  // Multi file props
  images: manualImages,
  setImages: manualSetImages,
  deleteImages: manualDeleteImages,
  setDeleteImages: manualSetDeleteImages,
  deleteName = "imageToDelete",
  imageArray,

  // Styles
  variant = "bordered",
  size = "md",
  radius = DEFAULT_RADIUS,
  color = "primary",
  labelPlacement = "outside-top",
  containerClassName = "",
  wrapperClassName = "",
  labelClassName = "",
  errorClassName = "",
  isRequired = false,

  // Formik props
  field,
  form,
  error,
  touched,
}: FileInputProps) => {
  const isFormik = Boolean(field && form);
  const fieldName = field?.name || "";

  const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

  // Single file resolutions
  const singleFile = isFormik && field ? field.value : value;
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!singleFile) {
      setPreviewUrl("");
      return;
    }
    if (typeof singleFile === "string") {
      setPreviewUrl(singleFile);
      return;
    }
    if (singleFile instanceof File) {
      const url = URL.createObjectURL(singleFile);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl("");
  }, [singleFile]);

  const handleSingleFileChange = (file: File | null) => {
    if (isFormik && form && field) {
      form.setFieldValue?.(field?.name, file);
      form.setFieldTouched?.(field?.name, true, false);
    }
    if (onChange) {
      onChange(file);
    }
  };

  const handleClearSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSingleFileChange(null);
  };

  // Multi file resolutions
  const images = isFormik && field ? field.value || [] : manualImages || [];
  const deleteImages = isFormik && form ? form.values[deleteName] || [] : manualDeleteImages || [];

  useEffect(() => {
    if (imageArray && imageArray.length > 0) {
      if (isFormik && form && field) {
        if (!field.value || field.value.length === 0) {
          form.setFieldValue?.(field?.name, imageArray);
        }
      } else if (manualSetImages) {
        const isDifferent =
          imageArray.length !== (manualImages?.length || 0) ||
          imageArray.some(
            (img, idx) =>
              img._id !== manualImages?.[idx]?._id || img.url !== manualImages?.[idx]?.url
          );
        if (isDifferent) {
          manualSetImages(imageArray);
        }
      }
    }
  }, [imageArray, isFormik, fieldName]);

  const handleMultiFileChange = (acceptedFiles: File[]) => {
    const filteredFiles = acceptedFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf"
    );

    const newImages: Image[] = filteredFiles.map((file, index) => ({
      _id: (images.length + index + 1).toString(),
      url: file,
    }));

    const updated = [...images, ...newImages];
    if (isFormik && form && field) {
      form.setFieldValue?.(field?.name, updated);
      form.setFieldTouched?.(field?.name, true, false);
    } else if (manualSetImages) {
      manualSetImages(updated);
    }
  };

  const handleMultiImageDelete = (deleteImage: Image) => {
    const updated = images.filter((img: Image) => img._id !== deleteImage._id);

    if (typeof deleteImage?.url === "string") {
      const updatedDeleted = [...deleteImages, deleteImage];
      if (isFormik && form) {
        form.setFieldValue?.(deleteName, updatedDeleted);
      } else if (manualSetDeleteImages) {
        manualSetDeleteImages(updatedDeleted);
      }
    }

    if (isFormik && form && field) {
      form.setFieldValue?.(field?.name, updated);
      form.setFieldTouched?.(field?.name, true, false);
    } else if (manualSetImages) {
      manualSetImages(updated);
    }
  };

  // Dropzone Setup
  const isMulti = mode === "multi";
  const { getRootProps, getInputProps, isFocused } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (isMulti) {
        handleMultiFileChange(acceptedFiles);
      } else {
        const file = acceptedFiles[0] || null;
        handleSingleFileChange(file);
      }
    },
    disabled,
    accept: accept || {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/jpg": [".jpg"],
      "application/pdf": [".pdf"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogg"],
      "video/quicktime": [".mov"],
    },
    multiple: isMulti,
  });

  // Error Resolving
  const resolvedTouched = isFormik && form ? form.touched[fieldName] : touched;
  const resolvedError = isFormik && form ? form.errors[fieldName] : error;
  const hasError = Boolean(resolvedTouched && resolvedError);

  const fileType = getFileType(singleFile);
  const isPdf = fileType === "pdf";
  const isImage = fileType === "image";
  const isVideo = fileType === "video";
  const isSupported = fileType !== "unknown";

  const handleSingleCardClick = () => {
    if (isPdf) {
      window.open(previewUrl || (singleFile as string), "_blank");
    } else {
      setIsModalOpen(true);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                         Aesthetics & Layout Settings                       */
  /* -------------------------------------------------------------------------- */

  const sizeConfigs = {
    sm: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-1 px-2.5" : "py-1.5 px-2.5",
      textSize: "text-xs",
      labelSize: "text-[10px]",
      insideHeight: "h-12",
      outsideHeight: "h-10",
      floatY: labelPlacement === "inside" && label ? -20 : -10,
      floatX: labelPlacement === "inside" && label ? -3 : 0,
      initialY: -8,
      floatYOutside: -41,
      floatXOutside: -14,
      floatScale: 0.83,
      outlinedFloatY: -28.5,
      outlinedInitialY: -8,
    },
    md: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-1.5 px-3" : "py-2.5 px-3",
      textSize: "text-sm",
      labelSize: "text-xs",
      insideHeight: "h-14",
      outsideHeight: "h-12",
      floatY: labelPlacement === "inside" && label ? -23 : -12,
      floatX: labelPlacement === "inside" && label ? 0 : 0,
      initialY: -10,
      floatYOutside: -47,
      floatXOutside: -14,
      floatScale: 0.85,
      outlinedFloatY: -35,
      outlinedInitialY: -10,
    },
    lg: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-2 px-4" : "py-3.5 px-4",
      textSize: "text-base",
      labelSize: "text-sm",
      insideHeight: "h-16",
      outsideHeight: "h-14",
      floatY: labelPlacement === "inside" && label ? -26 : -14,
      floatX: labelPlacement === "inside" && label ? 3 : 0,
      initialY: -12,
      floatYOutside: -54,
      floatXOutside: -14,
      floatScale: 0.87,
      outlinedFloatY: -41,
      outlinedInitialY: -12,
    },
  };

  const variantConfigs = {
    flat: getInputVariantClasses("flat", color as FieldColor),
    bordered: getInputVariantClasses("bordered", color as FieldColor),
    underlined: getInputVariantClasses("underlined", color as FieldColor),
    faded: getInputVariantClasses("faded", color as FieldColor),
  };

  const radiusClass = resolvedVariant === "underlined" ? "rounded-none" : getRadiusClass(radius);

  const isOutlined = labelPlacement === "outlined";
  const sz = sizeConfigs[size] || sizeConfigs.md;
  const variantClass = isOutlined ? "bg-transparent border-none" : (variantConfigs[resolvedVariant] || variantConfigs.bordered);

  const wrapperBaseClasses = getWrapperBaseClasses({
    wrapperClassName,
    variant: resolvedVariant,
    isOutlined,
    isActive: isFocused,
    hasError,
  });

  const interactiveBorderClass = getInteractiveBorderClass({
    variant: resolvedVariant,
    isOutlined,
    isActive: isFocused,
    hasError,
    color: color as FieldColor,
  });

  const profileSizeConfigs = {
    sm: 96,
    md: 144,
    lg: 176,
  };
  const profileSizeVal = profileSizeConfigs[size] || 144;

  const profileRadiusClass = radius ? getRadiusClass(radius) : "rounded-full";

  const dropzoneSizeConfigs = {
    sm: {
      val: 150,
      icon: "w-6 h-6",
      text: "text-[10px]",
    },
    md: {
      val: 200,
      icon: "w-8 h-8",
      text: "text-xs",
    },
    lg: {
      val: 250,
      icon: "w-10 h-10",
      text: "text-sm",
    },
  };
  const dropzoneSize = dropzoneSizeConfigs[size] || dropzoneSizeConfigs.md;
  const dropzoneSizeVal = dropzoneSize.val;

  const dropzoneRadiusClass = getRadiusClass(radius);

  const isOutsideLeft = labelPlacement === "outside-left";
  const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
  const hasValue = !!singleFile;
  const shouldFloat = isFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);
  const resolvedPlaceholder = placeholder || (isFloating || isOutlined ? "" : "Select file");

  const renderOutsideLabel = () => {
    if (!label || isFloating || isOutlined || mode !== "normal") return null;

    return (
      <label
        htmlFor={fieldName}
        className={`${labelClasses} ${isOutsideLeft ? "mb-0 shrink-0" : "mb-2"} ${labelClassName}`}
      >
        <FieldLabelContent label={label} isRequired={isRequired} />
      </label>
    );
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* --------------------------------------------------------------------
      PROFILE MODE                                                        
      -------------------------------------------------------------------- */}
      {mode === "profile" && (
        <div>
          {!previewUrl ? (
            <div {...getRootProps()} className="flex justify-center">
              <label
                className={`flex flex-col items-center overflow-hidden bg-white dark:bg-neutral-800 tracking-wide uppercase border-2 ${profileRadiusClass} ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : "cursor-pointer hover:border-primary-400"
                  } ${hasError ? "error-red-border border-danger" : ""}`}
                style={{ width: `${profileSizeVal}px`, height: `${profileSizeVal}px` }}
              >
                <FaUserLarge className="w-full h-full text-default-500" />
              </label>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative" style={{ width: `${profileSizeVal}px`, height: `${profileSizeVal}px` }}>
                <div
                  {...(isPreviewOn && !disabled
                    ? { onClick: () => setIsModalOpen(true) }
                    : getRootProps())}
                  className={`border-2 overflow-hidden form-upload-img w-full h-full ${profileRadiusClass} ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : "cursor-pointer"
                    }`}
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                {!disabled && (
                  <div
                    onClick={handleClearSingle}
                    className={`absolute z-50 bg-white/95 dark:bg-neutral-800/90 hover:bg-red-500 border border-neutral-200/80 dark:border-neutral-700/80 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md group/btn cursor-pointer`}
                    style={
                      radius === "full"
                        ? (
                          size === "sm"
                            ? { top: "-4px", right: "-4px" }
                            : size === "md"
                              ? { top: "4px", right: "4px" }
                              : { top: "8px", right: "8px" }
                        ) : { top: "-16px", right: "-16px" }
                    }
                    title="Remove File"
                  >
                    <FaRegTrashCan
                      className="w-4 h-4 text-neutral-700 dark:text-neutral-300 group-hover/btn:text-white transition-colors duration-200"
                      aria-hidden
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {label && (
            <div className="w-full text-center mt-2">
              <label className={`${labelClasses} ${labelClassName}`} htmlFor={fieldName || "label"}>
                <FieldLabelContent label={label} isRequired={isRequired} />
              </label>
            </div>
          )}
          <input {...getInputProps()} style={{ display: "none" }} />
        </div>
      )}

      {/* --------------------------------------------------------------------
      DROPZONE MODE                                                       
      -------------------------------------------------------------------- */}
      {mode === "dropzone" && (
        <div>
          {label && (
            <label className={`${labelClasses} mb-2 ${labelClassName}`} htmlFor={fieldName || "label"}>
              <FieldLabelContent label={label} isRequired={isRequired} />
            </label>
          )}
          {!previewUrl || !isSupported ? (
            <div {...getRootProps()} className="relative mt-2" style={{ width: `${dropzoneSizeVal}px`, height: `${dropzoneSizeVal}px` }}>
              <label
                className={`flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-800 tracking-wide uppercase border-2 w-full h-full ${dropzoneRadiusClass}
                  ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : "cursor-pointer hover:border-primary-400"} 
                  ${hasError ? "error-red-border border-danger" : ""}
                `}
              >
                <FiUpload className={dropzoneSize.icon} aria-hidden />
                <span className={`mt-2 ${dropzoneSize.text} font-semibold text-gray-500 text-center`}>Select or drag a file</span>
              </label>
            </div>
          ) : (
            <div className="relative mt-2" style={{ width: `${dropzoneSizeVal}px`, height: `${dropzoneSizeVal}px` }}>
              <div
                {...(isPreviewOn ? { onClick: handleSingleCardClick } : getRootProps())}
                className={`border-2 relative w-full h-full group ${isPdf ? "form-upload-pdf" : "form-upload-img"
                  } ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : "cursor-pointer"} ${dropzoneRadiusClass}`}
              >
                <div className={`w-full h-full overflow-hidden ${dropzoneRadiusClass}`}>
                  {isPdf ? (
                    <Suspense fallback={<div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
                      <PdfPreview file={singleFile} />
                    </Suspense>
                  ) : isVideo ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain bg-black"
                      preload="auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
              {!disabled && (
                <div
                  onClick={handleClearSingle}
                  className={`absolute z-50 bg-white/95 dark:bg-neutral-800/90 hover:bg-red-500 border border-neutral-200/80 dark:border-neutral-700/80 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md group/btn cursor-pointer ${radius === "full" ? "" : "-top-4 -right-4"
                    }`}
                  style={
                    radius === "full"
                      ? (
                        size === "sm"
                          ? { top: "4px", right: "4px" }
                          : size === "md"
                            ? { top: "8px", right: "16px" }
                            : { top: "8px", right: "28px" }
                      ) : { top: "-16px", right: "-16px" }
                  }
                  title="Remove File"
                >
                  <FaRegTrashCan
                    className="w-4 h-4 text-neutral-700 dark:text-neutral-300 group-hover/btn:text-white transition-colors duration-200"
                    aria-hidden
                  />
                </div>
              )}
            </div>
          )}
          <input {...getInputProps()} style={{ display: "none" }} />
        </div>
      )}

      {/* --------------------------------------------------------------------
      MULTI MODE                                                          
      -------------------------------------------------------------------- */}
      {mode === "multi" && (
        <div className="w-full">
          {label && (
            <label className={`${labelClasses} mb-2 ${labelClassName}`} htmlFor={fieldName}>
              <FieldLabelContent label={label} isRequired={isRequired} />
            </label>
          )}
          <div className="flex mt-2 gap-6 flex-wrap">
            {images?.map((image: Image, index: number) => {
              const isDeleted = deleteImages.some(
                (delImg: Image) => delImg._id === image._id && delImg.url === image.url
              );
              if (!isDeleted) {
                return (
                  <ImagePreviewItem
                    key={index}
                    image={image}
                    onDelete={() => handleMultiImageDelete(image)}
                    isPreviewOn={isPreviewOn}
                    disabled={disabled}
                    size={size}
                    radius={radius}
                  />
                );
              } else return null;
            })}
            <div {...getRootProps()} className="relative">
              <input {...getInputProps()} />
              <label
                className={`flex flex-col items-center justify-center px-4 bg-white dark:bg-neutral-800 tracking-wide uppercase border-2 ${dropzoneRadiusClass} ${disabled ? `cursor-not-allowed ${inputDisabledOpacityClass}` : "cursor-pointer hover:border-primary-400"
                  } ${hasError ? "error-red-border border-danger" : ""}`}
                style={{ width: `${dropzoneSizeVal}px`, height: `${dropzoneSizeVal}px` }}
              >
                <FiUpload className={dropzoneSize.icon} aria-hidden />
                <span className={`mt-2 ${dropzoneSize.text} font-semibold text-gray-500 text-center`}>Select or drag a file</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
      NORMAL / INPUT MODE                                                 
      -------------------------------------------------------------------- */}
      {mode === "normal" && (
        <div className={isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}>
          {renderOutsideLabel()}

          <div
            {...getRootProps()}
            className={`
              relative flex items-center justify-between w-full transition-all duration-200 ease-in-out cursor-pointer select-none box-border group
              ${variantClass}
              ${radiusClass}
              ${wrapperBaseClasses}
              ${sz.wrapperPadding}
              ${labelPlacement === "inside" ? sz.insideHeight : `${sz.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`}
              ${interactiveBorderClass}
              ${disabled ? inputDisabledWrapperClasses : ""}
            `}
          >
            {/* ── Outlined Fieldset Border + Legend Notch ────────────────────── */}
            {isOutlined && (
              <fieldset
                className={`
                  absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                  ${radiusClass}
                  ${hasError
                    ? "border-2 border-red-500 dark:border-red-500"
                    : isFocused
                      ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                      : "border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"
                  }
                `}
              >
                {label && (
                  <legend
                    className={`
                      ml-2 font-medium transition-all duration-200 ease-out block whitespace-nowrap overflow-hidden invisible
                      ${shouldFloat || isFocused || hasValue ? "max-w-full px-1" : "max-w-0 px-0"}
                    `}
                    style={{
                      fontSize: `${size === "sm" ? 9 : size === "lg" ? 12 : 10.5}px`,
                      height: 0,
                    }}
                  >
                    <span><FieldLabelContent label={label} isRequired={isRequired} /></span>
                  </legend>
                )}
              </fieldset>
            )}

            {/* Floating Label for normal mode */}
            {(isFloating || isOutlined) && label && (
              <motion.label
                htmlFor={fieldName}
                initial={false}
                animate={{
                  y: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? isOutlined
                      ? sz.outlinedFloatY
                      : labelPlacement === "inside"
                        ? sz.floatY
                        : sz.floatYOutside
                    : isOutlined
                      ? sz.outlinedInitialY
                      : sz.initialY,
                  x: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? isOutlined
                      ? 0
                      : labelPlacement === "inside"
                        ? sz.floatX
                        : sz.floatXOutside
                    : 0,
                  scale: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? isOutlined ? 0.75 : sz.floatScale
                    : 1,
                }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className={`
                  absolute left-3 top-1/2 z-10 ${labelFloatingClasses} transition-colors duration-200
                  ${sz.textSize} ${labelClassName} ${
                    isFocused && color !== "default"
                      ? (focusTextColors[color] || "text-primary")
                      : (shouldFloat || (isOutlined && (isFocused || hasValue)))
                        ? isFocused
                          ? "text-neutral-800 dark:text-neutral-200"
                          : "text-neutral-700 dark:text-neutral-300"
                        : "text-neutral-400 dark:text-neutral-500"
                  }
                `}
                style={{ transformOrigin: isOutlined ? "left" : "top left" }}
              >
                <FieldLabelContent label={label} isRequired={isRequired} />
              </motion.label>
            )}

            {/* Central Stack: Label + Value */}
            <div
              className={`
                flex flex-col flex-1 min-w-0 justify-center
                ${labelPlacement === "inside" && isFloating && shouldFloat
                  ? size === "sm"
                    ? "mt-3"
                    : size === "lg"
                      ? "mt-5"
                      : "mt-4"
                  : ""
                }
              `}
            >
              {labelPlacement === "inside" && !isFloating && label && (
                <span
                  className={`
                    ${labelFloatingClasses} mb-0.5 text-neutral-500
                    ${sz.labelSize} ${labelClassName}
                  `}
                >
                  <FieldLabelContent label={label} isRequired={isRequired} />
                </span>
              )}

              <div className="flex-1 min-w-0 truncate pr-2 flex items-center">
                {!singleFile ? (
                  <span className={`${fieldPlaceholderClasses} truncate select-none`}>
                    {!isFloating || shouldFloat ? resolvedPlaceholder : "\u200b"}
                  </span>
                ) : (
                  <span
                    className={`${fieldValueClasses} truncate select-none text-neutral-800 dark:text-neutral-100`}
                  >
                    {singleFile instanceof File
                      ? singleFile.name
                      : typeof singleFile === "string"
                        ? singleFile.split("/").pop()
                        : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Action icon: Clear or Browse */}
            <div className="flex items-center justify-center shrink-0 ml-1">
              {isClearable && singleFile && !disabled ? (
                <Button
                  color="default"
                  size="xs"
                  variant="flat"
                  radius="full"
                  isIconOnly
                  tabIndex={-1}
                  onClick={handleClearSingle}
                >
                  <FaXmark className="w-3.5 h-3.5" aria-hidden />
                </Button>
              ) : (
                  <FiUpload className="w-4 h-4 text-neutral-600" aria-hidden />
              )}
            </div>

            <input {...getInputProps()} style={{ display: "none" }} />

            {/* Underline Animation for Underlined Variant */}
            {resolvedVariant === "underlined" && (
              <motion.div
                className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${underlineColors[color] || "bg-primary"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ originX: 0.5 }}
              />
            )}
          </div>
        </div>
      )}

      {/* Global single preview modal (for dropzone and profile modes) */}
      {isModalOpen &&
        createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors text-white duration-200 focus:outline-none"
                title="Close"
              >
                <FaXmark className="w-6 h-6 text-neutral-700 dark:text-neutral-300" aria-hidden />
              </button>

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
              >
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className={`max-w-full max-h-full ${getRadiusClass()} shadow-2xl object-contain bg-black`}
                  />
                ) : isImage ? (
                  <img
                    src={previewUrl}
                    alt="Full Preview"
                    className={`max-w-full max-h-full ${getRadiusClass()} shadow-2xl object-contain bg-neutral-900`}
                  />
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`${errorClasses} ${mode === "profile" ? "flex justify-center text-center" : ""
              } ${errorClassName}`}
          >
            {resolvedError as string}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileInput;
