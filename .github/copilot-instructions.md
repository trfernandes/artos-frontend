# Copilot instructions for this repo

## Big picture architecture
- Expo + React Native app using `expo-router`; routes live under `app/` with nested layouts like `app/_layout.tsx`, `app/(app)/_layout.tsx`, and `app/(app)/(drawer)/_layout.tsx`.
- App root composes providers in `app/_layout.tsx`: `QueryClientProvider`, `AuthProvider`, `ConnectivityProvider`, `FancyAlertProvider`, `Toast`, and `ConnectivityBanner`.
- Auth state is centralized in `contexts/AuthContext.tsx` (AsyncStorage token/user, sign-in/out, 401 handling) and gates routing (`Redirect` to `/(auth)` when needed).
- Data layer follows a Base API -> Repository -> Hook pattern:
  - `domain/api/BaseApi.ts` wraps axios calls and expects a `{ data: ... }` API envelope.
  - `domain/services/BaseRepository.ts` provides CRUD helpers and per-entity repositories (e.g., `domain/services/EventosRepository.ts`).
  - UI uses `hooks/useCrud.ts` (React Query + React Hook Form + Toasts) and specialized hooks like `useEscalaTemplatesCrud.ts`.

## Key conventions & patterns
- Styling uses the shared `Pallete` in `constants/colors.ts` and “Fancy” UI components in `components/` (e.g., `FancyText.tsx`, `FancyButton`). Reuse these instead of raw RN primitives where possible.
- Forms commonly use `react-hook-form` with `zodResolver` and schema files in `domain/schemas/`.
- Network errors are normalized via `core/errors/normalizeAxiosError.ts` and `AppError` types; the query client is created in `core/react-query/queryClient.ts`.
- Connectivity is tracked via `core/network/connectivity/ConnectivityProvider.tsx` with a `/health` probe (`core/network/health.ts`) and surfaced via `components/FancyConnectivityBanner.tsx`.
- Push notifications are handled in `services/notifications.tsx`; device tokens are sent to `/notificacoes/device-tokens/:voluntarioId`.

## Environment & integration points
- API base URL and app secret are injected via `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_APP_SECRET_KEY` (see `.env.example`).
- Axios client is configured in `domain/api/api-client.ts` (JWT header + 401 handling).
- Sentry is initialized in `app/_layout.tsx` with replay integration enabled.

## Developer workflows
- Start dev server: `npm run start` (Expo).
- Native builds: `npm run android` / `npm run ios` (Expo run).
- Web: `npm run web`.
- Formatting: `npm run format` / `npm run format:check` (Prettier).

## Examples for common changes
- New entity CRUD: add `domain/api/<Entity>Api.ts`, `domain/services/<Entity>Repository.ts`, DTOs under `domain/dtos/`, optional schema in `domain/schemas/`, and a hook modeled after `useEscalaTemplatesCrud.ts` using `useCrud`.
- New screen: add route in `app/(app)/...` and compose with `Fancy*` components; ensure auth gating is respected via existing layouts.
