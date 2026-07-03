import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { createPortal } from 'react-dom';
import Button from '../button/Button';
import { DEFAULT_RADIUS, getFooterRadiusClass, getRadiusClass, type Radius } from '../shared/radius';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
type ModalBackdrop = 'transparent' | 'opaque' | 'blur';
type ModalScrollBehavior = 'inside' | 'outside';
type ModalRadius = Radius;
type ModalShadow = 'none' | 'sm' | 'md' | 'lg';

interface ModalProps {
  openDialog: boolean;
  handleDialogClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  backdrop?: ModalBackdrop;
  scrollBehavior?: ModalScrollBehavior;
  isDraggable?: boolean;
  className?: string;
  closeButton?: boolean;
  primaryActionText?: string;
  secondaryActionText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryButtonForm?: string;
  primaryButtonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  secondaryButtonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  radius?: ModalRadius;
  shadow?: ModalShadow;
}

const shadowClasses: Record<ModalShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-2xl',
};

const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full m-0 h-full'
};

const Modal: React.FC<ModalProps> = ({
  openDialog,
  handleDialogClose,
  title,
  children,
  footer,
  size = 'md',
  backdrop = 'opaque',
  scrollBehavior = 'inside',
  isDraggable = false,
  className = '',
  closeButton = true,
  primaryActionText,
  secondaryActionText,
  onPrimaryAction,
  onSecondaryAction,
  primaryButtonForm,
  primaryButtonColor = 'primary',
  secondaryButtonColor = 'danger',
  isDismissable = false,
  isKeyboardDismissDisabled = true,
  radius = DEFAULT_RADIUS,
  shadow = 'lg',
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDialog && !isKeyboardDismissDisabled) {
        handleDialogClose();
      }
    };
    if (openDialog) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [openDialog, handleDialogClose, isKeyboardDismissDisabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    // Only allow dragging from header
    const target = e.target as HTMLElement;
    if (!target.closest('.modal-header')) return;

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position when modal closes/opens
  useEffect(() => {
    if (!openDialog) {
      setPosition({ x: 0, y: 0 });
    }
  }, [openDialog]);

  if (!openDialog) return null;

  const backdropClasses = {
    transparent: 'bg-transparent',
    opaque: 'bg-black/50',
    blur: 'bg-black/30 backdrop-blur-md'
  };

  const renderFooter = () => {
    if (footer) return footer;
    if (!primaryActionText && !secondaryActionText) return null;

    return (
      <div className="flex justify-end gap-3 w-full">
        {secondaryActionText && (
          <Button 
            variant="bordered" 
            color={secondaryButtonColor as any} 
            onClick={onSecondaryAction || handleDialogClose}
            type="button"
          >
            {secondaryActionText}
          </Button>
        )}
        {primaryActionText && (
          <Button 
            variant="solid" 
            color={primaryButtonColor as any} 
            onClick={onPrimaryAction}
            type='submit'
            form={primaryButtonForm}
          >
            {primaryActionText}
          </Button>
        )}
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
      {/* Backdrop - now inside the same container to handle clicks better */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${backdropClasses[backdrop]}`} 
        onClick={() => {
          if (isDismissable) handleDialogClose();
        }}
      />

      {/* Modal Container - captures scroll from anywhere */}
      <div 
        className={`fixed inset-0 flex justify-center p-4 transition-all duration-300 ${
          scrollBehavior === 'outside' ? 'overflow-y-auto items-start py-10 md:py-20' : 'overflow-hidden items-center'
        }`}
        onClick={(e) => {
          // Close if clicking outside the modal panel
          if (e.target === e.currentTarget && isDismissable) handleDialogClose();
        }}
      >
        <div 
          ref={modalRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className={`
            relative w-full flex flex-col bg-white dark:bg-content1 text-foreground pointer-events-auto
            ${shadowClasses[shadow]}
            ${size === 'full' ? 'rounded-none min-h-screen' : getRadiusClass(radius)}
            ${sizeClasses[size]}
            ${scrollBehavior === 'inside' ? 'max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-8rem)]' : 'h-fit mb-8'}
            ${className}
          `}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          {/* Close Button */}
          {closeButton && (
            <button 
              onClick={handleDialogClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-default-100 text-gray-400 hover:text-gray-600 dark:text-default-400 dark:hover:text-default-600 transition-colors z-30"
            >
              <FaXmark className="w-5 h-5" aria-hidden />
            </button>
          )}

          {/* Modal Header */}
          {title && (
            <div className={`modal-header px-6 py-4 border-b border-gray-100 dark:border-default-100/50 shrink-0 ${isDraggable ? 'cursor-move select-none' : ''}`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-8">
                {title}
              </h3>
            </div>
          )}

          {/* Modal Body */}
          <div className={`
            modal-body flex-1 px-6 py-4 min-h-0
            ${scrollBehavior === 'inside' ? 'overflow-y-auto' : ''}
          `}>
            {children}
          </div>

          {/* Modal Footer Slot */}
          {(footer || primaryActionText || secondaryActionText) && (
            <div className={`modal-footer px-6 py-4 border-t border-gray-100 dark:border-default-100/50 shrink-0 bg-white dark:bg-content1 ${size === 'full' ? 'rounded-none' : getFooterRadiusClass(radius)}`}>
              {renderFooter()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

