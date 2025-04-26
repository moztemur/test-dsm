import ts from 'typescript';
import path from 'path';

const getTsConfig = (tsConfigPath: string = 'tsconfig.json') => {
  const configPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    tsConfigPath
  );

  if (configPath) {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    return parsedConfig.raw.compilerOptions;
  }

  return {}
}

export { getTsConfig }
