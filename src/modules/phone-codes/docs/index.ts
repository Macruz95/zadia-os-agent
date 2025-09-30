// Documentation exports for phone-codes module

// This file serves as an index for documentation files
// The actual documentation is in markdown format:

// - README.md: General usage and overview
// - API.md: Detailed API documentation

export const PHONE_CODES_DOCS = {
  readme: './README.md',
  api: './API.md'
} as const;

export type PhoneCodesDocs = typeof PHONE_CODES_DOCS;