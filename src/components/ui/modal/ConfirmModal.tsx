import React from 'react';
import { FiInfo } from "react-icons/fi";
import { IoWarningOutline } from "react-icons/io5";
import Modal from './Modal';
import Button from '../button/Button';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
type ModalBackdrop = 'transparent' | 'opaque' | 'blur';

interface ConfirmModalProps {
  title?: string;
  message: string;
  openDialog: boolean;
  handleDialogClose: () => void;
  handleSuccess: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  size?: ModalSize;
  backdrop?: ModalBackdrop;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = 'Confirmation',
  message,
  openDialog,
  handleDialogClose,
  handleSuccess,
  confirmText = 'Yes',
  cancelText = 'No',
  type = 'danger',
  size = 'md',
  backdrop = 'blur',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <IoWarningOutline className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden />
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
            <IoWarningOutline className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
        );
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/30">
            <FiInfo className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
          </div>
        );
    }
  };

  return (
    <Modal
      openDialog={openDialog}
      handleDialogClose={handleDialogClose}
      title={title}
      size={size}
      backdrop={backdrop}
    >
      <div className="p-2">
        <div className="text-center">
          {getIcon()}
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-default-400">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="bordered"
            color="danger"
            onClick={handleDialogClose}
            className="w-full sm:w-32"
          >
            {cancelText}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleSuccess}
            className="w-full sm:w-32"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
