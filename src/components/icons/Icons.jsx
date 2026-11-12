function Svg({ children, className = 'h-5 w-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const CarIcon = (props) => (
  <Svg {...props}>
    <path d="M4 13l1.3-3.7A3 3 0 018.1 7.2h7.8a3 3 0 012.8 2.1L20 13" />
    <path d="M3.5 13h17v4.2a1 1 0 01-1 1h-1.2a2.3 2.3 0 01-4.6 0H10a2.3 2.3 0 01-4.6 0H4.5a1 1 0 01-1-1V13z" />
    <path d="M7 15.6h.01M17 15.6h.01" />
  </Svg>
)

export const PlusIcon = (props) => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const ArrowLeftIcon = (props) => (
  <Svg {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const ArrowRightIcon = (props) => (
  <Svg {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

export const LogoutIcon = (props) => (
  <Svg {...props}>
    <path d="M15 12H4M8 8l-4 4 4 4" />
    <path d="M12 4h6a2 2 0 012 2v12a2 2 0 01-2 2h-6" />
  </Svg>
)

export const GaugeIcon = (props) => (
  <Svg {...props}>
    <path d="M4 17a8.5 8.5 0 1116 0" />
    <path d="M12 13.5l3.6-3.4" />
    <circle cx="12" cy="14.2" r="1.3" />
  </Svg>
)

export const WrenchIcon = (props) => (
  <Svg {...props}>
    <path d="M14.6 4a4.4 4.4 0 00-5.7 5.5L3.6 14.8V20h5.2l5.3-5.3A4.4 4.4 0 0020 9l-2.8 2.8-2.9-2.9L17 6.1A4.4 4.4 0 0014.6 4z" />
  </Svg>
)

export const CalendarIcon = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3.5V6M16 3.5V6" />
  </Svg>
)

export const CheckIcon = (props) => (
  <Svg {...props}>
    <path d="M5 13l4 4L19 7" />
  </Svg>
)

export const TrashIcon = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M9.5 7V4.8h5V7" />
    <path d="M6.6 7l.7 12.3h9.4L17.4 7" />
  </Svg>
)

export const EyeIcon = (props) => (
  <Svg {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3.2" />
  </Svg>
)

export const EyeOffIcon = (props) => (
  <Svg {...props}>
    <path d="M10.6 6.1A9.9 9.9 0 0112 6c6 0 9.5 6 9.5 6a17 17 0 01-2.4 3.2" />
    <path d="M6.3 7.4A16.6 16.6 0 002.5 12S6 18 12 18a9.6 9.6 0 003.2-.5" />
    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    <path d="M4 4l16 16" />
  </Svg>
)

export const UsersIcon = (props) => (
  <Svg {...props}>
    <path d="M15.5 20v-1.6a3.4 3.4 0 00-3.4-3.4H6.4A3.4 3.4 0 003 18.4V20" />
    <circle cx="9.2" cy="8.4" r="3.1" />
    <path d="M21 20v-1.6a3.4 3.4 0 00-2.6-3.3M16.2 5.5a3.1 3.1 0 010 5.9" />
  </Svg>
)

export const PencilIcon = (props) => (
  <Svg {...props}>
    <path d="M4 20h4.2l9.4-9.4a2.1 2.1 0 00-3-3L5.2 17 4 20z" />
    <path d="M13.6 6.9l3 3" />
  </Svg>
)

export const UserIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0114.4 0" />
  </Svg>
)

export const MailIcon = (props) => (
  <Svg {...props}>
    <rect x="3.2" y="5.5" width="17.6" height="13" rx="2.5" />
    <path d="M4 7l8 5.5L20 7" />
  </Svg>
)

export const LockIcon = (props) => (
  <Svg {...props}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 018 0v2.5" />
  </Svg>
)

export const AlertIcon = (props) => (
  <Svg {...props}>
    <path d="M12 9v4M12 16h.01" />
    <path d="M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </Svg>
)

export const ClockIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
)
