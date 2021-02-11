// Import dependancies
import { createReadStream, createWriteStream, ReadStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { createGunzip, unzip } from "zlib";

const pipe = promisify(pipeline);

// Function which unzips the received file
// export const unzipping = async (pathToZip: string): Promise<void> => {
// 	const zipSource: ReadStream = createReadStream(pathToZip);
// 	await asyncUnzip(zipSource.read());
// };

export const unzipping = async (pathToDest: string): Promise<void> => {
	const gunzip = createGunzip();
	const zipSource = createReadStream(`${pathToDest}.gz`);
	const fileDest = createWriteStream(pathToDest);
	await pipe(zipSource, gunzip, fileDest);
	fileDest.close();
};
