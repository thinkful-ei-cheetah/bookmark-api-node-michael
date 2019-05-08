CREATE TYPE ratings AS ENUM (
  '1',
  '2',
  '3',
  '4',
  '5'
);

CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  "desc" TEXT,
  rating ratings NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);