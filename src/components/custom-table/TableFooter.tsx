import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa6';
import { PAGE_OPTIONS } from '../../shared/constants/pagination';
import {
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '../ui';

interface ITableFooterProps {
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const TableFooter: React.FC<ITableFooterProps> = ({
  page = 1,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const start = totalCount > 0 ? (page - 1) * rowsPerPage + 1 : 0;
  const end = Math.min(page * rowsPerPage, totalCount);
  const pages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handleRowsSelect = (keys: any) => {
    const value = Number([...keys][0]);
    if (!isNaN(value) && value !== rowsPerPage) {
      onRowsPerPageChange(value);
    }
  };

  return (
    <div className="py-2 px-2 flex justify-between items-center">
      {/* Left: Rows per page + count */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="whitespace-nowrap">Rows per page:</span>

        <Dropdown placement="top-start" isOpen={isOpen} onOpenChange={setIsOpen}>
          <DropdownTrigger>
            <Button
              size="md"
              variant="bordered"
              color="default"
              radius="xl"
              className="text-sm font-medium"
              endContent={
                <motion.div
                  className="w-3 h-3 ml-1 shrink-0 flex items-center justify-center"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <FaChevronDown className="w-3 h-3" aria-hidden />
                </motion.div>
              }
            >
              {rowsPerPage}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Rows per page"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([String(rowsPerPage)])}
            onSelectionChange={handleRowsSelect}
          >
            {PAGE_OPTIONS.map((option) => (
              <DropdownItem key={String(option)} textValue={String(option)}>
                {option}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {totalCount > 0 && (
          <span className="whitespace-nowrap text-xs">
            {start}–{end} of {totalCount}
          </span>
        )}
      </div>

      {/* Right: Pagination */}
      <Pagination
        showControls
        initialPage={1}
        color="primary"
        variant="faded"
        page={page}
        total={pages}
        classNames={{ cursor: "text-black text-base" }}
        onChange={(p) => onPageChange?.(p)}
      />
    </div>
  );
};

export default TableFooter;