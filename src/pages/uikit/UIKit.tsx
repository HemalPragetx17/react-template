import React from "react";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaArrowRightFromBracket, FaBold, FaCamera, FaFaceSmile, FaGear, FaHeart, FaItalic, FaUnderline, FaUser, FaVolumeHigh, FaVolumeOff } from "react-icons/fa6";
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Chip,
  DateInput,
  DateTimePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  FileInput,
  Input,
  PhoneNumberInput,
  Popover,
  Radio,
  Rating,
  SelectDropdown,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tab,
  Tabs,
  Textarea,
  TimePicker,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "../../components/ui";

// ─── Types ───────────────────────────────────────────────────────────────────
type ColorOption = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type ButtonVariant = "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
type ChipVariant = "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot";
type SpinnerVariant = "default" | "simple" | "gradient" | "spinner" | "wave" | "dots";

const COLORS: ColorOption[] = ["default", "primary", "secondary", "success", "warning", "danger"];
const BREADCRUMB_ITEMS = [
  { label: "Home", path: "#", isLast: false, isClickable: true },
  { label: "Music", path: "#", isLast: false, isClickable: true },
  { label: "Artist", path: "#", isLast: false, isClickable: true },
  { label: "Album", path: "#", isLast: false, isClickable: true },
  { label: "Song", path: "#", isLast: true, isClickable: false },
];
const BUTTON_VARIANTS: ButtonVariant[] = ["solid", "shadow", "bordered", "flat", "faded", "light", "ghost"];
const CHIP_VARIANTS: ChipVariant[] = ["solid", "bordered", "light", "flat", "faded", "shadow", "dot"];
const AVATAR_COLORS: ColorOption[] = ["default", "primary", "secondary", "success", "warning", "danger"];
const SPINNER_VARIANTS: SpinnerVariant[] = ["default", "simple", "gradient", "spinner", "wave", "dots"];
const RADIO_OPTIONS = [
  { label: "Buenos Aires", value: "buenos-aires" },
  { label: "Sydney", value: "sydney" },
  { label: "San Francisco", value: "san-francisco" },
  { label: "London", value: "london" },
  { label: "Tokyo", value: "tokyo" },
];

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <div className="flex items-baseline gap-3 mb-1">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
    <hr className="border-default-200 mb-5" />
    <div className="space-y-3">{children}</div>
  </section>
);

const Row = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-medium text-default-500 uppercase tracking-wider w-16 shrink-0">{children}</span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const UIKit: React.FC = () => {
  const [alignment, setAlignment] = React.useState<string | null>("left");
  const [formats, setFormats] = React.useState<string[]>(["bold", "italic"]);
  const [isSkeletonLoaded, setIsSkeletonLoaded] = React.useState(false);
  const [dropdownSingle, setDropdownSingle] = React.useState<Set<string>>(new Set(["text"]));
  const [dropdownMulti, setDropdownMulti] = React.useState<Set<string>>(new Set(["text", "pdf"]));

  // Table state demo
  const [tableSelection, setTableSelection] = React.useState<any>(new Set(["2"]));
  const [sortDesc, setSortDesc] = React.useState<any>({ column: "name", direction: "ascending" });
  const [tableLoading, setTableLoading] = React.useState(false);
  const [activePageDemo, setActivePageDemo] = React.useState(3);

  const [checkboxValues, setCheckboxValues] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(COLORS.map((c) => [c, true]))
  );
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(COLORS.map((c) => [c, "sydney"]))
  );
  const [switchValues, setSwitchValues] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(COLORS.map((c) => [c, true]))
  );

  // States for editable inputs
  const [inputVal, setInputVal] = React.useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "Input flat";
      states[`${c}-bordered`] = "Input bordered";
      states[`${c}-faded`] = "Input faded";
      states[`${c}-underlined`] = "Input underlined";
      states[`${c}-disabled`] = "Input disabled";
    });
    return states;
  });

  const [fileVal, setFileVal] = React.useState<Record<string, File | string | null>>(() => {
    const states: Record<string, File | string | null> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "file.pdf";
      states[`${c}-bordered`] = "file.pdf";
      states[`${c}-faded`] = "file.pdf";
      states[`${c}-underlined`] = "file.pdf";
      states[`${c}-disabled`] = "file.pdf";
    });
    return states;
  });

  const [phoneVal, setPhoneVal] = React.useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "+1234567890";
      states[`${c}-bordered`] = "+1234567890";
      states[`${c}-faded`] = "+1234567890";
      states[`${c}-underlined`] = "+1234567890";
      states[`${c}-disabled`] = "+1234567890";
    });
    return states;
  });

  const [dropdownVal, setDropdownVal] = React.useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "sydney";
      states[`${c}-bordered`] = "sydney";
      states[`${c}-faded`] = "sydney";
      states[`${c}-underlined`] = "sydney";
      states[`${c}-disabled`] = "sydney";
    });
    return states;
  });

  const [textareaVal, setTextareaVal] = React.useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "Textarea flat";
      states[`${c}-bordered`] = "Textarea bordered";
      states[`${c}-faded`] = "Textarea faded";
      states[`${c}-underlined`] = "Textarea underlined";
      states[`${c}-disabled`] = "Textarea disabled";
    });
    return states;
  });

  const [dateVal, setDateVal] = React.useState<Record<string, Date | null>>(() => {
    const states: Record<string, Date | null> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = new Date("2026-06-11");
      states[`${c}-bordered`] = new Date("2026-06-11");
      states[`${c}-faded`] = new Date("2026-06-11");
      states[`${c}-underlined`] = new Date("2026-06-11");
      states[`${c}-disabled`] = new Date("2026-06-11");
    });
    return states;
  });

  const [timeVal, setTimeVal] = React.useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = "10:30 AM";
      states[`${c}-bordered`] = "10:30 AM";
      states[`${c}-faded`] = "10:30 AM";
      states[`${c}-underlined`] = "10:30 AM";
      states[`${c}-disabled`] = "10:30 AM";
    });
    return states;
  });

  const [dateTimeVal, setDateTimeVal] = React.useState<Record<string, Date | null>>(() => {
    const states: Record<string, Date | null> = {};
    COLORS.forEach(c => {
      states[`${c}-flat`] = new Date("2026-06-11T10:30:00");
      states[`${c}-bordered`] = new Date("2026-06-11T10:30:00");
      states[`${c}-faded`] = new Date("2026-06-11T10:30:00");
      states[`${c}-underlined`] = new Date("2026-06-11T10:30:00");
      states[`${c}-disabled`] = new Date("2026-06-11T10:30:00");
    });
    return states;
  });

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">UI Kit</h1>
        <p className="text-default-500 text-sm">Browse all components by variant and color token.</p>
      </div>

      {/* ── 1. AVATAR ────────────────────────────────────────────── */}
      <Section title="Avatar">
        <Row>
          <Label>bordered</Label>
          {AVATAR_COLORS.map((color) => (
            <Avatar key={color} color={color} isBordered name={color} size="md" />
          ))}
        </Row>
        <Row>
          <Label>flat</Label>
          {AVATAR_COLORS.map((color) => (
            <Avatar key={color} color={color} name={color} size="md" />
          ))}
        </Row>
        <Row>
          <Label>icon</Label>
          {AVATAR_COLORS.map((color) => (
            <Avatar key={color} color={color} isBordered size="md" icon={<FaUser />} />
          ))}
        </Row>
      </Section>

      {/* ── 2. BADGE ─────────────────────────────────────────────── */}
      <Section title="Badge">
        <Row>
          <Label>colors</Label>
          {COLORS.map((color) => (
            <Badge key={color} color={color} content="5">
              <Avatar color={color} name={color[0].toUpperCase()} size="md" />
            </Badge>
          ))}
        </Row>
        <Row>
          <Label>dot</Label>
          {COLORS.map((color) => (
            <Badge key={color} color={color}>
              <Avatar color={color} name={color[0].toUpperCase()} size="md" />
            </Badge>
          ))}
        </Row>
      </Section>

      {/* ── 3. BREADCRUMBS ───────────────────────────────────────── */}
      <Section title="Breadcrumbs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="default" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="default" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="default" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="default" variant="solid" isDisabled />
          </div>
          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="success" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="success" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="success" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="success" variant="solid" isDisabled />
          </div>

          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="primary" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="primary" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="primary" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="primary" variant="solid" isDisabled />
          </div>
          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="warning" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="warning" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="warning" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="warning" variant="solid" isDisabled />
          </div>

          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="secondary" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="secondary" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="secondary" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="secondary" variant="solid" isDisabled />
          </div>
          <div>
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="danger" variant="bordered" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="danger" variant="light" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="danger" variant="solid" />
            <Breadcrumbs items={BREADCRUMB_ITEMS} color="danger" variant="solid" isDisabled />
          </div>
        </div>
      </Section>

      {/* ── 4. BUTTON ────────────────────────────────────────────── */}
      <Section title="Button">
        {BUTTON_VARIANTS.map((variant) => (
          <Row key={variant}>
            <Label>{variant}</Label>
            {COLORS.map((color) => (
              <Button key={color} variant={variant} color={color} size="sm">
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Button>
            ))}
          </Row>
        ))}
        <Row>
          <Label>disabled</Label>
          {COLORS.map((color) => (
            <Button key={color} variant="solid" color={color} size="sm" disabled>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Button>
          ))}
        </Row>
        <Row>
          <Label>icon only</Label>
          {COLORS.map((color) => (
            <Button key={color} variant="solid" color={color} size="sm" radius="full" isIconOnly aria-label={color}>
              <FaHeart className="w-3.5 h-3.5" />
            </Button>
          ))}
        </Row>
        <Row>
          <Label>w/ icon</Label>
          <Button color="success" size="sm" endContent={<FaCamera className="w-3.5 h-3.5" />}>Take Photo</Button>
          <Button color="danger" variant="bordered" size="sm" startContent={<FaUser className="w-3.5 h-3.5" />}>Delete</Button>
          <Button color="primary" size="sm" isLoading>Loading</Button>
        </Row>
      </Section>

      {/* ── 5. CARD ──────────────────────────────────────────────── */}
      <Section title="Card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card shadow="md">
            <CardHeader className="flex gap-3">
              <Avatar name="A" color="primary" isBordered />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Basic Card</p>
                <p className="text-xs text-default-500">Card Header Description</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm">This is a standard card component with card header, body and footer elements.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm" color="primary">Action</Button>
            </CardFooter>
          </Card>

          <Card shadow="md" isHoverable>
            <CardHeader className="flex gap-3">
              <Avatar name="H" color="secondary" isBordered />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Hoverable Card</p>
                <p className="text-xs text-default-500">Card will elevate on hover</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm">Hover over this card to see a subtle zoom and shadow elevation animation.</p>
            </CardBody>
            <CardFooter>
              <Chip size="sm" color="secondary" variant="flat">Hover Me</Chip>
            </CardFooter>
          </Card>

          <Card shadow="md" isPressable onClick={() => { }}>
            <CardHeader className="flex gap-3">
              <Avatar name="P" color="success" isBordered />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Pressable Card</p>
                <p className="text-xs text-default-500">Click anywhere on card</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm">Click on this card to trigger a ripple animation and custom click handler.</p>
            </CardBody>
            <CardFooter>
              <Chip size="sm" color="success" variant="flat">Press Me</Chip>
            </CardFooter>
          </Card>
        </div>

        <h3 className="text-sm font-semibold text-neutral-400 mt-6 mb-3">Blur & Footer Blur Variants</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blurred Card (Music Player style) */}
          <div className="relative p-6 rounded-xl bg-gradient-to-tr from-orange-400 via-rose-500 to-violet-600 overflow-hidden flex items-center justify-center min-h-[220px] shadow-inner">
            <Card
              isBlurred
              className="border-none bg-background/60 dark:bg-default-100/50 max-w-[420px] w-full"
              shadow="sm"
            >
              <CardBody>
                <div className="grid grid-cols-12 gap-4 items-center justify-center">
                  <div className="relative col-span-4">
                    <div className="w-full h-[80px] rounded-xl bg-amber-800 flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=120&q=80"
                        alt="Album cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col col-span-8 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0">
                        <p className="text-xs text-foreground/60 font-medium">Daily Mix</p>
                        <p className="text-xs text-foreground/50">12 Tracks</p>
                        <h3 className="text-sm font-semibold mt-1 text-foreground">Frontend Radio</h3>
                      </div>
                      <Button
                        isIconOnly
                        className="text-foreground/70 hover:bg-foreground/10"
                        radius="full"
                        variant="light"
                        size="sm"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </Button>
                    </div>

                    <div className="flex flex-col mt-2 gap-1">
                      <div className="relative w-full h-1 bg-foreground/20 rounded-full">
                        <div className="absolute left-0 top-0 h-full w-[35%] bg-foreground rounded-full" />
                        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-foreground rounded-full shadow" />
                      </div>
                      <div className="flex justify-between text-[10px] text-foreground/60">
                        <span>1:23</span>
                        <span>4:32</span>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-center gap-3 mt-1">
                      <button className="text-foreground/60 hover:text-foreground">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </button>
                      <button className="text-foreground/70 hover:text-foreground">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 6h2v12H6zm3.5 6L18 6v12z" />
                        </svg>
                      </button>
                      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background hover:scale-105 transition-transform">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      </button>
                      <button className="text-foreground/70 hover:text-foreground">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18V6l8.5 6L6 18zm9-12h2v12h-2z" />
                        </svg>
                      </button>
                      <button className="text-foreground/60 hover:text-foreground">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Footer Blurred Card */}
          <div className="flex justify-center w-full">
            <Card isFooterBlurred className="h-[220px] max-w-[420px] w-full relative overflow-hidden" shadow="lg">
              <CardBody className="p-0">
                <img
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80"
                  alt="Card background image"
                  className="z-0 w-full h-full object-cover"
                />
              </CardBody>
              <CardFooter className="justify-between absolute bottom-0 left-0 right-0 z-10 border-t border-white/20 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col text-left">
                  <p className="text-xs text-white/60">Available now</p>
                  <p className="text-sm text-white font-semibold">Cyberpunk City</p>
                </div>
                <Button className="text-xs text-white bg-white/20 hover:bg-white/30 border border-white/10" variant="flat" size="sm" radius="full">
                  Notify Me
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── 6. CHECKBOX ──────────────────────────────────────────── */}
      <Section title="Checkbox">
        <Row className="d-flex">
          <Label>toggle</Label>
          {COLORS.map((color) => (
            <Checkbox
              key={color}
              color={color}
              checked={!!checkboxValues[color]}
              onChange={(val: boolean) => setCheckboxValues(prev => ({ ...prev, [color]: val }))}
              label={color.charAt(0).toUpperCase() + color.slice(1)}
            />
          ))}
        </Row>
        <Row>
          <Label>disabled</Label>
          {COLORS.map((color) => (
            <Checkbox
              key={color}
              color={color}
              checked={true}
              onChange={() => { }}
              label={color.charAt(0).toUpperCase() + color.slice(1)}
              disabled
            />
          ))}
        </Row>
      </Section>

      {/* ── 7. CHIP ──────────────────────────────────────────────── */}
      <Section title="Chip">
        {CHIP_VARIANTS.map((variant) => (
          <Row key={variant}>
            <Label>{variant}</Label>
            {COLORS.map((color) => (
              <Chip key={color} variant={variant} color={color} size="sm">
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Chip>
            ))}
          </Row>
        ))}
        <Row>
          <Label>closeable</Label>
          {COLORS.map((color) => (
            <Chip key={color} variant="flat" color={color} size="sm" onClose={() => { }}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Chip>
          ))}
        </Row>
        <Row>
          <Label>disabled</Label>
          {COLORS.map((color) => (
            <Chip key={color} variant="solid" color={color} size="sm" isDisabled>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Chip>
          ))}
        </Row>
      </Section>

      {/* ── 8. DATE INPUT ────────────────────────────────────────── */}
      <Section title="Date Input">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <DateInput variant="flat" color={color} value={dateVal[`${color}-flat`]} onChange={(d: any) => setDateVal(prev => ({ ...prev, [`${color}-flat`]: d }))} size="sm" />
              <DateInput variant="bordered" color={color} value={dateVal[`${color}-bordered`]} onChange={(d: any) => setDateVal(prev => ({ ...prev, [`${color}-bordered`]: d }))} size="sm" />
              <DateInput variant="faded" color={color} value={dateVal[`${color}-faded`]} onChange={(d: any) => setDateVal(prev => ({ ...prev, [`${color}-faded`]: d }))} size="sm" />
              <DateInput variant="underlined" color={color} value={dateVal[`${color}-underlined`]} onChange={(d: any) => setDateVal(prev => ({ ...prev, [`${color}-underlined`]: d }))} size="sm" />
              <DateInput variant="flat" color={color} value={dateVal[`${color}-disabled`]} onChange={(d: any) => setDateVal(prev => ({ ...prev, [`${color}-disabled`]: d }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 9. DATE TIME PICKER ──────────────────────────────────── */}
      <Section title="Date Time Picker">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <DateTimePicker variant="flat" color={color} placeholder="Select Date and Time" value={dateTimeVal[`${color}-flat`]} onChange={(dt) => setDateTimeVal(prev => ({ ...prev, [`${color}-flat`]: dt }))} size="sm" />
              <DateTimePicker variant="bordered" color={color} placeholder="Select Date and Time" value={dateTimeVal[`${color}-bordered`]} onChange={(dt) => setDateTimeVal(prev => ({ ...prev, [`${color}-bordered`]: dt }))} size="sm" />
              <DateTimePicker variant="faded" color={color} placeholder="Select Date and Time" value={dateTimeVal[`${color}-faded`]} onChange={(dt) => setDateTimeVal(prev => ({ ...prev, [`${color}-faded`]: dt }))} size="sm" />
              <DateTimePicker variant="underlined" color={color} placeholder="Select Date and Time" value={dateTimeVal[`${color}-underlined`]} onChange={(dt) => setDateTimeVal(prev => ({ ...prev, [`${color}-underlined`]: dt }))} size="sm" />
              <DateTimePicker variant="flat" color={color} placeholder="Select Date and Time" value={dateTimeVal[`${color}-disabled`]} onChange={(dt) => setDateTimeVal(prev => ({ ...prev, [`${color}-disabled`]: dt }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>
      
      {/* ── 10. DROPDOWN ─────────────────────────────────────────── */}
      <Section title="Dropdown">
        <div className="space-y-8">
          {/* Variants and Colors Showcase */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-400">Variants & Colors</h3>
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[840px] space-y-3.5">
                {(["solid", "shadow", "bordered", "flat", "faded", "light"] as const).map((variant) => (
                  <div key={variant} className="grid grid-cols-7 items-center gap-4">
                    <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider w-24">
                      {variant}
                    </span>
                    {(["default", "primary", "secondary", "success", "warning", "danger"] as const).map((color) => {
                      let btnVariant: any = variant;
                      let btnClassName = "";
                      if (variant === "shadow") {
                        btnVariant = "solid";
                        const shadowMap = {
                          default: "shadow-lg shadow-neutral-500/20",
                          primary: "shadow-lg shadow-primary/30",
                          secondary: "shadow-lg shadow-secondary/30",
                          success: "shadow-lg shadow-success/30",
                          warning: "shadow-lg shadow-warning/30",
                          danger: "shadow-lg shadow-danger/30",
                        };
                        btnClassName = shadowMap[color];
                      }

                      return (
                        <Dropdown key={color}>
                          <DropdownTrigger>
                            <Button
                              variant={btnVariant}
                              color={color}
                              className={`w-full capitalize ${btnClassName}`}
                            >
                              {color}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu variant={variant} color={color} ariaLabel={`${variant} ${color} menu`}>
                            <DropdownItem key="new">New file</DropdownItem>
                            <DropdownItem key="copy">Copy link</DropdownItem>
                            <DropdownItem key="edit">Edit file</DropdownItem>
                            <DropdownItem key="delete" color="danger" className="text-danger">Delete file</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-150 dark:border-neutral-800">
            {/* Custom Trigger (Avatar) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-400">Custom Trigger</h3>
              <div className="flex items-center gap-4">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                      isBordered
                      color="primary"
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                    />
                  </DropdownTrigger>
                  <DropdownMenu variant="flat" color="primary" ariaLabel="Profile Actions" className="w-[240px]">
                    <DropdownSection title="Signed in as" showDivider>
                      <DropdownItem key="user-info" description="zoey@example.com" className="h-14 gap-2">
                        Zoey Lang
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Options" showDivider>
                      <DropdownItem key="settings" startContent={<FaGear className="w-3.5 h-3.5" />}>
                        My Settings
                      </DropdownItem>
                      <DropdownItem key="team_settings">Team Settings</DropdownItem>
                      <DropdownItem key="analytics">Analytics</DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Danger Zone">
                      <DropdownItem
                        key="logout"
                        color="danger"
                        className="text-danger"
                        startContent={<FaArrowRightFromBracket className="w-3.5 h-3.5" />}
                      >
                        Log Out
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
                <span className="text-xs text-neutral-400 font-medium">Click Avatar to trigger actions menu</span>
              </div>
            </div>

            <div className="space-y-4 col-span-1 md:col-span-2">
              <h3 className="text-sm font-semibold text-neutral-400">Selections & Sections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Single Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Single Selection</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" className="capitalize w-full">
                        Single: {Array.from(dropdownSingle).join(", ")}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      variant="flat"
                      selectionMode="single"
                      selectedKeys={dropdownSingle}
                      onSelectionChange={setDropdownSingle}
                    >
                      <DropdownItem key="text">Text file</DropdownItem>
                      <DropdownItem key="pdf">PDF document</DropdownItem>
                      <DropdownItem key="image">Image graphic</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Multiple Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Multiple Selection</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" className="capitalize w-full">
                        Filter ({dropdownMulti.size}): {Array.from(dropdownMulti).join(", ") || "none"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      variant="flat"
                      selectionMode="multiple"
                      selectedKeys={dropdownMulti}
                      onSelectionChange={setDropdownMulti}
                    >
                      <DropdownItem key="text">Text file</DropdownItem>
                      <DropdownItem key="pdf">PDF document</DropdownItem>
                      <DropdownItem key="image">Image graphic</DropdownItem>
                      <DropdownItem key="video">Video compilation</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Sections Variant */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Section Categories</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" className="capitalize w-full">
                        Actions Menu
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu variant="flat" ariaLabel="Sectioned Actions">
                      <DropdownSection title="Actions" showDivider>
                        <DropdownItem key="new">New file</DropdownItem>
                        <DropdownItem key="copy">Copy link</DropdownItem>
                      </DropdownSection>
                      <DropdownSection title="Danger Zone">
                        <DropdownItem key="delete" color="danger" className="text-danger">
                          Delete file
                        </DropdownItem>
                      </DropdownSection>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 11. FILE INPUT ───────────────────────────────────────── */}
      <Section title="File Input">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <FileInput variant="flat" color={color} value={fileVal[`${color}-flat`]} onChange={(file) => setFileVal(prev => ({ ...prev, [`${color}-flat`]: file }))} size="sm" />
              <FileInput variant="bordered" color={color} value={fileVal[`${color}-bordered`]} onChange={(file) => setFileVal(prev => ({ ...prev, [`${color}-bordered`]: file }))} size="sm" />
              <FileInput variant="faded" color={color} value={fileVal[`${color}-faded`]} onChange={(file) => setFileVal(prev => ({ ...prev, [`${color}-faded`]: file }))} size="sm" />
              <FileInput variant="underlined" color={color} value={fileVal[`${color}-underlined`]} onChange={(file) => setFileVal(prev => ({ ...prev, [`${color}-underlined`]: file }))} size="sm" />
              <FileInput variant="flat" color={color} value={fileVal[`${color}-disabled`]} onChange={(file) => setFileVal(prev => ({ ...prev, [`${color}-disabled`]: file }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 12. INPUT ────────────────────────────────────────────── */}
      <Section title="Input">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <Input variant="flat" color={color} placeholder="Enter your text" value={inputVal[`${color}-flat`]} onChange={(e) => setInputVal(prev => ({ ...prev, [`${color}-flat`]: e.target.value }))} size="sm" />
              <Input variant="bordered" color={color} placeholder="Enter your text" value={inputVal[`${color}-bordered`]} onChange={(e) => setInputVal(prev => ({ ...prev, [`${color}-bordered`]: e.target.value }))} size="sm" />
              <Input variant="faded" color={color} placeholder="Enter your text" value={inputVal[`${color}-faded`]} onChange={(e) => setInputVal(prev => ({ ...prev, [`${color}-faded`]: e.target.value }))} size="sm" />
              <Input variant="underlined" color={color} placeholder="Enter your text" value={inputVal[`${color}-underlined`]} onChange={(e) => setInputVal(prev => ({ ...prev, [`${color}-underlined`]: e.target.value }))} size="sm" />
              <Input variant="flat" color={color} placeholder="Enter your text" value={inputVal[`${color}-disabled`]} onChange={(e) => setInputVal(prev => ({ ...prev, [`${color}-disabled`]: e.target.value }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 13. PHONE NUMBER INPUT ────────────────────────────────── */}
      <Section title="Phone Number Input">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <PhoneNumberInput variant="flat" color={color} placeholder="Enter your phone number" value={phoneVal[`${color}-flat`]} onChange={(val) => setPhoneVal(prev => ({ ...prev, [`${color}-flat`]: val }))} size="sm" />
              <PhoneNumberInput variant="bordered" color={color} placeholder="Enter your phone number" value={phoneVal[`${color}-bordered`]} onChange={(val) => setPhoneVal(prev => ({ ...prev, [`${color}-bordered`]: val }))} size="sm" />
              <PhoneNumberInput variant="faded" color={color} placeholder="Enter your phone number" value={phoneVal[`${color}-faded`]} onChange={(val) => setPhoneVal(prev => ({ ...prev, [`${color}-faded`]: val }))} size="sm" />
              <PhoneNumberInput variant="underlined" color={color} placeholder="Enter your phone number" value={phoneVal[`${color}-underlined`]} onChange={(val) => setPhoneVal(prev => ({ ...prev, [`${color}-underlined`]: val }))} size="sm" />
              <PhoneNumberInput variant="flat" color={color} placeholder="Enter your phone number" value={phoneVal[`${color}-disabled`]} onChange={(val) => setPhoneVal(prev => ({ ...prev, [`${color}-disabled`]: val }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 14. POPOVER ──────────────────────────────────────────── */}
      <Section title="Popover">
        <Row>
          {COLORS.map((color) => (
            <Popover
              key={color}
              color={color}
              showArrow
              placement="bottom"
              trigger={
                <Button color={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Button>
              }
            >
              <div className="px-4 py-3">
                <div className="text-small font-bold">Popover Content</div>
                <div className="text-tiny">This is a beautiful {color} popover content.</div>
              </div>
            </Popover>
          ))}
          {/* Foreground Popover Variant */}
          <Popover
            color="foreground"
            showArrow
            placement="bottom"
            trigger={
              <Button variant="light" color="default">
                Foreground
              </Button>
            }
          >
            <div className="px-4 py-3">
              <div className="text-small font-bold">Popover Content</div>
              <div className="text-tiny">This is a beautiful foreground popover content.</div>
            </div>
          </Popover>
        </Row>
      </Section>

      {/* ── 15. RADIO ────────────────────────────────────────────── */}
      <Section title="Radio">
        {COLORS.map((color) => (
          <Row key={color} className="mb-4">
            <Label>{color}</Label>
            <Radio
              color={color}
              orientation="horizontal"
              value={selectedValues[color]}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedValues((prev) => ({ ...prev, [color]: val }));
              }}
              options={RADIO_OPTIONS}
            />
          </Row>
        ))}
        <Row className="mt-6">
          <Label>disabled</Label>
          <Radio
            color="primary"
            orientation="horizontal"
            value="london"
            disabled
            options={RADIO_OPTIONS}
          />
        </Row>
      </Section>

      {/* ── 16. RATING ───────────────────────────────────────────── */}
      <Section title="Rating">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Basic, Colors, Custom Icon, Disabled */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Usage</h3>
              <div className="space-y-4">
                <Rating label="Default Rating" defaultValue={3} />
                <Rating label="Rating with Half" defaultValue={3} allowHalf />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Colors</h3>
              <div className="space-y-4">
                <Rating label="Default" color="default" defaultValue={4} />
                <Rating label="Primary" color="primary" defaultValue={4} />
                <Rating label="Secondary" color="secondary" defaultValue={4} />
                <Rating label="Success" color="success" defaultValue={4} />
                <Rating label="Warning" color="warning" defaultValue={4} />
                <Rating label="Danger" color="danger" defaultValue={4} />
              </div>
            </div>
          </div>

          {/* Right Column: Product Review with Decimal ratings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Custom Icon Heart</h3>
              <Rating label="Heart Rating" icon={<FaHeart />} defaultValue={3} color="warning" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Custom Smiley</h3>
              <Rating label="Smiley Rating" icon={<FaFaceSmile />} defaultValue={3} color="success" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Disabled</h3>
              <Rating label="Disabled Rating" defaultValue={3} isDisabled />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-4">Product Review (Decimal / Read-only)</h3>
              <div className="space-y-4 max-w-xs">
                <div className="flex justify-between items-end gap-4">
                  <Rating label="Quality" value={1.5} allowHalf isReadOnly />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">1.5</span>
                </div>

                <div className="flex justify-between items-end gap-4">
                  <Rating label="Value for money" value={2.3} allowHalf isReadOnly />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">2.3</span>
                </div>

                <div className="flex justify-between items-end gap-4">
                  <Rating label="Design" value={3.7} allowHalf isReadOnly />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">3.7</span>
                </div>

                <div className="flex justify-between items-end gap-4">
                  <Rating label="Durability" value={4.2} allowHalf isReadOnly />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">4.2</span>
                </div>

                <div className="flex justify-between items-end gap-4">
                  <Rating label="Overall" value={4.8} allowHalf isReadOnly />
                  <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 17. SELECT DROPDOWN ───────────────────────────────────── */}
      <Section title="Select Dropdown">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <SelectDropdown variant="flat" color={color} options={RADIO_OPTIONS} placeholder="Select an option" field={{ name: `dropdown-${color}-flat`, value: dropdownVal[`${color}-flat`], onChange: () => { }, onBlur: () => { } } as any} form={{ setFieldValue: (_name: string, val: string) => setDropdownVal(prev => ({ ...prev, [`${color}-flat`]: val })), setFieldTouched: () => { }, touched: {}, errors: {} } as any} size="sm" />
              <SelectDropdown variant="bordered" color={color} options={RADIO_OPTIONS} placeholder="Select an option" field={{ name: `dropdown-${color}-bordered`, value: dropdownVal[`${color}-bordered`], onChange: () => { }, onBlur: () => { } } as any} form={{ setFieldValue: (_name: string, val: string) => setDropdownVal(prev => ({ ...prev, [`${color}-bordered`]: val })), setFieldTouched: () => { }, touched: {}, errors: {} } as any} size="sm" />
              <SelectDropdown variant="faded" color={color} options={RADIO_OPTIONS} placeholder="Select an option" field={{ name: `dropdown-${color}-faded`, value: dropdownVal[`${color}-faded`], onChange: () => { }, onBlur: () => { } } as any} form={{ setFieldValue: (_name: string, val: string) => setDropdownVal(prev => ({ ...prev, [`${color}-faded`]: val })), setFieldTouched: () => { }, touched: {}, errors: {} } as any} size="sm" />
              <SelectDropdown variant="underlined" color={color} options={RADIO_OPTIONS} placeholder="Select an option" field={{ name: `dropdown-${color}-underlined`, value: dropdownVal[`${color}-underlined`], onChange: () => { }, onBlur: () => { } } as any} form={{ setFieldValue: (_name: string, val: string) => setDropdownVal(prev => ({ ...prev, [`${color}-underlined`]: val })), setFieldTouched: () => { }, touched: {}, errors: {} } as any} size="sm" />
              <SelectDropdown variant="flat" color={color} options={RADIO_OPTIONS} placeholder="Select an option" field={{ name: `dropdown-${color}-disabled`, value: dropdownVal[`${color}-disabled`], onChange: () => { }, onBlur: () => { } } as any} form={{ setFieldValue: (_name: string, val: string) => setDropdownVal(prev => ({ ...prev, [`${color}-disabled`]: val })), setFieldTouched: () => { }, touched: {}, errors: {} } as any} size="sm" isDisabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 18. SKELETON ─────────────────────────────────────────── */}
      <Section title="Skeleton">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Switch
              color="primary"
              value={isSkeletonLoaded}
              onChange={setIsSkeletonLoaded}
              label="Toggle skeleton loaded state"
            />
            <span className="text-xs text-default-500 font-semibold">State: {isSkeletonLoaded ? "Loaded" : "Loading"}</span>
          </div>

          <div className="max-w-[300px] w-full flex items-center gap-3">
            <Skeleton className="shrink-0 !rounded-full w-14 h-14" isLoaded={isSkeletonLoaded}>
              <Avatar name="Om" color="primary" size="lg" />
            </Skeleton>
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-5 w-3/5 rounded-lg" isLoaded={isSkeletonLoaded}>
                <span className="text-sm font-semibold">Hemal Gondaliya</span>
              </Skeleton>
              <Skeleton className="h-4 w-4/5 rounded-lg" isLoaded={isSkeletonLoaded}>
                <span className="text-xs text-default-500">Software Engineer</span>
              </Skeleton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Shimmer Animation</h3>
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-5/6 rounded-lg" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Pulse Animation</h3>
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4 rounded-lg" animation="pulse" />
                <Skeleton className="h-3 w-full rounded-lg" animation="pulse" />
                <Skeleton className="h-3 w-5/6 rounded-lg" animation="pulse" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 19. SLIDER ───────────────────────────────────────────── */}
      <Section title="Slider">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Basic, Disabled, Sizes, Radius */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Usage</h3>
              <Slider label="Temperature" defaultValue={55} getValue={(v) => `${(Number(v) / 100).toFixed(2)}`} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Disabled</h3>
              <Slider label="Disabled Temperature" defaultValue={60} isDisabled getValue={(v) => `${(Number(v) / 100).toFixed(2)}`} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Sizes</h3>
              <div className="space-y-4">
                <Slider size="sm" defaultValue={30} label="Small" />
                <Slider size="md" defaultValue={50} label="Medium" />
                <Slider size="lg" defaultValue={70} label="Large" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Radius</h3>
              <div className="space-y-4">
                <Slider radius="none" defaultValue={20} label="Radius None" />
                <Slider radius="sm" defaultValue={40} label="Radius Small" />
                <Slider radius="md" defaultValue={60} label="Radius Medium" />
                <Slider radius="lg" defaultValue={80} label="Radius Large" />
                <Slider radius="full" defaultValue={100} label="Radius Full" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Fill Offset</h3>
              <Slider
                label="Exposure"
                minValue={-3}
                maxValue={3}
                step={0.5}
                defaultValue={1.5}
                fillOffset={0}
                color="warning"
                getValue={(v) => `${Number(v) > 0 ? "+" : ""}${v}`}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">With Tooltip</h3>
              <Slider
                label="Select a value"
                defaultValue={20}
                showTooltip
                marks={[
                  { value: 20, label: "20%" },
                  { value: 50, label: "50%" },
                  { value: 80, label: "80%" },
                ]}
              />
            </div>
          </div>

          {/* Right Column: Colors, Steps, Marks, Range, Vertical */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Colors</h3>
              <div className="space-y-4">
                <Slider color="default" defaultValue={20} label="Default" />
                <Slider color="primary" defaultValue={40} label="Primary" />
                <Slider color="secondary" defaultValue={60} label="Secondary" />
                <Slider color="success" defaultValue={80} label="Success" />
                <Slider color="warning" defaultValue={50} label="Warning" />
                <Slider color="danger" defaultValue={30} label="Danger" />
                <Slider color="foreground" defaultValue={30} label="Foreground" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">With Visible Steps</h3>
              <div className="space-y-4">
                <Slider step={10} showSteps label="Step 10" defaultValue={30} size="sm" />
                <Slider step={10} showSteps label="Step 10" defaultValue={30} size="md" />
                <Slider step={10} showSteps label="Step 10" defaultValue={30} size="lg" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">With Marks (Clickable)</h3>
              <Slider
                label="Select a value"
                defaultValue={20}
                marks={[
                  { value: 20, label: "20%" },
                  { value: 50, label: "50%" },
                  { value: 80, label: "80%" },
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Range Slider</h3>
              <Slider
                label="Price Range"
                defaultValue={[100, 500]}
                minValue={0}
                maxValue={1000}
                step={50}
                formatOptions={{ style: "currency", currency: "USD" }}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Start & End Content</h3>
              <Slider
                color="success"
                defaultValue={40}
                startContent={<FaVolumeOff className="text-neutral-400 w-4.5 h-4.5" />}
                endContent={<FaVolumeHigh className="text-neutral-400 w-4.5 h-4.5" />}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Vertical Slider</h3>
              <div className="flex gap-8 h-48 justify-center pt-2">
                <Slider orientation="vertical" color="primary" defaultValue={30} size="sm" />
                <Slider orientation="vertical" color="secondary" defaultValue={50} size="md" />
                <Slider orientation="vertical" color="success" defaultValue={70} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 20. SPINNER ──────────────────────────────────────────── */}
      <Section title="Spinner">
        {SPINNER_VARIANTS.map((variant) => (
          <Row key={variant}>
            <Label>{variant}</Label>
            {COLORS.map((color) => (
              <Spinner key={color} variant={variant} color={color} label={color.charAt(0).toUpperCase() + color.slice(1)} />
            ))}
          </Row>
        ))}
      </Section>

      {/* ── 21. SWITCH ───────────────────────────────────────────── */}
      <Section title="Switch">
        <Row>
          <Label>toggle</Label>
          {COLORS.map((color) => (
            <Switch
              key={color}
              color={color}
              value={!!switchValues[color]}
              onChange={(val: boolean) => setSwitchValues(prev => ({ ...prev, [color]: val }))}
              label={color.charAt(0).toUpperCase() + color.slice(1)}
            />
          ))}
        </Row>
        <Row>
          <Label>disabled</Label>
          {COLORS.map((color) => (
            <Switch key={color} color={color} value={true} onChange={() => { }} label={color.charAt(0).toUpperCase() + color.slice(1)} disabled />
          ))}
        </Row>
      </Section>

      {/* ── 22. TABS ─────────────────────────────────────────────── */}
      <Section title="Tabs">
        {/* ── Block 1: default / primary / secondary / success ── */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {(["solid", "bordered", "light", "underlined"] as const).flatMap((variant) =>
            (["default", "primary", "secondary"] as ColorOption[]).map((color) => (
              <div key={`${variant}-${color}`}>
                <Tabs variant={variant} color={color} defaultSelectedKey="photos">
                  <Tab key="photos" title="Photos" />
                  <Tab key="music" title="Music" />
                  <Tab key="videos" title="Videos" />
                </Tabs>
              </div>
            ))
          )}
          {/* Disabled row */}
          {(["default", "primary", "secondary"] as ColorOption[]).map((color) => (
            <div key={`disabled-${color}`}>
              <Tabs color={color} defaultSelectedKey="photos" isDisabled>
                <Tab key="photos" title="Photos" />
                <Tab key="music" title="Music" />
                <Tab key="videos" title="Videos" />
              </Tabs>
            </div>
          ))}
        </div>

        {/* ── Block 2: warning / danger ── */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 mt-3">
          {(["solid", "bordered", "light", "underlined"] as const).flatMap((variant) =>
            (["success", "warning", "danger"] as ColorOption[]).map((color) => (
              <div key={`${variant}-${color}`}>
                <Tabs variant={variant} color={color} defaultSelectedKey="photos">
                  <Tab key="photos" title="Photos" />
                  <Tab key="music" title="Music" />
                  <Tab key="videos" title="Videos" />
                </Tabs>
              </div>
            ))
          )}
          {/* Disabled row */}
          {(["success", "warning", "danger"] as ColorOption[]).map((color) => (
            <div key={`disabled-${color}`}>
              <Tabs color={color} defaultSelectedKey="photos" isDisabled>
                <Tab key="photos" title="Photos" />
                <Tab key="music" title="Music" />
                <Tab key="videos" title="Videos" />
              </Tabs>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 23. TEXTAREA ─────────────────────────────────────────── */}
      <Section title="Textarea">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <Textarea variant="flat" color={color} placeholder="Enter your text" value={textareaVal[`${color}-flat`]} onChange={(e) => setTextareaVal(prev => ({ ...prev, [`${color}-flat`]: e.target.value }))} size="sm" />
              <Textarea variant="bordered" color={color} placeholder="Enter your text" value={textareaVal[`${color}-bordered`]} onChange={(e) => setTextareaVal(prev => ({ ...prev, [`${color}-bordered`]: e.target.value }))} size="sm" />
              <Textarea variant="faded" color={color} placeholder="Enter your text" value={textareaVal[`${color}-faded`]} onChange={(e) => setTextareaVal(prev => ({ ...prev, [`${color}-faded`]: e.target.value }))} size="sm" />
              <Textarea variant="underlined" color={color} placeholder="Enter your text" value={textareaVal[`${color}-underlined`]} onChange={(e) => setTextareaVal(prev => ({ ...prev, [`${color}-underlined`]: e.target.value }))} size="sm" />
              <Textarea variant="flat" color={color} placeholder="Enter your text" value={textareaVal[`${color}-disabled`]} onChange={(e) => setTextareaVal(prev => ({ ...prev, [`${color}-disabled`]: e.target.value }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 24. TIME PICKER ──────────────────────────────────────── */}
      <Section title="Time Picker">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {COLORS.map((color) => (
            <div key={color} className="space-y-4 min-w-[200px]">
              <div className="text-xs font-bold text-neutral-400 capitalize mb-1">{color}</div>
              <TimePicker variant="flat" color={color} placeholder="Select a time" value={timeVal[`${color}-flat`]} onChange={(t) => setTimeVal(prev => ({ ...prev, [`${color}-flat`]: t }))} size="sm" />
              <TimePicker variant="bordered" color={color} placeholder="Select a time" value={timeVal[`${color}-bordered`]} onChange={(t) => setTimeVal(prev => ({ ...prev, [`${color}-bordered`]: t }))} size="sm" />
              <TimePicker variant="faded" color={color} placeholder="Select a time" value={timeVal[`${color}-faded`]} onChange={(t) => setTimeVal(prev => ({ ...prev, [`${color}-faded`]: t }))} size="sm" />
              <TimePicker variant="underlined" color={color} placeholder="Select a time" value={timeVal[`${color}-underlined`]} onChange={(t) => setTimeVal(prev => ({ ...prev, [`${color}-underlined`]: t }))} size="sm" />
              <TimePicker variant="flat" color={color} placeholder="Select a time" value={timeVal[`${color}-disabled`]} onChange={(t) => setTimeVal(prev => ({ ...prev, [`${color}-disabled`]: t }))} size="sm" disabled />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 25. TOGGLE BUTTON ────────────────────────────────────── */}
      <Section title="Toggle Button">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Exclusive (Single), Multi-select, Sizes */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Exclusive Selection (Single Select)</h3>
              <div className="flex flex-col gap-2">
                <ToggleButtonGroup
                  value={alignment}
                  exclusive
                  onChange={(_e, val) => setAlignment(val)}
                  color="primary"
                >
                  <ToggleButton value="left" aria-label="left aligned">
                    <FaAlignLeft className="w-4 h-4" />
                  </ToggleButton>
                  <ToggleButton value="center" aria-label="centered">
                    <FaAlignCenter className="w-4 h-4" />
                  </ToggleButton>
                  <ToggleButton value="right" aria-label="right aligned">
                    <FaAlignRight className="w-4 h-4" />
                  </ToggleButton>
                  <ToggleButton value="justify" aria-label="justified">
                    <FaAlignJustify className="w-4 h-4" />
                  </ToggleButton>
                </ToggleButtonGroup>
                <span className="text-xs text-neutral-400">Selected: {alignment || "none"}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Multiple Selection</h3>
              <div className="flex flex-col gap-2">
                <ToggleButtonGroup
                  value={formats}
                  onChange={(_e, val) => setFormats(val)}
                  color="secondary"
                >
                  <ToggleButton value="bold" aria-label="bold">
                    <FaBold className="w-4 h-4" />
                  </ToggleButton>
                  <ToggleButton value="italic" aria-label="italic">
                    <FaItalic className="w-4 h-4" />
                  </ToggleButton>
                  <ToggleButton value="underline" aria-label="underline">
                    <FaUnderline className="w-4 h-4" />
                  </ToggleButton>
                </ToggleButtonGroup>
                <span className="text-xs text-neutral-400">Selected: {formats.join(", ") || "none"}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Sizes</h3>
              <div className="flex flex-col gap-3">
                <ToggleButtonGroup value="sm" exclusive onChange={() => { }} size="sm">
                  <ToggleButton value="sm">Small</ToggleButton>
                  <ToggleButton value="md">Button</ToggleButton>
                  <ToggleButton value="lg">Group</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup value="md" exclusive onChange={() => { }} size="md">
                  <ToggleButton value="sm">Medium</ToggleButton>
                  <ToggleButton value="md">Button</ToggleButton>
                  <ToggleButton value="lg">Group</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup value="lg" exclusive onChange={() => { }} size="lg">
                  <ToggleButton value="sm">Large</ToggleButton>
                  <ToggleButton value="md">Button</ToggleButton>
                  <ToggleButton value="lg">Group</ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
          </div>

          {/* Right Column: Colors & Vertical */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Colors</h3>
              <div className="flex flex-col gap-3">
                {(["default", "primary", "secondary", "success", "warning", "danger"] as const).map((color) => (
                  <div key={color} className="flex items-center gap-4">
                    <span className="text-xs text-neutral-400 w-20 capitalize">{color}</span>
                    <ToggleButtonGroup value={alignment} exclusive onChange={(_e, val) => setAlignment(val)} color={color} size="sm">
                      <ToggleButton value="left">
                        <FaAlignLeft className="w-3.5 h-3.5" />
                      </ToggleButton>
                      <ToggleButton value="center">
                        <FaAlignCenter className="w-3.5 h-3.5" />
                      </ToggleButton>
                      <ToggleButton value="right">
                        <FaAlignRight className="w-3.5 h-3.5" />
                      </ToggleButton>
                      <ToggleButton value="justify" aria-label="justified">
                        <FaAlignJustify className="w-3.5 h-3.5" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Vertical Orientation</h3>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={(_e, val) => setAlignment(val)}
                orientation="vertical"
                color="primary"
              >
                <ToggleButton value="left" aria-label="left aligned">
                  <FaAlignLeft className="w-4 h-4" />
                </ToggleButton>
                <ToggleButton value="center" aria-label="centered">
                  <FaAlignCenter className="w-4 h-4" />
                </ToggleButton>
                <ToggleButton value="right" aria-label="right aligned">
                  <FaAlignRight className="w-4 h-4" />
                </ToggleButton>
                <ToggleButton value="justify" aria-label="justified">
                  <FaAlignJustify className="w-4 h-4" />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 26. TOOLTIP ──────────────────────────────────────────── */}
      <Section title="Tooltip">
        <div className="flex flex-wrap gap-4">
          <Tooltip content="Default Tooltip" placement="top" showArrow>
            <Button variant="flat">Hover Me</Button>
          </Tooltip>
          <Tooltip content="Primary Color" color="primary" placement="bottom" showArrow>
            <Button color="primary" variant="flat">Bottom</Button>
          </Tooltip>
          <Tooltip content="Danger Alert Tooltip" color="danger" placement="right" showArrow>
            <Button color="danger" variant="flat">Right</Button>
          </Tooltip>
          <Tooltip content="Custom smooth animation" color="secondary" placement="left" showArrow>
            <Button color="secondary" variant="flat">Left</Button>
          </Tooltip>
        </div>
      </Section>

      {/* ── 27. TABLE ────────────────────────────────────────────── */}
      <Section title="Table">
        <div className="space-y-6">
          {/* Static Table with Multiple Selection, Custom Colors, Compact, Striped */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Interactive Table Showcase</h3>
                <p className="text-xs text-neutral-500">Supports selection state, striped rows, loading overlays, and custom headers.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  color={tableLoading ? "warning" : "primary"}
                  onClick={() => setTableLoading(!tableLoading)}
                >
                  {tableLoading ? "Stop Loading" : "Trigger Loading"}
                </Button>
              </div>
            </div>

            <Table
              aria-label="Example static table"
              color="primary"
              selectionMode="multiple"
              selectedKeys={tableSelection}
              onSelectionChange={setTableSelection}
              isStriped
              classNames={{
                wrapper: "min-h-[220px]"
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody isLoading={tableLoading} emptyContent="No rows found.">
                <TableRow key="1">
                  <TableCell>Tony Stark</TableCell>
                  <TableCell>CEO / Founder</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs rounded bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 font-medium">Active</span>
                  </TableCell>
                </TableRow>
                <TableRow key="2">
                  <TableCell>Steve Rogers</TableCell>
                  <TableCell>Captain</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs rounded bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 font-medium">Active</span>
                  </TableCell>
                </TableRow>
                <TableRow key="3">
                  <TableCell>Wanda Maximoff</TableCell>
                  <TableCell>Witch</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">Inactive</span>
                  </TableCell>
                </TableRow>
                <TableRow key="4">
                  <TableCell>Natasha Romanoff</TableCell>
                  <TableCell>Spy</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs rounded bg-danger-50 dark:bg-danger-950/30 text-danger-600 dark:text-danger-400 font-medium">Terminated</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="text-xs text-neutral-500">
              Selected Rows: {tableSelection === "all" ? "All Rows" : Array.from(tableSelection).join(", ") || "None"}
            </div>
          </div>

          {/* Dynamic Table with Sorting and allowsSorting */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl space-y-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Dynamic Columns and Rows with Sorting</h3>
              <p className="text-xs text-neutral-500">Renders declaratively from items data and handles column sorting.</p>
            </div>

            {(() => {
              const columnsData: { name: string; uid: string; sortable: boolean; align?: "start" | "center" | "end" }[] = [
                { name: "NAME", uid: "name", sortable: true },
                { name: "HEIGHT (m)", uid: "height", sortable: true },
                { name: "MASS (kg)", uid: "mass", sortable: false, align: "center" },
              ];

              const initialRows = [
                { id: "10", name: "Luke Skywalker", height: "1.72", mass: "77" },
                { id: "20", name: "Darth Vader", height: "2.02", mass: "136" },
                { id: "30", name: "Leia Organa", height: "1.50", mass: "49" },
                { id: "40", name: "Han Solo", height: "1.80", mass: "80" },
                { id: "50", name: "Han Solo", height: "1.80", mass: "80" },
              ];

              // Apply client-side sorting based on sortDesc
              const sortedRows = [...initialRows].sort((a: any, b: any) => {
                const first = a[sortDesc.column];
                const second = b[sortDesc.column];
                const cmp = parseFloat(first) && parseFloat(second)
                  ? parseFloat(first) - parseFloat(second)
                  : String(first).localeCompare(String(second));
                return sortDesc.direction === "descending" ? -cmp : cmp;
              });

              return (
                <Table
                  aria-label="Example dynamic table"
                  color="secondary"
                  sortDescriptor={sortDesc}
                  onSortChange={setSortDesc}
                  isCompact
                >
                  <TableHeader columns={columnsData}>
                    {(column) => (
                      <TableColumn key={column.uid} allowsSorting={column.sortable} align={column.align}>
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={sortedRows}>
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.height}</TableCell>
                        <TableCell>{item.mass}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              );
            })()}
            <div className="text-xs text-neutral-500">
              Sorted by: <span className="font-semibold">{String(sortDesc.column)}</span> ({sortDesc.direction})
            </div>
          </div>
        </div>
      </Section>

      {/* ── 28. PAGINATION ───────────────────────────────────────── */}
      <Section title="Pagination">
        <div className="space-y-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm">
          {/* Colors & Sizes Demo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Colors</h3>
            <div className="flex flex-col gap-3">
              {(["default", "primary", "secondary", "success", "warning", "danger"] as const).map((color) => (
                <div key={color} className="flex flex-wrap items-center gap-4">
                  <span className="text-xs text-neutral-400 w-24 capitalize">{color}</span>
                  <Pagination total={10} initialPage={3} color={color} showControls />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800" />

          {/* Variants Demo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Variants</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-neutral-400 w-24">Flat (Default)</span>
                <Pagination total={10} initialPage={1} variant="flat" color="primary" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-neutral-400 w-24">Bordered</span>
                <Pagination total={10} initialPage={2} variant="bordered" color="secondary" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-neutral-400 w-24">Faded</span>
                <Pagination total={10} initialPage={3} variant="faded" color="success" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-neutral-400 w-24">Light</span>
                <Pagination total={10} initialPage={4} variant="light" color="danger" />
              </div>
            </div>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800" />

          {/* Layout & Animation Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Layout & Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-500">Compact Toolbar Style</h4>
                <Pagination total={10} initialPage={5} isCompact showControls color="secondary" radius="md" />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-500">Looping Pagination with Custom Sibling Range</h4>
                <Pagination total={15} initialPage={8} siblings={1} boundaries={2} loop showControls color="warning" />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-500">Sizing Options</h4>
                <div className="flex flex-col gap-3">
                  <Pagination total={5} initialPage={1} size="sm" color="success" />
                  <Pagination total={5} initialPage={1} size="md" color="success" />
                  <Pagination total={5} initialPage={1} size="lg" color="success" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-500">Controlled Selection Synchronization</h4>
                <div className="flex items-center gap-4">
                  <Pagination total={8} page={activePageDemo} onChange={setActivePageDemo} showControls color="danger" radius="full" />
                  <div className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    Selected Page: <span className="font-bold text-neutral-800 dark:text-neutral-200">{activePageDemo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default UIKit;
