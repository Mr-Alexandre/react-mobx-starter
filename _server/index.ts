import 'reflect-metadata';
import * as ip from 'ip';
import { Action, useExpressServer } from 'routing-controllers';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookie from 'cookie';

export const PORT = 8181;
export const HOSTNAME = ip.address();
export const DELAY = 1500; //milliseconds
export const MEDIA_PATH = 'tmp/media';
export const STATIC_URL_PREFIX = 'static';
export const PRIVATE_KEY = 'eSuVuDj0cskWX3VWM3UflOLIPKEQPXdI';
export const SIRE_URL = 'http://localhost:3000';

export const fileUploadOptions = {
	storage: multer.diskStorage({
		destination: (req: any, file: any, cb: any) => {
			const dir = path.join(__dirname, MEDIA_PATH);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			cb(null, dir);
		},
		filename: (req: any, file: any, cb: any) => {
			cb(null, file.originalname);
		},
	}),
};

let app = express(); // your created express server

const upload = multer(fileUploadOptions);

app.use(upload.single('file'));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
	cors({
		origin: SIRE_URL,
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
	})
);
// app.options('*', cors());

app.use(`/${STATIC_URL_PREFIX}`, express.static(path.join(__dirname, 'tmp')));

// creates express app, registers all controllers routes and returns you express app instance
useExpressServer(app, {
	authorizationChecker: async (action: Action, roles: string[]) => {
		const cookieString = action.request.headers?.['cookie'];
		const parsedCookie = cookie.parse(cookieString);
		if (parsedCookie.access_token) {
			return true;
		}

		return false;
	},
	classTransformer: true,
	controllers: [path.join(__dirname + '/controllers/*.ts')], // we specify controllers we want to use
});

// run express application on port 3000
// https://www.section.io/engineering-education/how-to-get-ssl-https-for-localhost/
app.listen(PORT, () => {
	console.log(
		`API server started, Available on: http://${HOSTNAME}:${PORT}/`
	);
});
