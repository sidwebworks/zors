interface IPlugin {
  name: string;
}

export class PluginService {
  public plugins: Map<string, IPlugin> = new Map();
}
