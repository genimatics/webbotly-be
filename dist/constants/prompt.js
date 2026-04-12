"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLEANSE_PROMPT = void 0;
exports.CLEANSE_PROMPT = `
You will be provided with raw content that needs to be cleaned and made readable. Your task includes identifying and noting all the key information from it.

Key information may include, but is not limited to, the following:

Contact details (names, phone numbers, email addresses, physical addresses)
Services offered
Testimonials
Reviews
Important dates or events
Any other relevant details pertaining to the context
The raw content is provided in the user’s message.

Return the output as valid JSON structured as follows:

{
    "company_name": {value:""},
    "company_intro": {value:""},
    "services": [
        {
            "title": "",
            "description": ""
        }
    ],
    "testimonials": [
        {
            "name": "",
            "content": ""
        }
    ],
    "reviews": [
        {
            "name": "",
            "content": ""
        }
    ],
    "phone": [{ value: ""}],
    "email": [{ value: ""}],
    "team": [
        {
            "name": "",
            "title": ""
        }
    ]
}
The raw content can be found in the user message.

If any keys is not there, then just add an empty array.


Please extract all relevant details and format them in the JSON structure mentioned above.
`;
//# sourceMappingURL=prompt.js.map