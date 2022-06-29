import { camelcaseOptionName, removeBrackets } from "../../lib/utils";

/**
 * Creates a new instance of option object
 */
export class Option {
  name: string;
  aliases: string[] = [];
  isBoolean: boolean = false;
  isRequired: boolean = false;
  isNegated: boolean = false;
  default?: any;
  type?: any[];

  constructor(
    public raw: string,
    public description: string,
    opts: { default?: any; type?: any[] }
  ) {
    const { type, default: defaultValue = null } = opts || {};

    this.default = defaultValue;
    this.type = type;

    this.raw = raw.replace(/\.\*/g, "");

    this.aliases = removeBrackets(raw)
      .split(",")
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, "");

        if (name.startsWith("no-")) {
          this.isNegated = true;
          name = name.replace(/^no-/, "");
        }

        return camelcaseOptionName(name);
      })
      .sort((a, b) => (a.length > b.length ? 1 : -1));

    this.name = this.aliases[this.aliases.length - 1];

    if (this.isNegated && this.default == null) {
      this.default = true;
    }

    if (raw.includes("<")) {
      this.isRequired = true;
    } else if (raw.includes("[")) {
      this.isRequired = false;
    } else {
      this.isBoolean = true;
    }
  }
}
