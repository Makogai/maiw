# drivebay — Account & transactional domains (Dealer, Billing, Viewing, Messaging, User, Geography, Experiment)

Supplements `topics/architecture.md`, `topics/domain.md`, and `apps/drivebay/CLAUDE.md` —
does not repeat the domain list or system overview already there. All paths below are
relative to `apps/drivebay/`. Verified against code at commit `8f7840f` (2026-07-15).

## Dealer

**Purpose**: dealer org accounts, membership, and per-dealer storefronts (theme, content,
domains, entitlement gating), linked to listings.

| Class | Role |
|---|---|
| `DealerAccessService` | Resolves a user's primary `DealerAccount` (primary membership, then owner/manager fallback); `canManageStorefront()` gate — `Domains/Dealer/Services/DealerAccessService.php:11,31` |
| `DealerDomainService` | Host normalization, marketplace-vs-storefront host detection, subdomain assignment, custom-domain DNS verification (TXT+CNAME) — `Domains/Dealer/Services/DealerDomainService.php:106,181,258,278` |
| `DealerStandaloneEntitlementService` | Gates standalone-domain access behind `storefront_upgrade_mode` (`free`/`mock`/`contact`); `grantAccess()` flips `entitlement_active` — `Domains/Dealer/Services/DealerStandaloneEntitlementService.php:12,24,35` |
| `DealerStorefrontService` | Default/sanitize/resolve/persist storefront settings (theme/content/social/domain/pages JSON-ish sub-tables), builds public payload + CSS vars — `Domains/Dealer/Services/DealerStorefrontService.php:17,101,268,364` |
| `DealerListingLinker` | Links a newly-created `Listing` to seller's primary dealer; builds storefront listings query (includes legacy rows with `dealer_account_id IS NULL`) — `Domains/Dealer/Services/DealerListingLinker.php:20,47` |
| `DealerMediaService` | Uploads logo/cover/page_background as `MediaAsset`, writes `{role}_media_id` FK on dealer — `Domains/Dealer/Services/DealerMediaService.php:14` |
| `VerifyDealerDomainsCommand` (`dealer:verify-domains`) | Cron-able command re-checking pending custom-domain DNS — `Domains/Dealer/Console/VerifyDealerDomainsCommand.php:14` |

**Models**: `DealerAccount` hasMany `members` (`DealerMember`), `branches`, `listings`,
`storefrontDomains`; hasOne `storefrontTheme`/`storefrontContent`/`storefrontSocialLinks`/
`storefrontDomainSettings`/`storefrontPages` (one row each per dealer, all separate tables) —
`Models/Domains/Dealer/Models/DealerAccount.php:78-161`. Route-model binding uses `slug`,
not `id` (`getRouteKeyName()` — `DealerAccount.php:163`). `DealerMember.membership_role`
(`owner`/`manager`/...) drives access checks.

**Storefront resolution (matches CLAUDE.md, confirmed)**: `ResolveDealerStorefrontHost`
middleware — if host is a marketplace host, pass through in `MODE_MARKETPLACE`; else look up
`DealerStorefrontDomain` by host (must be `verification_status = verified` and dealer
`status = active`), 404 if standalone not enabled, else set `StorefrontContext` to
`MODE_STANDALONE` and switch app locale to the dealer's `default_locale` —
`Http/Middleware/ResolveDealerStorefrontHost.php:24-59`.

**Cross-domain connections**:
- **Dealer → Billing**: `CheckoutService::startStandaloneStorefrontCheckout()` creates an
  invoice/payment for the storefront upgrade; `CheckoutService::fulfillPaidPayment()` calls
  `DealerStandaloneEntitlementService::grantAccess($dealer, $payment)` once the item type is
  `standalone_storefront` — `Domains/Billing/Services/CheckoutService.php:67,135-142`. This is
  the only caller of `grantAccess()` in the codebase.
- **Dealer → User**: `UserRegistrationService::createDealerAccount()` creates the
  `DealerAccount` + first `DealerMember` (role `owner`) at signup when `account_type ===
  'dealer'` — `Domains/User/Services/UserRegistrationService.php:88-130`.
- **Dealer → Messaging/Billing/Invoice**: `Listing.dealer_account_id`, `MessageThread.
  dealer_account_id`, `Invoice.dealer_account_id`, `InvoiceItem.dealer_account_id`, `Payment.
  payer_dealer_account_id` all carry dealer context through unrelated domains.

**Gotcha**: storefront settings are normalized/sanitized in `DealerStorefrontService::
sanitizeSettings()` on every write, so partial payloads silently fall back to defaults —
never assume a raw request payload round-trips unchanged.

## Billing

**Purpose**: invoices/payments for listing promotions and dealer storefront upgrades, via a
swappable payment gateway.

| Class | Role |
|---|---|
| `CheckoutService` | Orchestrates checkout for promotions (`startListingPromotionCheckout`) and storefront upgrade (`startStandaloneStorefrontCheckout`); `fulfillPaidPayment()` is the single fan-out point that activates promotions or grants dealer entitlement — `Domains/Billing/Services/CheckoutService.php:31,67,103` |
| `InvoiceService` | Builds `Invoice`+`InvoiceItem` rows for any billable (polymorphic `billable_type`/`billable_id`) — `Domains/Billing/Services/InvoiceService.php:17` |
| `PaymentCheckoutService` | Read-only presenter for a payment session (mock vs redirect mode) used by the payment confirmation page — `Domains/Billing/Services/PaymentCheckoutService.php:9,29` |
| `StripePaymentGateway` (implements `PaymentGatewayInterface`) | Stripe Checkout session creation, `confirmPayment()`, `handleWebhook()` for `checkout.session.completed` — `Domains/Billing/Gateways/StripePaymentGateway.php:11,25,71,87` |
| `FakePaymentGateway` | Dev/mock gateway (no external calls); used when `billing.gateway` config isn't `stripe` — `Domains/Billing/Gateways/FakePaymentGateway.php` |

**Gateway wiring**: `AppServiceProvider` binds `PaymentGatewayInterface` — uses
`StripePaymentGateway` only if `platform_config('billing.gateway') === 'stripe'` AND the
Stripe class exists AND `drivebay.billing.stripe_secret` is set, else falls back to
`FakePaymentGateway` — `app/Providers/AppServiceProvider.php:44-51`. Webhook route:
`POST /webhooks/stripe` → `StripeWebhookController` — `routes/web.php:181`,
`Http/Controllers/Web/Billing/StripeWebhookController.php:12`. Config keys (no secret
values here): `config/drivebay.php` `billing.stripe_key`/`stripe_secret`/
`stripe_webhook_secret` (`config/drivebay.php:76-80`).

**Stale doc** (**Jira: KAN-15**): `apps/drivebay/CLAUDE.md` and `docs/architecture/system-overview.md` list
"Stripe + PayPal" as payment gateways. **No PayPal gateway class, config keys, or route
exists in code** — only `StripePaymentGateway` and `FakePaymentGateway` implement
`PaymentGatewayInterface` (`Domains/Billing/Gateways/`, `Domains/Billing/Contracts/
PaymentGatewayInterface.php`). Treat PayPal as not-yet-implemented, not as a working
integration.

**Models**: `Invoice` morphTo `billable` (Listing or DealerAccount today), hasMany `items`
(`InvoiceItem`) and `payments` (`Payment`) — `Models/Domains/Billing/Models/Invoice.php:53,83,88`.
`Payment` belongsTo `invoice`, `provider` (`PaymentProvider`), optional `paymentMethod`;
hasMany `refunds` — `Models/Domains/Billing/Models/Payment.php:45-70`. `PaymentProvider.code`
(`'stripe'`/`'fake'`) resolved via `CheckoutService::paymentProviderId()` —
`Domains/Billing/Services/CheckoutService.php:162-167`.

**Cross-domain connections**: Billing → Promotion (`PromotionService::activate()` on paid
promotion items), Billing → Dealer (entitlement grant, above). No Filament admin resource
exists for Invoice/Payment/Refund — billing records aren't manageable in the admin panel
today (`app/Filament/Admin/Resources/` has no Invoices/Payments directory).

## Viewing

**Purpose**: buyer-seller test-drive/viewing appointment scheduling against seller-defined
weekly availability.

| Class | Role |
|---|---|
| `ViewingAppointmentService` | `book()` (validates not-own-listing, active listing, slot availability inside a DB transaction with a re-check to close a race window), `cancel()`, presenters for upcoming/past lists — `Domains/Viewing/Services/ViewingAppointmentService.php:22,53,87,205` |
| `ViewingSlotService` | Computes available slots/dates for a listing from seller weekly rules minus booked appointments — `Domains/Viewing/Services/ViewingSlotService.php:21,81,116` |
| `ViewingSettingsService` | Seller weekly-rule CRUD, per-listing scheduling toggle, meeting-note text, seller timezone resolution — `Domains/Viewing/Services/ViewingSettingsService.php:18,47,77,98,130` |
| `ViewingNotificationService` | Writes `Notification` rows directly (booked/cancelled/reminder), locale-aware — `Domains/Viewing/Services/ViewingNotificationService.php:16,68,139` |
| `ViewingAppointmentLifecycleService` | Cron-driven: day-before reminders, marks past appointments `completed` (seller-timezone aware) — `Domains/Viewing/Services/ViewingAppointmentLifecycleService.php:14,38` |
| `ViewingAppointmentPolicy` | `book()` requires verified email + not own listing; `cancel()` requires being buyer or seller — `Domains/Viewing/Policies/ViewingAppointmentPolicy.php:11,20` |
| `ProcessViewingAppointmentsCommand` | Console entry point invoking the lifecycle service (reminders + completion) — `Domains/Viewing/Console/ProcessViewingAppointmentsCommand.php` |

**Models**: `ListingViewingAppointment` (buyer/seller/listing FKs, `starts_at`/`ends_at`,
`status` enum incl. `confirmed`/`completed`/`cancelled_by_buyer`/`cancelled_by_seller`),
`ListingViewingSetting` (per-listing override), `UserViewingSetting` + `UserViewingWeeklyRule`
(seller default availability) — `Models/Domains/Viewing/Models/*.php`.

**Cross-domain connections**: Viewing → Notification (direct `Notification::create()`, not an
event — no `Events/`/`Listeners/` folder exists under `Domains/Viewing/`). Viewing →
Listing (`seller_user_id`, `status` gating). Policy registered globally in
`AppServiceProvider::boot()` — `Gate::policy(ListingViewingAppointment::class,
ViewingAppointmentPolicy::class)` (`app/Providers/AppServiceProvider.php:67`).

**Gotcha**: slot-availability race is handled with a double-check pattern (check before and
inside the transaction) plus a unique-constraint violation caught by string-matching
`'unique'` in the SQL exception message — `Domains/Viewing/Services/
ViewingAppointmentService.php:47,55,71-79`; fragile if the DB driver's error wording changes.

## Messaging

**Purpose**: buyer↔seller (and internal staff↔user) message threads tied to listings, with
media attachments, typing indicators, and per-user mute settings.

| Class | Role |
|---|---|
| `MessagingService` | `findOrCreateThread()` (listing inquiry) and `findOrCreateInternalThread()` (non-listing, e.g. support); `addMessage()` computes message_type/preview, updates unread counters, delegates to notification+media services — `Domains/Messaging/Services/MessagingService.php:21,56,129` |
| `MessageNotificationService` | Writes `Notification` rows for the recipient (skips if thread muted for them) — `Domains/Messaging/Services/MessageNotificationService.php:18` |
| `MessageMediaService` | Attaches image/video files to a message as `MessageAttachment` + `MediaAsset` — `Domains/Messaging/Services/MessageMediaService.php:22` |
| `MessageThreadSettingsService` | Per-user mute state (`MessageThreadUserSetting`) — `Domains/Messaging/Services/MessageThreadSettingsService.php:15,31,44` |
| `MessageTypingService` | Cache-backed typing indicator (no DB writes) — `Domains/Messaging/Services/MessageTypingService.php:13,22` |

**Models**: `MessageThread` (buyer/seller/listing/dealer FKs, `unread_for_{buyer,seller}_count`,
`source` = `listing_inquiry`|`internal`) hasMany `messages`; `Message` hasMany `attachments`;
`Lead` is a separate model (belongsTo Listing/seller/buyer/DealerAccount) referenced only from
`Listing.php`, not from any Messaging service — likely a legacy/parallel inquiry-capture table,
not part of the active `MessagingService` flow (verify before building on it) —
`Models/Domains/Messaging/Models/Lead.php:42-57`, `Models/Domains/Listing/Models/Listing.php`
(only reference found).

**Cross-domain connections**: Messaging → Notification (direct create, same pattern as
Viewing — no domain Events/Listeners). Messaging → Dealer (`dealer_account_id` carried on
thread creation from `Listing.dealer_account_id`). Messaging → Media (attachments use the
shared `MediaAsset` model, same as Dealer branding).

## User

**Purpose**: identity, registration (private buyer or dealer-owner), email verification,
profile/locale, plus the Spatie-Permission roles that gate staff/admin access.

| Class | Role |
|---|---|
| `UserRegistrationService` | `register()` — creates `User`+`UserProfile` in a transaction; if `account_type === 'dealer'`, also creates the `DealerAccount` and owner `DealerMember` — `Domains/User/Services/UserRegistrationService.php:24,88` |
| `EmailVerificationService` | Issues/verifies 6-digit hashed codes (`EmailVerificationCode`), rate-limited resend, phone normalization helper — `Domains/User/Services/EmailVerificationService.php:14,34,94,113` |
| `UserProfileService` | Updates `UserProfile` fields + phone (via `PhoneNumberNormalizer`) + preferred language — `Domains/User/Services/UserProfileService.php:32` |
| `UserLocaleService` | Persists `preferred_language_code`, resolves effective locale for a (possibly null) user — `Domains/User/Services/UserLocaleService.php:12,23` |
| `AccountDeletionService` | Soft-delete with 7-day grace (`requestDeletion` / `restore` / `purgeExpired`); helpers `isRestorable` / `graceEndsAt` / `daysUntilPurge` (**Jira: KAN-36**, **KAN-41**) — `Domains/User/Services/AccountDeletionService.php` |

**Account restore API (**Jira: KAN-41**)**: login uses `User::withTrashed()`; restorable
self-deletes get `403` + `meta.reason=account_pending_deletion` + `days_remaining`.
`POST /api/v1/auth/account/restore` restores + returns `authPayload`. Listings archived
at deletion stay archived.

**Models**: `User` (`Models/Domains/User/Models/User.php`) uses `Spatie\Permission\Traits\
HasRoles` (`:32,39`) and `Laravel\Sanctum\HasApiTokens` (`:29,37`) — API tokens and roles live
on the same model. Relations: `profile` (hasOne `UserProfile`), `dealerMemberships`,
`listings`, `messageThreadsAsBuyer`/`AsSeller`, `viewingSetting`, `devices`
(`UserDevice`/push tokens), `authSessions` — `User.php:131-208`.

**Permissions/roles (Spatie)**:
- Config: `config/permission.php` — standard Spatie models/tables, guard `web`.
- Seeded roles/permissions: `database/seeders/RolesAndPermissionsSeeder.php` — permissions
  `listings.{view,moderate,manage}`, `users.{view,manage}`, `dealers.{view,manage}`,
  `moderation.manage`, `taxonomy.import`, `billing.view`, `system.settings`; roles `admin`
  (all perms), `moderator` (view+moderate subset), `super_admin` (all perms via
  `Permission::all()`).
- **Staff authorization (**Jira: KAN-10** fixed)**: `User::canAccessPanel()` delegates to
  `StaffAccessService::isStaff()` (`User.php` + `StaffAccessService.php`) — type
  `admin`/`moderator` OR Spatie `admin`/`super_admin`/`moderator`. `AdminUserSeeder`
  already sets both `type = 'admin'` and `super_admin` role.
- Policies use `$user->can('permission.name')` (Spatie's `can` macro via
  `register_permission_check_method`), e.g. `ListingPolicy` —
  `Domains/Listing/Policies/ListingPolicy.php:31,50,55,60`.
- Horizon/Telescope gates also hard-check roles directly:
  `Gate::define('viewHorizon', ... $user?->hasRole('super_admin') || $user?->hasRole('admin'))`
  — `app/Providers/HorizonServiceProvider.php:30-35`.

**Auth/Sanctum config**: `config/auth.php` — default guard `web`
(`env('AUTH_GUARD','web')`), `users` provider model is `App\Models\Domains\User\Models\User`
(`env('AUTH_MODEL', ...)`) — `config/auth.php:17,69`. `config/sanctum.php` — `guard => ['web']`,
`expiration => null` (tokens don't expire by default) — `config/sanctum.php:37,50`. No
Filament Role/Permission admin resource exists (`app/Filament/Admin/Resources/Users/`
manages `User` rows only, with `UserWarnings` and `UserSellingRestrictions` relation
managers — no role editor in the admin UI); role assignment is seeder/code-only today.

## Geography

**Purpose**: countries/regions/cities/districts reference data plus phone-country/dial-code
resolution, cached.

| Class | Role |
|---|---|
| `GeographyService` | `defaultCountryIso2()`/`defaultCountry()` (from `PlatformSettingsService` admin setting, falls back to `drivebay.default_phone_country` config), `phoneCountries()` (1-hour cache), `resolvePhoneCountryIso()` (longest-dial-prefix match), `active{Countries,Regions,Cities,CityDistricts}()`, `bootstrapForMobile()` — `Domains/Geography/Services/GeographyService.php:19,46,59,94,107` |

**Models**: `Country` hasMany `regions`/`cities`; `Region` belongsTo `Country`, hasMany
`City`; `City` belongsTo `Country`/`Region`, hasMany `CityDistrict`; `CityDistrict` belongsTo
`City`. All four models fire `static::saved`/`deleted` hooks that call
`GeographyService::flushCache()` to invalidate the `geography.phone_countries` cache key —
`Models/Domains/Geography/Models/{Country,Region,City,CityDistrict}.php` (each has matching
`:29-38`-ish hook block). Filament resources exist for all four (`Countries`, `Regions`,
`Cities`, `CityDistricts`).

**Cross-domain connections**: Geography → User (`UserProfileService` uses
`GeographyService::phoneCountryDials()` for phone normalization —
`Domains/User/Services/UserProfileService.php:14,48`), Geography → Dealer (country/region/
city FKs on `DealerAccount`).

## Experiment

**Purpose**: an in-house A/B testing system (experiments, variants, weighted assignment by
subject) — **separate from** Laravel Pennant. Do not conflate the two (see gotcha below).

| Class | Role |
|---|---|
| `ExperimentService` | `activeVariantsForRequest()` (bulk resolve for Inertia shared props), `variantFor()` (single experiment), `resolveVariantKey()` (preview override via `?_ab[key]=variant` query param → else weighted random pick, persisted per subject), `assignUser()`, `subjectKey()` (user id, or `X-AB-Subject` header UUID for mobile, or a 1-year cookie for web) — `Domains/Experiment/Services/ExperimentService.php:20,40,70,88,176` |

**Models**: `Experiment` (`key`, `status` = `draft`/`running`/`paused`/...) hasMany
`ExperimentVariant` (`key`, `weight`); `ExperimentAssignment` (unique per
`experiment_id`+`subject_key`, links to a `variant_id`) —
`Models/Domains/Experiment/Models/*.php`. Preview mode: `?_ab[experiment_key]=variant_key`
bypasses normal assignment logic for any experiment status, including `draft` — useful for
QA but means query params can force variants even before an experiment goes `running`
(`ExperimentService.php:117-148`).

**Consumers**: `Http/Middleware/HandleInertiaRequests.php` (shares active variants as Inertia
props), `Http/Controllers/Api/V1/ExperimentApiController.php` (mobile equivalent),
`Http/Controllers/Web/HomeController.php`. Filament `Experiments` resource has an
`AssignmentsRelationManager` for inspecting assignments.

**Pennant feature flags — NOT part of the Experiment domain**: `app/Features/` contains 14
independent Pennant feature classes with no reference to `Experiment`/`ExperimentService`
anywhere in the codebase (verified: no hits for `ExperimentService`/`Experiment::` under
`app/Features/`). They are simple `config()`-backed booleans, e.g.
`StorefrontSubdomain::resolve()` returns `config('drivebay.storefront_subdomain_enabled',
true)` (`app/Features/StorefrontSubdomain.php:9-12`). Full class list: `FuelEconomyEstimate`,
`InstagramDevFallback`, `InstagramPublish`, `InstagramRequireApproval`,
`InstagramUpdateSoldCaption`, `ListingCardHoverPreview`, `ListingCompare`, `Mobile`,
`ModerationAutoPublishImports`, `ModerationRequireAdminPhotoApproval`, `PriceRating`,
`PriceRatingOnCards`, `StorefrontSubdomain`, `VehicleRegistrationEstimate` (all in
`app/Features/`). `config/pennant.php` uses the `database` store (table `features`) by
default. **If a task says "feature flag," check which system it means** — Pennant on/off
switches (`app/Features/`) vs. the custom Experiment A/B system — before writing code.

## Doc-accuracy notes for this pass

1. **PayPal is documented but not implemented** (**Jira: KAN-15**). `apps/drivebay/CLAUDE.md` ("Tech stack",
   "External systems") and `docs/architecture/system-overview.md` both say
   "Stripe + PayPal"; code only has `StripePaymentGateway` + `FakePaymentGateway`
   (`Domains/Billing/Gateways/`), and `config/drivebay.php` billing config has no PayPal
   keys. Treat as future/aspirational, not current behavior.
2. **Pennant and Experiment are unrelated systems** despite both being "feature-flag-shaped"
   — see Experiment section above. Not previously called out anywhere in existing docs.
3. Billing (Invoice/Payment/Refund) and Messaging/Viewing have **no Filament admin
   resources** — support/ops work on these currently requires Tinker/DB access, not the
   admin panel.
