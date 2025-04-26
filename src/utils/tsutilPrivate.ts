import path from 'path';

async function importTsModule(tsFilePath: string, compilerOptions: object): Promise<any> {
  try {
    const tsNode = await import('ts-node');
    tsNode.register({
      transpileOnly: true, // optional: faster, skip type checking
      compilerOptions,
    });
  
    const absPath = path.resolve(tsFilePath);
    const mod = await import(absPath);
  
    return mod;
  } catch (error) {
    console.error('Error importing TypeScript module:', error);
    throw error;
  }
}


export { importTsModule }
