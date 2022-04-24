import * as enums from "./enum";
import { readdirSync } from "fs";
import { kebabCase } from "lodash";

export type Overlap = { enumValue: string; match: string };
export const buildDirectoryFilesMessage = (directoryFilenames: string[]) =>
  `Directory files: [${directoryFilenames.join(", ")}]`;
export const buildMissingEnumFileMessage =
  (enumName: string) =>
  ([enumValue, filename]: [string, string]) =>
    `enum "${enumName}.${enumValue}" must have corresponding file "${filename}"`;
export const buildMessageOverlappingEnums = (overlaps: Overlap[]) =>
  `Enums values are overlapping: \n${overlaps
    .map((overlap) => ` - ${overlap.enumValue} <-> ${overlap.match}`)
    .join("\n")}`;
export const buildMessageMissingFiles = (missingFiles: string[]) =>
  `Test enum are declared but files for them are not found: [${missingFiles.join("\n\n*********\n\n")}]`;
export const enumValueToFilename = (enumValue: string) => `${kebabCase(enumValue)}.spec.ts`;

export const isOverlapping = (enumValue1: string, index1: number) => (enumValue2: string, index2: number) =>
  index1 !== index2 && enumValue2.includes(enumValue1);
export const toOverlappingArray = (strings: string[]) => (acc: Overlap[], enumValue: string, index: number) => {
  const match = strings.find(isOverlapping(enumValue, index));
  return match === undefined ? acc : [...acc, { enumValue, match }];
};
export const getOverlapping = (strings: string[]) => strings.reduce(toOverlappingArray(strings), []);
export const validateSubstringOverlapping = (payload: { enums: typeof enums }) => {
  const overlaps = getOverlapping(Object.values(payload.enums).map(Object.values).flat());
  if (overlaps.length > 0) {
    throw Error(buildMessageOverlappingEnums(overlaps));
  }
};
export const toEnumValueFilenamePair = (enumValue: string): [string, string] => [
  enumValue,
  enumValueToFilename(enumValue),
];
export const checkMissingFiles =
  (directory: string) =>
  ([enumName, enumObject]) => {
    const directoryFilenames = readdirSync(directory);
    const errors = Object.values(enumObject as { [key: string]: string })
      .map(toEnumValueFilenamePair)
      .filter(([, filename]) => !directoryFilenames.includes(filename))
      .map(buildMissingEnumFileMessage(enumName));
    if (errors.length === 0) {
      return;
    }
    errors.push(buildDirectoryFilesMessage(directoryFilenames));
    return errors.join("\n");
  };
export const validateFilePresence = (payload: { directory: string; enums: Partial<typeof enums> }) => {
  const missingFiles = Object.entries(payload.enums)
    .map(checkMissingFiles(payload.directory))
    .filter((error) => error !== undefined) as string[];
  if (missingFiles.length > 0) {
    throw Error(buildMessageMissingFiles(missingFiles));
  }
};
export const testDirectory = `${process.cwd()}/tests`;
export default () => {
  validateSubstringOverlapping({
    enums,
  });
  validateFilePresence({
    directory: `${testDirectory}/case`,
    enums: { TestCaseDescribe: enums.TestCaseDescribe },
  });
  validateFilePresence({
    directory: `${testDirectory}/common`,
    enums: { TestCommonDescribe: enums.TestCommonDescribe },
  });
};
