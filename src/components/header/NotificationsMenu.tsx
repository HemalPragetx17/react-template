import React from 'react';
import { FaBell } from "react-icons/fa";
import { Badge, Button, Dropdown, DropdownMenu, DropdownTrigger } from '../ui';

type NotificationItem = {
  id: number
  title: string
  message: string
  time: string
  unread: boolean
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'New user signed up',
    message: 'A new account was created from the onboarding flow.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Backup completed',
    message: 'The latest nightly backup finished successfully.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    title: 'System update',
    message: 'Version 1.4.2 is now available for deployment.',
    time: 'Yesterday',
    unread: false,
  },
]

const NotificationsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState(defaultNotifications)

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllAsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, unread: false })))
  }

  const handleNotificationClick = (notificationId: number) => {
    setNotifications((current) =>
      current.map((n) => (n.id === notificationId ? { ...n, unread: false } : n)),
    )
  }

  const trigger = (
    <Badge
      content={unreadCount}
      color="primary"
      size="sm"
      shape="circle"
      isInvisible={unreadCount === 0}
    >
      <Button
        isIconOnly
        variant="light"
        color="default"
        radius="full"
        size='sm'
        className="text-default-400 hover:text-default-600"
        aria-label="View notifications"
      >
        <FaBell className="h-6 w-6 text-default-800" aria-hidden />
      </Button>
    </Badge>
  )

  return (
    <Dropdown
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      showArrow={true}
      closeOnSelect={false}
    >
      <DropdownTrigger>
        {trigger}
      </DropdownTrigger>
      <DropdownMenu
        variant="flat"
        ariaLabel="Notifications"
        className="w-[calc(100vw-90px)] sm:w-80 max-w-[20rem] p-0 flex flex-col gap-0 border-0 outline-none select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-default-900 dark:text-white">Notifications</p>
            <p className="text-xs text-default-700 dark:text-default-700">{unreadCount} unread updates</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
            className="text-xs font-medium text-primary transition hover:text-primary/80 disabled:text-default-400"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>

        {/* Notification list */}
        <div className="max-h-80 divide-y divide-default-100 dark:divide-default-800 overflow-auto">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification.id); }}
              className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-default-50 dark:hover:bg-default-900/50 ${notification.unread ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.unread ? 'bg-primary' : 'bg-default-300 dark:bg-default-600'}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`block truncate text-sm font-medium ${notification.unread ? 'text-default-900 dark:text-white' : 'text-default-700 dark:text-default-700'}`}>
                    {notification.title}
                  </span>
                  <span className="shrink-0 text-xs text-default-600 dark:text-default-700">{notification.time}</span>
                </span>
                <span className="mt-1 block text-xs text-default-700 dark:text-default-700">{notification.message}</span>
              </span>
            </button>
          ))}
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default NotificationsMenu