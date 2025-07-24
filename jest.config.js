module.exports = {
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            'jest-transform-stub',
        "^@native/(.*)$": "<rootDir>/roze/native/$1",
        "^@roze/(.*)$": "<rootDir>/roze/src/$1",
        "^@origin/(.*)$": "<rootDir>/origin/src/$1",
        "^@lutz/(.*)$": "<rootDir>/lutz/src/$1",
        "^@sosu/(.*)$": "<rootDir>/sosu/src/$1",
        "^@illusive/(.*)$": "<rootDir>/Illusive/src/$1",
        "^@illusicord/(.*)$": "<rootDir>/illusicord/src/$1",
        "^@common/(.*)$": "<rootDir>/common/$1",
        "^@admin/(.*)$": "<rootDir>/admin/$1",
    },
};