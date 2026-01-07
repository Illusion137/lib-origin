-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.playlists (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_uid uuid DEFAULT auth.uid(),
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  pinned boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  public boolean NOT NULL DEFAULT false,
  deleted boolean NOT NULL DEFAULT false,
  sort text NOT NULL DEFAULT 'OLDEST'::text,
  inherited_playlists jsonb NOT NULL DEFAULT '[]'::jsonb,
  inherited_searchs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT playlists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.releases (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title jsonb NOT NULL DEFAULT '{"name": "", "uris": []}'::jsonb,
  artist jsonb NOT NULL DEFAULT '[]'::jsonb,
  explicit boolean NOT NULL DEFAULT false,
  type text NOT NULL DEFAULT 'SINGLE'::text,
  date timestamp with time zone NOT NULL DEFAULT now(),
  track_uuid uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT releases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tracks (
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT ''::text,
  artists jsonb NOT NULL DEFAULT '[]'::jsonb,
  album jsonb NOT NULL DEFAULT '{"name": []}'::jsonb,
  duration smallint NOT NULL DEFAULT 0,
  prods jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  explicit boolean NOT NULL DEFAULT false,
  plays integer NOT NULL DEFAULT 0,
  service_uris jsonb NOT NULL DEFAULT '[]'::jsonb,
  artwork_url text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tracks_pkey PRIMARY KEY (uuid)
);
CREATE TABLE public.uptracks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  track_uuid uuid NOT NULL,
  playlist_uuid uuid NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uptracks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.utracks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_uid uuid NOT NULL DEFAULT auth.uid(),
  track_uuid uuid NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT utracks_pkey PRIMARY KEY (id)
);