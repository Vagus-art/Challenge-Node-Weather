import express, { NextFunction, Request, Response } from 'express';
import routes from './routes';
import cors from 'cors';
import {
  endpointNotFound,
  unauthorized,
  unhandledServerError,
  WeatherAPIError,
} from './helpers/errorResponses';
import { UnauthorizedError } from 'express-jwt';

const app = express();

app.use(express.json());

// cors permitir a todos, en este caso no voy a profundizar en los permisos de cors
app.use(cors({ origin: '*' }));

app.use(routes);

// error tirado si no hay coincidencia en rutas
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = endpointNotFound;
  next(error);
});

// handler de error de express-jwt, lo transformo a mi formato de errores
app.use(
  (
    error: UnauthorizedError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error.name === 'UnauthorizedError') {
      throw unauthorized;
    }
    next(error);
  }
);

// handler de errores
// revisa si el error tirado tiene la propiedad "cod", que indica el status del response
// y si no la tiene, tira un unhandled server error y loguea en consola el error,
// para que los usuarios normales
// no puedan ver el error del server
app.use(
  (error: WeatherAPIError, req: Request, res: Response, next: NextFunction) => {
    if (!error.cod) {
      // tslint:disable-next-line: no-console
      console.log(error);
    }
    res
      .status(Number.parseInt(error.cod, 10) || 500)
      .send(error.cod ? error : unhandledServerError);
  }
);
export default app;
