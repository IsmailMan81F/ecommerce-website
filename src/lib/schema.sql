-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Category (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL UNIQUE,
  description text,
  image_url character varying,
  id uuid NOT NULL,
  CONSTRAINT Category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Product (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL UNIQUE,
  description text,
  category_id uuid NOT NULL,
  price integer NOT NULL,
  old_price integer,
  best_seller boolean NOT NULL,
  is_out_of_stock boolean NOT NULL,
  details json,
  id uuid NOT NULL,
  CONSTRAINT Product_pkey PRIMARY KEY (id),
  CONSTRAINT Product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.Category(id)
);
CREATE TABLE public.product_image (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id uuid NOT NULL DEFAULT gen_random_uuid(),
  image_url character varying NOT NULL DEFAULT ''::character varying UNIQUE,
  id uuid NOT NULL,
  CONSTRAINT product_image_pkey PRIMARY KEY (id),
  CONSTRAINT product_image_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.Product(id)
);
CREATE TABLE public.product_variant (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id uuid NOT NULL DEFAULT gen_random_uuid(),
  size character varying NOT NULL,
  color character varying NOT NULL,
  stock integer NOT NULL,
  id uuid NOT NULL,
  CONSTRAINT product_variant_pkey PRIMARY KEY (id),
  CONSTRAINT product_variant_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.Product(id)
);
CREATE TABLE public.order (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  phone_number character varying NOT NULL,
  wilaya character varying NOT NULL,
  commune character varying NOT NULL,
  delivery_method USER-DEFINED,
  address character varying,
  notes text,
  status USER-DEFINED NOT NULL,
  total_price integer NOT NULL,
  id text NOT NULL,
  CONSTRAINT order_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_order (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id text,
  product_id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  quantity integer NOT NULL,
  id uuid NOT NULL,
  CONSTRAINT product_order_pkey PRIMARY KEY (id),
  CONSTRAINT product_order_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order(id),
  CONSTRAINT product_order_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.Product(id),
  CONSTRAINT product_order_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variant(id)
);
CREATE TABLE public.message (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying,
  phone_number character varying NOT NULL,
  inquery_type character varying,
  subject text NOT NULL,
  message_content text NOT NULL,
  notes text,
  status USER-DEFINED NOT NULL,
  order_id text,
  CONSTRAINT message_pkey PRIMARY KEY (id),
  CONSTRAINT message_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.Store (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email character varying NOT NULL UNIQUE,
  phone_number character varying NOT NULL,
  country character varying NOT NULL,
  wilaya character varying NOT NULL,
  commune character varying,
  street_address character varying,
  google_maps_url text NOT NULL,
  instagram_url text NOT NULL,
  tiktok_url text NOT NULL,
  facebook_url text NOT NULL,
  whatsapp_url character varying NOT NULL,
  delivery_service boolean NOT NULL,
  office_fee integer,
  home_fee integer,
  opening_schedule json NOT NULL,
  product_variants json NOT NULL,
  CONSTRAINT Store_pkey PRIMARY KEY (id)
);