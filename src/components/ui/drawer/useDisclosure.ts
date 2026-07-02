import { useState, useCallback } from "react";

export interface UseDisclosureProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
  onOpenChange: (value?: boolean) => void;
}

export function useDisclosure(initialState = false): UseDisclosureProps {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const onOpenChange = useCallback((value?: boolean) => {
    if (typeof value === "boolean") {
      setIsOpen(value);
    } else {
      setIsOpen((prev) => !prev);
    }
  }, []);

  return { isOpen, onOpen, onClose, toggle, onOpenChange };
}

export default useDisclosure;
