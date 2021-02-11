// Import dependancies
import {
	ReadStream,
	createReadStream,
	createWriteStream,
	WriteStream,
} from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream";
import { promisify } from "util";

const pipe = promisify(pipeline);

// Function which zips the given file into the /tmp folder
export const zipping = async (
	pathToFile: string,
	tmpFilePath: string
): Promise<void> => {
	const gzip = createGzip();
	const zipSource: ReadStream = createReadStream(pathToFile);
	const zipDest: WriteStream = createWriteStream(tmpFilePath);
	await pipe(zipSource, gzip, zipDest);
	zipDest.close();
};
