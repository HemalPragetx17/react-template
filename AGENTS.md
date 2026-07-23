# Project Structure & Pages

Use `src/pages/projects/` as the reference feature module.

---

## Folder Structure

### Top-level `src/` layout

| Folder | Purpose | Example |
|--------|---------|---------|
| `pages/` | Route-level screens and feature UI | `pages/projects/AllProjects.tsx` |
| `components/` | Shared/reusable UI | `components/custom-table/CustomTable.tsx` |
| `services/` | API calls only (axios via `http-service`) | `services/project-service.ts` |
| `models/` | TypeScript interfaces per domain | `models/project/index.ts` |
| `shared/enums/` | Domain constants and badge class maps | `shared/enums/project.ts` |
| `shared/constants/` | App-wide constants | `shared/constants/pagination.ts` |
| `validation/` | Yup schemas per domain | `validation/project/index.ts` |
| `routes/` | Route paths and lazy route registration | `routes/routing.ts`, `routes/AppRouting.tsx` |
| `store/` | Redux slices and app state | `store/slices/generalSlice.ts` |
| `utils/` | Pure helpers (dates, query params) | `utils/dateFormat.ts` |
| `assets/` | Static images/icons | `assets/icons/totalproject.svg` |
| `layout/` | App shells (header, auth layout) | `layout/Header.tsx` |

### Feature folder under `pages/`

Keep one domain per folder (kebab-case): `projects/`, `resources/`, `tasks/`.

```
pages/projects/
  AllProjects.tsx          # list page (route entry)
  ProjectDetails.tsx       # detail page (route entry)
  ProjectForm.tsx          # create/edit form (modal child)
  ProjectEmployeesTab.tsx  # detail tab
  ProjectTasksTab.tsx
  projectMockData.ts       # local mock only (remove when API wired)
```

- Route entry files live at the feature root.
- Tab panels, forms, and modals stay in the same folder unless reused across features.
- Page-specific subcomponents go in `components/` inside the feature (see `capacity-engine/components/`).
- Do **not** put API logic, enums, or models inside `pages/`.

### Cross-feature dependencies

- Pages import from `services/`, `models/`, `shared/`, `components/`, `utils/`.
- Services import from `models/` and `utils/` only — never from `pages/`.
- Add new routes in `routes/routing.ts` (`RoutePaths`) and register in `routes/AppRouting.tsx`.

---

## Pages — File Naming

Reference: `src/pages/projects/`

### Folder names

- **kebab-case** for feature folders: `projects`, `work-report`, `capacity-engine`
- **camelCase** only for mock data files at feature root

### Component files (PascalCase `.tsx`)

| Pattern | Use | Example |
|---------|-----|---------|
| `All{Entity}.tsx` | Paginated list / main listing page | `AllProjects.tsx` |
| `{Entity}Details.tsx` | Single-record detail view | `ProjectDetails.tsx` |
| `{Entity}Form.tsx` | Create/edit form (usually in a modal) | `ProjectForm.tsx` |
| `{Parent}{Feature}Tab.tsx` | Tab panel inside a detail page | `ProjectEmployeesTab.tsx` |
| `Delete{Entity}Modal.tsx` | Destructive confirmation modal | `DeleteTaskModal.tsx` |
| `{Feature}ExpandedPanel.tsx` | Expandable row/panel UI | `WorkReportExpandedPanel.tsx` |

### Non-route files

| Pattern | Use | Example |
|---------|-----|---------|
| `{entity}MockData.ts` | Temporary/local mock data | `projectMockData.ts` |
| `components/{Name}.tsx` | Feature-only subcomponents | `capacity-engine/components/UtilisationFilter.tsx` |

### Export convention

- Default export the page/tab/form component.
- Name the export same as the filename: `const AllProjects = () => …; export default AllProjects;`

### Props interfaces

- Suffix with `Props`: `ProjectEmployeesTabProps`, `ProjectFormProps`
- Tab components receive IDs from parent: `{ projectId: string }`

---

## Pages — Code Patterns

Follow `AllProjects.tsx`, `ProjectDetails.tsx`, `ProjectEmployeesTab.tsx`, and `ProjectForm.tsx`.

### Imports (order)

1. React / hooks
2. Third-party (`formik`, `react-redux`, `react-router-dom`, icons)
3. `../../components/*`
4. `../../models/*`
5. `../../services/*`
6. `../../shared/*` (enums, constants)
7. `../../store/*`
8. `../../utils/*`
9. Same-folder relatives (`./ProjectForm`)

### List page (`All{Entity}.tsx`)

```tsx
// Refs for table state (not useState)
const totalCountRef = useRef<number>(Digits.Zero);
const formRef = useRef<IFilters>(initialState);
const pageRef = useRef<Pagination>(PAGINATION);
const sortRef = useRef<SortDescriptor | null>(null);
const recordRef = useRef<IModel | null>(null); // for edit modal

const [records, setRecords] = useState<IModel[]>([]);
const [openDialog, setOpenDialog] = useState(false);
```

**Fetch function**
- `dispatch(handleTableLoader(true))` before call, `false` in `.finally()`
- Build `params` with `page`, `limit`, `sortKey`, `sortOrder`, `needCount`, `searchTerm`, filters
- On success: set `totalCountRef.current`, map records, `setRecords`
- Use `.then().catch().finally()` chain (match existing pages)

**Row mapping**
```tsx
const mapResponseToColumns = (res: IModel, index: number) => ({
  ...res,
  index: index + 1, // page-local only; CustomTable adds global offset
  startDate: res.startDate ? DateToMonthDayYearString(res.startDate) : null,
});
```
- Guard nested API fields (`emp?.reference?._id`) before mapping
- Coerce types to match `models/` (e.g. `weeklyHours` is `string`)

**CustomTable wiring**
```tsx
<CustomTable
  columns={columns}
  data={records}
  totalCountRef={totalCountRef}
  pageRef={pageRef}
  sortRef={sortRef.current ?? undefined}
  onSetPageDetailsReceived={handleSetPageDetails}
  onSortDetailsReceived={handleSetSortDetails}
/>
```

**Filter/tab change** — reset pagination and sort:
```tsx
pageRef.current = { ...pageRef.current, page: Digits.One };
sortRef.current = null;
getRecords(formRef.current);
```

**Navigation to details**
```tsx
navigate(Routing.ProjectDetails, { state: { id: record._id } });
```

### Detail page (`{Entity}Details.tsx`)

- Read ID from `useLocation().state?.id`
- Fetch in `useEffect` when ID present
- Back button → `navigate(Routing.AllProjects)`
- Tabs: local `activeTab` state; render tab components conditionally
- Pass context down: `<ProjectEmployeesTab projectId={project?._id ?? ""} />`
- Edit modal: transform API shape → form shape before passing to `{Entity}Form`

### Tab component (`{Parent}{Feature}Tab.tsx`)

- Props: `{ projectId: string }` (or relevant parent ID)
- Own `pageRef`, `sortRef`, `totalCountRef`, and fetch logic
- Return only the table/section — no page title or outer layout
- Wrap in `<div className="w-full">`

### Form component (`{Entity}Form.tsx`)

- Props: `{ entity: IModel | null; onEntityAdd: () => void; handleDialogClose: () => void }`
- Formik + `Field` + shared UI inputs (`Input`, `SelectDropdown`, `DateInput`)
- Validation from `validation/{domain}/`
- `dispatch(handleFormLoader(true/false))` on submit
- `toast.success` on success, call `onEntityAdd()` to refresh parent list
- Strip UI-only fields before API call (e.g. `dummyEmployeeSelect`)

### Layout conventions

- Root wrapper: `<section className="space-y-5">`
- Page title: `<h1 className="text-2xl font-bold text-neutral-900">`
- Tables inside `<Card shadow="sm"><CardBody className="p-0">`
- Status tabs: `<Tabs variant="underlined" … className="gap-6 [&_[role=tabpanel]]:hidden …">`

### Do not

- Put API calls inline in JSX — use named async functions
- Compute global row index in mapped data — use `index + 1` only
- Store pagination/sort in `useState` when using `CustomTable` refs
- Add business enums or interfaces in page files — use `shared/enums/` and `models/`

---

## UI field components — shared styling tokens

When changing **Input**, **Textarea**, **Select**, **Date/Time pickers**, **FileInput**, **PhoneNumberInput**, **Checkbox**, **Radio**, or **Switch** appearance (colors, borders, hover, focus, disabled, labels, placeholders, radius), **edit the shared token files first**. Do **not** duplicate variant/color class maps inside individual component files.

### Golden rules (all input components)

1. **Single edit point for variant + color chrome** — change `fieldStyles.ts` (`flatColorClasses`, `borderedColorClasses`, `fadedColorClasses`, `underlinedColorClasses`, or `getInputVariantClasses`) so Input, Select, Date/Time pickers, etc. stay in sync. Do **not** copy those maps into a component.
2. **Value text is never theme-colored** — typed text uses `fieldValueClasses` (`.field-value` in `fieldStyles.css`: `text-foreground` / `dark:text-neutral-200`). Theme `color` applies to **borders and backgrounds only**, not the input value, placeholder, or icons.
3. **Labels / placeholders / errors** — use `labelClasses`, `fieldPlaceholderClasses`, `errorClasses` from `fieldStyles.ts`; define their CSS in `fieldStyles.css`.
4. **Disabled behaviour** — use `getInputDisabledClasses(variant, color)`:
   - **Flat + colored** (`primary`, `success`, …): keep theme background, dim with `opacity-70` only.
   - **Flat + default**, **bordered**, **faded**, **underlined**: neutral disabled fill (`inputDisabledClasses`).
   - Pickers use `stripInteractiveFieldClasses` so hover/focus does not show when disabled.
5. **New field-like component** — wire wrapper to `getInputVariantClasses`, `getWrapperBaseClasses`, `getInteractiveBorderClass`, `fieldValueClasses`, `fieldPlaceholderClasses`, and verify in UIKit.

### Source-of-truth files

| File | Purpose |
|------|---------|
| `src/components/ui/shared/fieldStyles.ts` | **Primary** variant + color maps (`flat` / `bordered` / `faded` / `underlined`), `getInputVariantClasses`, disabled helpers, wrapper defaults, focus/fieldset borders, label class names |
| `src/theme/fieldStyles.css` | Label, error, placeholder, **value** utilities; `--input-disabled-opacity`; dark `--input-surface-bg` / `--input-border-*` vars (PhoneInput CSS reads these) |
| `src/components/ui/shared/radius.ts` | **Field wrapper** corner radius (`DEFAULT_RADIUS`, `getRadiusClass`, `syncDefaultRadiusCssVariable`) |
| `src/theme/radius.css` | Radius CSS variables consumed by Tailwind |
| `src/theme/colors.css` | Theme palette + global `--disabled-opacity` (keep in sync with field disabled opacity) |

Export surface for app code: `src/components/ui/index.ts` (re-exports field + radius tokens).

### Standard inputs (Input, Textarea, Select, Date/Time, FileInput)

Apply on the **wrapper** div (not the native `<input>`):

```tsx
getInputVariantClasses(variant, color)   // flat | bordered | faded | underlined surfaces
getWrapperBaseClasses({ variant, ... })
getInteractiveBorderClass({ variant, color, isActive, hasError, ... })
fieldValueClasses                        // .field-value — neutral typed text
fieldPlaceholderClasses                  // .field-placeholder
```

Outlined placement uses `fieldsetBorderColors` / `focusBorderColors` instead of `getInputVariantClasses`.

### PhoneNumberInput — special rules

`PhoneNumberInput` wraps **react-phone-input-2**. Its flag dropdown and phone `<input>` are styled by library CSS, so the same Tailwind variant classes used on other wrappers **do not reliably apply** to inner parts (library `#fff` / `#f5f5f5` wins; runtime `!bg-*` classes are often missing from the Tailwind bundle).

| Rule | Detail |
|------|--------|
| **Layout + library overrides** | `src/components/ui/input/phoneInput/index.css` — sizes, two-box vs single-border, dropdown, dividers, `!important` overrides |
| **Color scope on container** | TS adds `phone-input-color-${color}` and `phone-input-variant-${variant}` on `.react-tel-input` |
| **Flat / faded surfaces in CSS** | Define `--phone-flat-bg`, `--phone-flat-bg-hover`, `--phone-faded-bg`, etc. on `.phone-input-color-*` in `index.css` — **keep in sync** with `getFlatSurfaceClasses` / `flatColorClasses` in `fieldStyles.ts` |
| **`singleBorder={false}` (default, two-box)** | Separate flag + input boxes; surfaces applied per-part in `index.css`; shell classes from `getPhoneTwoBoxPartClasses()` |
| **`singleBorder={true}` (unified shell)** | One border/background on container; inner flag + input stay transparent; flag/input divider via `::after` on flat, bordered, faded, underlined |
| **Disabled height** | Do **not** put fixed `h-*` + extra border on the outer wrapper when disabled — disabled chrome belongs on the `.react-tel-input` container (single-border) or per-part rules (two-box) so height matches enabled state |
| **Value / placeholder** | Still use `fieldValueClasses` + `fieldPlaceholderClasses` on inner classes — same neutral text rule as other inputs |

When changing flat primary (or any color) project-wide: update **both** `flatSurfaceTokens` / `flatColorClasses` in `fieldStyles.ts` **and** the matching `--phone-flat-bg` block in `phoneInput/index.css`.

### What lives in `fieldStyles.ts`

| Token / helper | Use when changing… |
|----------------|-------------------|
| `flatColorClasses`, `borderedColorClasses`, `fadedColorClasses`, `underlinedColorClasses` | Variant + color background, border, hover, focus-within |
| `getInputVariantClasses(variant, color)` | Building wrapper variant classes — **use this in components; do not copy the maps** |
| `getFlatSurfaceClasses(color)` | Flat tint source of truth — mirror in PhoneInput CSS vars when editing flat |
| `getPhoneTwoBoxPartClasses(variant, color, disabled)` | Two-box phone shell only (borders/layout); surfaces from `index.css` |
| `inputWrapperDefaultClasses`, `getWrapperBaseClasses`, `getInteractiveBorderClass` | Extra wrapper layer (bordered white fill in light mode, focus border override) |
| `labelClasses`, `labelFloatingClasses`, `labelGroupClasses`, `errorClasses`, `requiredIndicatorClasses` | Label/error class name strings → styles in `fieldStyles.css` |
| `fieldValueClasses`, `fieldPlaceholderClasses` | Value + placeholder typography/color → styles in `fieldStyles.css` |
| `focusBorderColors`, `fieldsetBorderColors`, `focusTextColors`, `underlineColors` | Outlined fieldset, underlined accent bar, focused label/icon color |
| `getFlatFloatingLabelClass` | Inside/outside floating label colors on **flat** variant |
| `inputDisabledOpacityClass`, `inputDisabledWrapperClasses`, `getInputDisabledClasses` | Disabled dimming + cursor; flat **colored** keeps theme bg |
| `stripInteractiveFieldClasses` | Remove hover/focus when disabled (DateInput, TimePicker, DateTimePicker) |
| `DEFAULT_CALENDAR_RADIUS`, `syncCalendarRadiusCssVariable`, `getCalendarRadiusClass` | **Calendar day cells only** — not input wrapper radius |

### What lives in `fieldStyles.css`

- `.input-label`, `.input-label-floating`, `.input-label-group`, `.input-error`, `.input-label-required`
- `.field-placeholder`, `.field-value` (neutral value text — **not** theme-colored)
- `:root { --input-disabled-opacity }` — keep in sync with `inputDisabledOpacityClass` in TS
- `.dark { --input-surface-bg, --input-border-subtle, --input-border-hover, --input-border-focus }` — dark surfaces; PhoneInput `index.css` reads these for bordered/faded/underlined two-box

**Rule:** If you add a new utility class string in `fieldStyles.ts` (e.g. `labelClasses = "input-label"`), define its CSS in `fieldStyles.css`, not inline in components.

### Components that consume these tokens

All of the following import from `shared/fieldStyles` (and `shared/radius` for wrapper radius):

- `Input.tsx`, `Textarea.tsx`, `SelectDropdown.tsx`
- `DateInput.tsx`, `TimePicker.tsx`, `DateTimePicker.tsx`
- `FileInput.tsx`, `PhoneNumberInput.tsx`
- `Checkbox.tsx`, `Radio.tsx`, `Switch.tsx`

When adding a new field-like component, wire it to the same helpers so UIKit and forms stay consistent.

### Exceptions — component-local CSS (layout only; colors from shared tokens)

| Location | Scope |
|----------|--------|
| `src/components/ui/input/phoneInput/index.css` | Phone flag/input layout, `phone-input-color-*` CSS vars, two-box vs `singleBorder`, react-tel-input overrides, disabled per-part chrome |
| `src/components/ui/input/dateInput/index.css` | Calendar popover, day grid, range selection; day radius uses `--calendar-radius` |
| `src/components/ui/input/fileInput/index.css` | Upload dropzone/preview layout only |

PhoneNumberInput TS still uses `getPhoneTwoBoxPartClasses`, `getInputDisabledClasses`, `getWrapperBaseClasses`, etc. from `fieldStyles.ts` for the outer wrapper.

### Decision guide for agents

**Change here (shared tokens)** | **Examples**
---|---
Variant look for standard fields | Dark flat primary background, bordered focus border, faded border color — edit maps in `fieldStyles.ts`
Flat color for PhoneNumberInput too | Update `flatSurfaceTokens` **and** `--phone-flat-bg` / `--phone-flat-bg-hover` in `phoneInput/index.css`
Labels / placeholders / errors project-wide | Label grey in dark mode, placeholder color — `fieldStyles.css`
Neutral typed value color | `.field-value` in `fieldStyles.css` (never `text-primary` on value text)
Disabled opacity or neutral disabled fill | `inputDisabledOpacityClass` + `--input-disabled-opacity`
Input wrapper corner radius | `DEFAULT_RADIUS` in `radius.ts`
Calendar day pill radius | `DEFAULT_CALENDAR_RADIUS` in `fieldStyles.ts`

**Do not change in one component only** | **Why**
---|---
Copy `flatColorClasses` into `Input.tsx` | Drift vs Select, DateInput, Phone flat vars, etc.
Hardcode `opacity-50` on disabled wrapper | Use `inputDisabledWrapperClasses` or `getInputDisabledClasses`
Set calendar day radius via `getRadiusClass()` on day buttons | Use `getCalendarRadiusClass()`
Apply theme color to input **value** text | Use `fieldValueClasses`; theme color is for chrome only
Add Tailwind `!bg-primary-50` only on Phone inner input | Use `--phone-flat-bg` in `index.css` keyed by `phone-input-color-*`

### Sync checklist after token edits

1. **TS ↔ CSS vars:** If you change `inputDisabledOpacityClass`, update `--input-disabled-opacity` in `fieldStyles.css` and `--disabled-opacity` in `colors.css`.
2. **Flat colors:** If you change `getFlatSurfaceClasses` / `flatColorClasses`, update matching `--phone-flat-bg` / `--phone-flat-bg-hover` in `phoneInput/index.css`.
3. **Calendar radius:** If you change `DEFAULT_CALENDAR_RADIUS`, call remains in `main.tsx` via `syncCalendarRadiusCssVariable()`; fallback in `fieldStyles.css` `:root`.
4. **Wrapper radius:** If you change `DEFAULT_RADIUS`, `syncDefaultRadiusCssVariable()` in `main.tsx`; values in `radius.css`.
5. **Verify in UIKit:** `src/pages/uikit/UIKit.tsx` — Input, Textarea, Select, Date/Time, File, **Phone** sections; test `flat` / `bordered` / `faded` / `underlined`, all colors, light + dark, disabled row; for Phone also spot-check `singleBorder={true}` if used in product forms.
6. **Disabled behaviour:** Colored **flat** disabled keeps theme tint; bordered/faded/underlined use neutral disabled chrome; disabled fields must not show hover (pickers use `stripInteractiveFieldClasses`); Phone disabled row must match enabled height.

### Do not

- Add per-component `flatColorClasses` / `borderedColorClasses` duplicates — extend maps in `fieldStyles.ts`
- Style labels with ad-hoc `text-neutral-*` on external labels when `labelClasses` / `fieldStyles.css` should own it
- Override disabled background on flat `primary`/`secondary`/etc. with neutral gray — use `getInputDisabledClasses`
- Change phone/date calendar **layout** in `fieldStyles.ts` — keep layout in component CSS, **colors/tokens** in fieldStyles (+ phone CSS vars for PhoneInput)
- Theme-color the typed value (`text-primary` on input value) — borders/backgrounds only
