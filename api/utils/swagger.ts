import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

interface SwaggerDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  servers: Server[];
  paths: {
    [key: string]: object;
  };
  components?: {
    securitySchemes?: {
      [key: string]: {
        type: string;
        scheme: string;
        bearerFormat?: string;
      };
    };
  };
  security?: { [key: string]: string[] }[];
}

interface Server {
  url: string;
  description: string;
}

const loadSwaggerFiles = (): SwaggerDocument => {
  const modulesDir = path.join(__dirname, '../modules');
  const swaggerPaths = [
    path.join(modulesDir, 'user', 'swagger.yaml'),
    path.join(modulesDir, 'expenses', 'swagger.yaml'),
  ];
  const swaggerDocs: SwaggerDocument[] = []; 
  swaggerPaths.forEach((swaggerPath) => {
    if (fs.existsSync(swaggerPath)) {
      const doc = YAML.load(swaggerPath);
      swaggerDocs.push(doc);
    }
  });
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
        description: 'docker server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'local server',
      },
      {
        url: 'https://node-express-ts-template.vercel.app/api',
        description: 'vercel server',
      },
    ],
    paths: mergedPaths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', 
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };
};

export default loadSwaggerFiles;
