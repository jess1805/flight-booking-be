import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

type RequestPart = 'body' | 'query' | 'params';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

function parsePart(req: Request, part: RequestPart, schema: ZodSchema): void {
  const parsed = schema.parse(req[part]);
  Object.assign(req[part], parsed);
}

export function validate(schemas: ValidationSchemas | ZodSchema, part: RequestPart = 'body') {
  if ('parse' in schemas) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        parsePart(req, part, schemas);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          next(new ValidationError('Validation failed', error.flatten()));
          return;
        }
        next(error);
      }
    };
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) parsePart(req, 'body', schemas.body);
      if (schemas.query) parsePart(req, 'query', schemas.query);
      if (schemas.params) parsePart(req, 'params', schemas.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', error.flatten()));
        return;
      }
      next(error);
    }
  };
}
