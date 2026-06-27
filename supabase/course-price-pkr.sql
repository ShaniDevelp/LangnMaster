-- Course prices are denominated in PKR now (not USD).
-- Rename the column so the schema matches the displayed currency.

alter table public.courses rename column price_usd to price_pkr;
