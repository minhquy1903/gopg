export const IMPORTED_PACKAEG = {
  EXIST: true,
  NOT_EXIST: false,
};

export const IMPORT_BLOCK_REGEX =
  /import\s*\(\s*([\s\S]*?)\s*\)|import\s+"([^"]+)"/g;

export const PACKAGE_LINE_REGEX = /package\s+\w+/;
