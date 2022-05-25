const md5 = require("blueimp-md5");
const publickey = "26880540a6e491e18699ace5ba44aa2d";
const privatekey = "0d4acef2582f511ef0fd56e60222a03b079e81f0";
const ts = new Date().getTime();
const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);
const baseUrl = "https://gateway.marvel.com:443/v1/public";
const characterUrl = `${baseUrl}/characters?ts=${ts}&apikey=${publickey}&hash=${hash}`;
const comicsUrl = `${baseUrl}/comics?ts=${ts}&apikey=${publickey}&hash=${hash}`;
const seriesUrl = `${baseUrl}/series?ts=${ts}&apikey=${publickey}&hash=${hash}`;

export { ts, publickey, hash, baseUrl, characterUrl, comicsUrl, seriesUrl };
