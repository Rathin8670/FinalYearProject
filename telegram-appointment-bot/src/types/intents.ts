export type BookingIntent = {
  type: "BOOK_APPOINTMENT";
  doctorName?: string;  // "doc 1"
  date?: string;        // "YYYY-MM-DD"
  time?: string;        // "HH:MM" 24h
};

export type UnknownIntent = {
  type: "UNKNOWN";
};

export type ParsedIntent = BookingIntent | UnknownIntent;
