import ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { merge } from 'lodash';
// const openapi2Schema = require('./resources/openapi-2.0.json');
// const openapi3Schema = require('./resources/openapi-3.0.json');
// const openapi31Schema = require('./resources/openapi-3.1.json');
import openapi31Schema from './resources/openapi-3.1.json';

import { IJsonSchema, OpenAPI } from 'openapi-types';

export interface IOpenAPISchemaValidator {
  /**
   * Validate the provided OpenAPI doc against this validator's schema version and
   * return the results.
   */
  validate(doc: OpenAPI.Document): OpenAPISchemaValidatorResult;
}

export interface OpenAPISchemaValidatorArgs {
  version: number | string;
  extensions?: IJsonSchema;
}

export interface OpenAPISchemaValidatorResult {
  errors: ErrorObject[];
}

export default class OpenAPISchemaValidator implements IOpenAPISchemaValidator {
  private validator: ValidateFunction;
  constructor(args: OpenAPISchemaValidatorArgs) {
    const v = new ajv({ allErrors: true, strict: false });
    addFormats(v);
    let openApiSchema;
    switch (args.version) {
      case '3.1':
        openApiSchema = openapi31Schema;
        break;
      default:
        openApiSchema = openapi31Schema
    }
    const schema = merge({}, openApiSchema, args ? args.extensions : {});
    v.addSchema(schema);
    this.validator = v.compile(schema);
  }

  public validate(openapiDoc: OpenAPI.Document): OpenAPISchemaValidatorResult {
    if (!this.validator(openapiDoc)) {
      return { errors: this.validator.errors ?? [] };
    } else {
      return { errors: [] };
    }
  }
}
