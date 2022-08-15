import { camelcaseOptionName, removeBrackets } from '../../lib/utils';

/**
 * Creates a new instance of option object
 */
export class Option {
  name: string;
  aliases: string[] = [];
  isBoolean: boolean = false;
  isRequired: boolean = false;
  isVariadic: boolean = false;
  isNegated: boolean = false;
  default?: any;

  constructor(
    public raw: string,
    public description: string,
    opts: { default?: any }
  ) {
    const { default: defaultValue = null } = opts || {};

    this.default = defaultValue;

    this.raw = raw.replace(/\.\*/g, '');

    this.isVariadic = /\w\.\.\.[>\]]$/.test(raw);

    this.aliases = removeBrackets(raw)
      .split(',')
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, '');

        if (name.startsWith('no-')) {
          this.isNegated = true;
          name = name.replace(/^no-/, '');
        }

        return camelcaseOptionName(name);
      })
      .sort((a, b) => (a.length > b.length ? 1 : -1));

    this.name = this.aliases.slice(-1)[0];

    if (this.isNegated && this.default == null) {
      this.default = true;
    }

    if (raw.includes('<')) {
      this.isRequired = true;
    } else if (raw.includes('[')) {
      this.isRequired = false;
    } else {
      this.isBoolean = true;
    }
  }
}
