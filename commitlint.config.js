module.exports = {
  parserPreset: "conventional-changelog-conventionalcommits",
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["core", "modules", "functions", "datalayer", "config", "deps", "misc"]
    ],
    "scope-empty": [2, "never"]
  }
};
