import React from 'react';
import { FaCopy } from 'react-icons/fa';
import { FiLock, FiLogOut } from "react-icons/fi";
import { useSelector } from 'react-redux';
import ChangePassword from '../../pages/account/ChangePassword';
import type { IApplicationState } from '../../store/state/app-state';
import { Avatar, Dropdown, DropdownMenu, DropdownTrigger, Modal } from '../ui';

interface UserMenuProps {
  onLogout: () => void | Promise<void>
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const user = useSelector((state: IApplicationState) => state.UserData)
  const [isOpen, setIsOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  React.useEffect(() => {
    if (!copied) return
    const timeoutId = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  const displayName = fullName || user.email || 'User'

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user.email) return
    try {
      await navigator.clipboard.writeText(user.email)
      setCopied(true)
      setIsOpen(true)
    } catch {
      setCopied(false)
    }
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    await onLogout()
  }

  const trigger = (
    <Avatar
      size="sm"
      name={displayName}
      color="primary"
      isBordered
      className="cursor-pointer hover:opacity-90 transition-opacity duration-200"
      title="Open user menu"
    />
  )

  return (
    <>
      <Dropdown
        placement="bottom-end"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        showArrow={true}
      >
        <DropdownTrigger>
          {trigger}
        </DropdownTrigger>
        <DropdownMenu
          variant="flat"
          ariaLabel="User menu"
          className="w-[calc(100vw-90px)] sm:w-72 max-w-[18rem] p-0 flex flex-col gap-0 border-0 outline-none select-none"
        >
          {/* User info header */}
          <div className="border-b border-default-100 dark:border-default-800 px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar
                size="md"
                name={displayName}
                color="primary"
                isBordered
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-default-900 dark:text-white">{displayName}</p>
                <p className="truncate text-xs text-default-700 dark:text-default-700">{user.email || 'No email available'}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-default-300 dark:bg-default-800 px-2.5 py-1 text-xs font-medium text-default-800 dark:text-default-200">
                {user.role || 'Member'}
              </span>
              {copied && (
                <span className="text-xs font-medium text-success">Email copied!</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-default-800 dark:text-default-800 transition hover:bg-default-50 dark:hover:bg-default-900/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!user.email}
            >
              <FaCopy className="h-4 w-4 text-default-700 dark:text-default-800 shrink-0" aria-hidden />
              Copy email
            </button>

            <button
              type="button"
              onClick={() => {
                handleDialogOpen();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-default-800 dark:text-default-800 transition hover:bg-default-50 dark:hover:bg-default-900/50"
            >
              <FiLock className="h-4 w-4 text-default-700 dark:text-default-800 shrink-0" aria-hidden />
              Change password
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-danger transition hover:bg-danger/5 dark:hover:bg-danger/10"
            >
              <FiLogOut className="h-4 w-4 text-danger shrink-0" aria-hidden />
              Sign out
            </button>
          </div>
        </DropdownMenu>
      </Dropdown>

      {/* Change Password Modal */}
      <Modal
        openDialog={openDialog}
        handleDialogClose={handleDialogClose}
        title="Change Password"
        isDismissable={true}
        isKeyboardDismissDisabled={false}
      >
        <ChangePassword
          handleDialogClose={handleDialogClose}
        />
      </Modal>
    </>
  )
}

export default UserMenu