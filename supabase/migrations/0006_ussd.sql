-- Basic-phone access: a linked phone number with its own PIN for USSD, and a short numeric
-- trader code that can be typed on a keypad or printed on a stall sticker.
alter table pv.users
  add column phone text unique check (phone is null or phone ~ '^\+[0-9]{8,15}$'),
  add column ussd_pin_hash text,
  add column merchant_code text unique check (merchant_code is null or merchant_code ~ '^[0-9]{8}$');

alter table pv.cashafrica_transactions drop constraint cashafrica_transactions_transport_check;
alter table pv.cashafrica_transactions
  add constraint cashafrica_transactions_transport_check check (transport in ('nfc', 'cashscan', 'tap_simulate', 'ussd'));
