import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

interface SwaggerDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  servers:server[]
  paths: {
    [key: string]: object;
  };
}

interface server {
  url: string,
  description: string,
}

const loadSwaggerFiles = (): SwaggerDocument => {
  const apiDir = path.join(__dirname, '../api');
  const modules = fs.readdirSync(apiDir);

  const swaggerDocs: SwaggerDocument[] = modules
    .map((module) => {
      const swaggerPath = path.join(apiDir, module, 'swagger.yaml');
      if (fs.existsSync(swaggerPath)) {
        return YAML.load(swaggerPath) as SwaggerDocument;
      }
      return null;
    })
    .filter((doc): doc is SwaggerDocument => doc !== null);

  const mergedPaths = swaggerDocs.reduce((acc, doc) => ({ ...acc, ...doc.paths }), {});

  return {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:9000/api',
        description: 'docker server'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'local server'
      }
    ],
    
    paths: mergedPaths,
  };
};

export default loadSwaggerFiles;
