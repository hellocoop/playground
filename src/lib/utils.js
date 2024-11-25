export const json = {
	copy: (json) => JSON.parse(JSON.stringify(json)),
	compare: (json1, json2) => JSON.stringify(json1) === JSON.stringify(json2)
};